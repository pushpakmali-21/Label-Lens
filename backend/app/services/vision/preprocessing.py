"""
app/services/vision/preprocessing.py
──────────────────────────────────────
Image preprocessing pipeline.

Provides two implementations selected at call time:

``preprocess_image()`` — public entry point
    If OpenCV (``cv2``) is available in the current environment, runs the
    real 3-step pipeline (denoise → deskew → CLAHE contrast normalisation).
    If ``cv2`` is absent, falls back to the Sprint 1 passthrough stub with
    a clear log warning — the rest of the pipeline continues normally.

No ``cv2`` import appears at module level; this file is always import-safe.

Real pipeline steps (when cv2 is available)
────────────────────────────────────────────
1. **Denoise** — ``cv2.fastNlMeansDenoisingColored`` with moderate h=10.
2. **Deskew**  — Canny edge → HoughLinesP → median angle → affine warp.
   Corrects rotations up to ±15 degrees; larger angles are left unchanged
   to avoid distorting intentionally vertical text on cylindrical cans.
3. **CLAHE contrast normalisation** — applied to the L-channel in LAB
   colour space (clipLimit=2.0, tileGridSize=8×8), then merged back.

The processed image is returned as base64-encoded JPEG (quality 95) in
``PreprocessingResult.processed_image_b64`` for the downstream detector.

Sprint 2 → Sprint 3 upgrade path
──────────────────────────────────
When OpenCV is added to requirements.txt, this module automatically uses
the real implementation — no other code changes are needed.
"""

from __future__ import annotations

import base64
import logging
import math
from typing import Optional

from app.services.vision.types import PreprocessingResult

logger = logging.getLogger(__name__)


# ── Public entry point ─────────────────────────────────────────────────────────

def preprocess_image(
    image_bytes: bytes,
    *,
    denoise: bool = True,
    deskew: bool = True,
    normalise_contrast: bool = True,
) -> PreprocessingResult:
    """
    Preprocess a raw image for the vision pipeline.

    Attempts to use the real OpenCV pipeline; falls back to a passthrough
    stub when ``cv2`` is not installed.

    Args:
        image_bytes:        Raw bytes of the uploaded image (JPEG / PNG).
        denoise:            Apply non-local means denoising.
        deskew:             Detect and correct document skew (±15° limit).
        normalise_contrast: Apply CLAHE contrast normalisation.

    Returns:
        ``PreprocessingResult`` with step metadata and the processed image
        as base64 in ``processed_image_b64``.
    """
    try:
        import cv2  # type: ignore[import]  # noqa: F401
        return _preprocess_real(image_bytes, denoise=denoise, deskew=deskew, normalise_contrast=normalise_contrast)
    except ImportError:
        logger.warning(
            "cv2 (opencv-python) not installed — using passthrough preprocessing stub. "
            "Install with: pip install opencv-python-headless"
        )
        return _preprocess_stub(image_bytes)


# ── Real OpenCV implementation ────────────────────────────────────────────────

def _preprocess_real(
    image_bytes: bytes,
    *,
    denoise: bool,
    deskew: bool,
    normalise_contrast: bool,
) -> PreprocessingResult:
    """
    Full OpenCV preprocessing pipeline.

    Called only when cv2 is available.  All cv2 references are local
    so this function never causes an ImportError at module level.
    """
    import cv2
    import numpy as np  # type: ignore[import]

    steps: list[str] = []

    # Decode bytes → numpy BGR image
    nparr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        # Unreadable image — fall back to passthrough
        logger.warning("cv2.imdecode returned None — image may be corrupt; using passthrough.")
        return _preprocess_stub(image_bytes)

    orig_h, orig_w = img.shape[:2]

    # ── Step 1: Denoise ───────────────────────────────────────────────────────
    if denoise:
        img = cv2.fastNlMeansDenoisingColored(img, None, h=10, hColor=10,
                                               templateWindowSize=7,
                                               searchWindowSize=21)
        steps.append("denoise_nlm")

    # ── Step 2: Deskew ────────────────────────────────────────────────────────
    deskew_angle = 0.0
    if deskew:
        angle = _detect_skew_angle(img)
        if abs(angle) > 0.3:  # ignore sub-pixel jitter
            img = _rotate_image(img, angle)
            deskew_angle = angle
            steps.append(f"deskew_{angle:.2f}deg")

    # ── Step 3: CLAHE contrast normalisation ──────────────────────────────────
    if normalise_contrast:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l_ch, a_ch, b_ch = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_ch = clahe.apply(l_ch)
        lab = cv2.merge([l_ch, a_ch, b_ch])
        img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        steps.append("clahe_contrast")

    proc_h, proc_w = img.shape[:2]

    # Encode processed image as base64 JPEG (quality 95)
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, 95]
    _, buf = cv2.imencode(".jpg", img, encode_params)
    processed_b64 = base64.b64encode(buf.tobytes()).decode("utf-8")

    return PreprocessingResult(
        original_width=orig_w,
        original_height=orig_h,
        processed_width=proc_w,
        processed_height=proc_h,
        deskew_angle_deg=deskew_angle,
        denoise_applied=denoise,
        contrast_normalised=normalise_contrast,
        steps_applied=steps,
        processed_image_b64=processed_b64,
    )


def _detect_skew_angle(img: "np.ndarray") -> float:  # type: ignore[name-defined]
    """
    Estimate the document skew angle using Canny + HoughLinesP.

    Returns angle in degrees.  Angles > ±15° are clamped to 0 (no
    correction) to avoid distorting intentional orientations on
    cylindrical packaging.
    """
    import cv2
    import numpy as np

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(
        edges, 1, math.pi / 180, threshold=100,
        minLineLength=100, maxLineGap=10,
    )
    if lines is None:
        return 0.0

    angles: list[float] = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if x2 != x1:
            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
            angles.append(angle)

    if not angles:
        return 0.0

    median_angle = float(np.median(angles))
    # Clamp: only correct small skews
    if abs(median_angle) > 15.0:
        return 0.0
    return median_angle


def _rotate_image(img: "np.ndarray", angle: float) -> "np.ndarray":  # type: ignore[name-defined]
    """
    Rotate image by ``angle`` degrees around its centre, expanding the
    canvas to avoid clipping corners.
    """
    import cv2
    import numpy as np

    h, w = img.shape[:2]
    cx, cy = w // 2, h // 2

    rotation_matrix = cv2.getRotationMatrix2D((cx, cy), angle, 1.0)

    # Compute new bounding box dimensions after rotation
    cos_a = abs(rotation_matrix[0, 0])
    sin_a = abs(rotation_matrix[0, 1])
    new_w = int(h * sin_a + w * cos_a)
    new_h = int(h * cos_a + w * sin_a)

    # Adjust the translation component
    rotation_matrix[0, 2] += (new_w / 2) - cx
    rotation_matrix[1, 2] += (new_h / 2) - cy

    return cv2.warpAffine(
        img, rotation_matrix, (new_w, new_h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REPLICATE,
    )


# ── Sprint 1 passthrough stub (fallback) ──────────────────────────────────────

def _preprocess_stub(image_bytes: bytes) -> PreprocessingResult:
    """Passthrough stub — returns image as-is when cv2 is not available."""
    processed_b64 = base64.b64encode(image_bytes).decode("utf-8")
    return PreprocessingResult(
        original_width=0,    # sentinel: dimensions unknown without cv2
        original_height=0,
        processed_width=0,
        processed_height=0,
        deskew_angle_deg=0.0,
        denoise_applied=False,
        contrast_normalised=False,
        steps_applied=["passthrough_stub"],
        processed_image_b64=processed_b64,
    )
