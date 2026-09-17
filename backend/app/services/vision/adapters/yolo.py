"""
app/services/vision/adapters/yolo.py
──────────────────────────────────────
Optional YOLOv8 object-detection adapter.

``YOLOv8Detector`` satisfies the ``VisionDetector`` protocol and plugs
directly into ``VisionPipeline`` as a drop-in replacement for ``StubDetector``.

Dependency guard
────────────────
``ultralytics`` is imported lazily inside ``__init__`` so that this module
can be imported at any time without crashing in environments where YOLOv8
is not installed.  A clear ``ImportError`` is raised at construction time
(not at module import time) when the package is missing.

Installation (CPU)::

    pip install ultralytics

Installation (GPU, CUDA 12)::

    pip install ultralytics torch torchvision --index-url https://download.pytorch.org/whl/cu121

Label mapping
─────────────
The model is expected to be trained (or fine-tuned) to detect the following
class names — the adapter maps YOLO integer class IDs to the label strings
the rest of the pipeline understands:

    0 → manufacturer_panel
    1 → net_qty_string
    2 → consumer_care_panel
    3 → coin
    4 → qr_code
    5 → mrp_block        (future)

Any class not in the map is silently skipped so that a model with extra
classes does not break the pipeline.

Usage::

    from app.services.vision.adapters.yolo import YOLOv8Detector
    from app.services.vision.pipeline import VisionPipeline

    pipeline = VisionPipeline(detector=YOLOv8Detector("weights/label_lens_v1.pt"))
    result = pipeline.run(image_b64)
"""

from __future__ import annotations

import base64
import binascii
from typing import Any

from app.services.vision.types import BoundingBox, DetectedRegion

# ── Class-ID → region label map ───────────────────────────────────────────────
_CLASS_ID_TO_LABEL: dict[int, str] = {
    0: "manufacturer_panel",
    1: "net_qty_string",
    2: "consumer_care_panel",
    3: "coin",
    4: "qr_code",
    5: "mrp_block",
}

# Minimum confidence below which a detection is discarded
_MIN_DETECTION_CONF: float = 0.35


class YOLOv8Detector:
    """
    Real YOLOv8 object-detection adapter.

    Satisfies the ``VisionDetector`` protocol — plug into ``VisionPipeline``
    as ``detector=YOLOv8Detector(...)``.

    Raises ``ImportError`` at construction time (not at module import)
    when ``ultralytics`` is not installed.

    Args:
        model_path: Path to a ``.pt`` weights file.  Use a model trained on
                    LabelLens classes (see module docstring for label map).
        conf_threshold: Minimum detection confidence to include a region.
                        Defaults to 0.35.
        device:    Inference device — ``"cpu"``, ``"cuda"``, or ``"mps"``.
                   Defaults to ``"cpu"`` for safety; set to ``"cuda"`` when a
                   GPU is available.
    """

    def __init__(
        self,
        model_path: str,
        conf_threshold: float = _MIN_DETECTION_CONF,
        device: str = "cpu",
    ) -> None:
        try:
            from ultralytics import YOLO  # type: ignore[import]
        except ImportError as exc:
            raise ImportError(
                "YOLOv8Detector requires the 'ultralytics' package.\n"
                "Install it with:  pip install ultralytics\n"
                f"Original error: {exc}"
            ) from exc

        self._model: Any = YOLO(model_path)
        self._model.to(device)
        self._conf_threshold = conf_threshold

    # ── Public API (satisfies VisionDetector protocol) ─────────────────────────

    def detect(self, image_b64: str) -> list[DetectedRegion]:
        """
        Run YOLOv8 inference on a base64-encoded image.

        The image is decoded from base64 and passed directly to the YOLO
        model as a NumPy array (via ``cv2.imdecode``).

        If the base64 string is invalid or ``cv2`` is unavailable, returns
        an empty list rather than raising — the pipeline handles this as
        "no regions detected".

        Args:
            image_b64: Base64-encoded JPEG or PNG image string.

        Returns:
            List of ``DetectedRegion`` objects above the confidence threshold.
        """
        import io

        import numpy as np  # type: ignore[import]

        # Decode base64 → bytes → numpy array
        try:
            stripped = (image_b64 or "").strip()
            if not stripped:
                return []
            padding = 4 - len(stripped) % 4
            if padding != 4:
                stripped += "=" * padding
            image_bytes = base64.b64decode(stripped, validate=True)
        except (binascii.Error, ValueError):
            return []

        # cv2 is needed to decode bytes → numpy BGR array
        try:
            import cv2  # type: ignore[import]
        except ImportError as exc:
            raise ImportError(
                "YOLOv8Detector.detect() requires 'opencv-python'.\n"
                "Install it with:  pip install opencv-python-headless\n"
                f"Original error: {exc}"
            ) from exc

        nparr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return []

        # Run inference
        results = self._model.predict(img, conf=self._conf_threshold, verbose=False)

        regions: list[DetectedRegion] = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for box in boxes:
                cls_id = int(box.cls[0].item())
                label = _CLASS_ID_TO_LABEL.get(cls_id)
                if label is None:
                    continue  # unknown class — skip silently

                conf = float(box.conf[0].item())
                x1, y1, x2, y2 = (float(v) for v in box.xyxy[0].tolist())

                regions.append(DetectedRegion(
                    label=label,
                    bbox=BoundingBox(
                        x=x1,
                        y=y1,
                        width=x2 - x1,
                        height=y2 - y1,
                    ),
                    confidence=conf,
                ))

        return regions
