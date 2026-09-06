"""
app/services/vision/preprocessing.py
──────────────────────────────────────
Sprint 2 stub: OpenCV image preprocessing pipeline.

Real implementation (Sprint 2) will:
  1. Denoise — cv2.fastNlMeansDenoisingColored
  2. Deskew  — Hough line transform → affine rotation correction
  3. Contrast normalise — CLAHE on luminance channel

No OpenCV dependency is imported here; this module is import-safe in Sprint 1.
"""

from __future__ import annotations

import base64
from typing import Optional

from app.services.vision.types import PreprocessingResult


def preprocess_image(
    image_bytes: bytes,
    *,
    denoise: bool = True,
    deskew: bool = True,
    normalise_contrast: bool = True,
) -> PreprocessingResult:
    """
    Preprocess a raw image for the vision pipeline.

    Sprint 1 — stub: returns a ``PreprocessingResult`` with identity metadata
    (original dimensions unknown without OpenCV, so set to 0×0 as sentinel).
    The processed image is returned as-is (re-encoded base64 of the original bytes).

    Sprint 2 — replace body with real OpenCV operations.

    Args:
        image_bytes: Raw bytes of the uploaded image (JPEG / PNG).
        denoise: Apply non-local means denoising.
        deskew: Detect and correct document skew.
        normalise_contrast: Apply CLAHE contrast normalisation.

    Returns:
        PreprocessingResult with step metadata and processed image bytes (base64).
    """
    # Sprint 1 stub — passthrough
    steps: list[str] = ["passthrough_stub"]

    processed_b64 = base64.b64encode(image_bytes).decode("utf-8")

    return PreprocessingResult(
        original_width=0,    # sentinel: OpenCV not available in Sprint 1
        original_height=0,
        processed_width=0,
        processed_height=0,
        deskew_angle_deg=0.0,
        denoise_applied=False,
        contrast_normalised=False,
        steps_applied=steps,
        processed_image_b64=processed_b64,
    )
