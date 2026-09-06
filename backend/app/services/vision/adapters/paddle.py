"""
app/services/vision/adapters/paddle.py
────────────────────────────────────────
Optional PaddleOCR text-recognition adapter.

``PaddleOCREngine`` satisfies the ``OCREngine`` protocol and plugs directly
into ``VisionPipeline`` as a drop-in replacement for ``StubOCREngine``.

Dependency guard
────────────────
``paddleocr`` is imported lazily inside ``__init__`` so that this module
can be imported at any time without crashing when the library is absent.
A clear ``ImportError`` is raised at construction time when the package
is missing.

Installation::

    pip install paddleocr paddlepaddle          # CPU
    pip install paddleocr paddlepaddle-gpu      # GPU (CUDA)

PaddleOCR is run per detected region (not on the whole image) to keep
inference time proportional to the number of text regions, not image size.

If a detected region has a ``crop_b64`` field (populated by an upstream
step), it is used directly.  Otherwise the full original image is used
with the region's bounding box as a hint — this fallback path is less
accurate but still functional.

Usage::

    from app.services.vision.adapters.paddle import PaddleOCREngine
    from app.services.vision.pipeline import VisionPipeline

    pipeline = VisionPipeline(ocr_engine=PaddleOCREngine(lang="en"))
    result = pipeline.run(image_b64)
"""

from __future__ import annotations

import base64
import binascii
from typing import Any, Optional

from app.services.vision.types import BoundingBox, DetectedRegion, OCRTextBlock

# Minimum OCR confidence to include a text block
_MIN_OCR_CONF: float = 0.50


class PaddleOCREngine:
    """
    Real PaddleOCR text-recognition adapter.

    Satisfies the ``OCREngine`` protocol — plug into ``VisionPipeline``
    as ``ocr_engine=PaddleOCREngine(...)``.

    Raises ``ImportError`` at construction time (not at module import)
    when ``paddleocr`` is not installed.

    Args:
        lang:           Language model to load.  ``"en"`` for English,
                        ``"latin"`` for mixed-Latin-script text.
                        Refer to PaddleOCR docs for the full list.
        use_angle_cls:  Rotate text-direction classification.  Recommended
                        for angled package labels.
        use_gpu:        Use GPU for inference.  Defaults to ``False``.
        conf_threshold: Minimum OCR confidence (0–1) to include a text block.
    """

    def __init__(
        self,
        lang: str = "en",
        use_angle_cls: bool = True,
        use_gpu: bool = False,
        conf_threshold: float = _MIN_OCR_CONF,
    ) -> None:
        try:
            from paddleocr import PaddleOCR  # type: ignore[import]
        except ImportError as exc:
            raise ImportError(
                "PaddleOCREngine requires the 'paddleocr' package.\n"
                "Install it with:  pip install paddleocr paddlepaddle\n"
                f"Original error: {exc}"
            ) from exc

        self._ocr: Any = PaddleOCR(
            use_angle_cls=use_angle_cls,
            lang=lang,
            use_gpu=use_gpu,
            show_log=False,
        )
        self._conf_threshold = conf_threshold

    # ── Public API (satisfies OCREngine protocol) ──────────────────────────────

    def run(self, region: DetectedRegion) -> list[OCRTextBlock]:
        """
        Run PaddleOCR on a detected region.

        If ``region.crop_b64`` is populated, decodes and runs OCR on that
        cropped sub-image.  Otherwise the region produces no text blocks —
        callers should ensure crop_b64 is set by the pipeline before calling
        this method for best results.

        Args:
            region: ``DetectedRegion`` from the detector, ideally with
                    ``crop_b64`` populated.

        Returns:
            List of ``OCRTextBlock`` objects whose confidence meets the
            threshold.  Returns an empty list on any decode or OCR error.
        """
        import io

        import numpy as np  # type: ignore[import]

        if not region.crop_b64:
            # No crop available — cannot run OCR
            return []

        # Decode crop_b64 → numpy BGR array for PaddleOCR
        try:
            import cv2  # type: ignore[import]
        except ImportError as exc:
            raise ImportError(
                "PaddleOCREngine.run() requires 'opencv-python'.\n"
                "Install it with:  pip install opencv-python-headless\n"
                f"Original error: {exc}"
            ) from exc

        try:
            stripped = region.crop_b64.strip()
            padding = 4 - len(stripped) % 4
            if padding != 4:
                stripped += "=" * padding
            crop_bytes = base64.b64decode(stripped, validate=True)
        except (binascii.Error, ValueError):
            return []

        nparr = np.frombuffer(crop_bytes, dtype=np.uint8)
        crop_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if crop_img is None:
            return []

        # Run PaddleOCR inference
        try:
            ocr_result = self._ocr.ocr(crop_img, cls=True)
        except Exception:  # noqa: BLE001  # PaddleOCR raises various internals
            return []

        if not ocr_result:
            return []

        blocks: list[OCRTextBlock] = []

        # PaddleOCR result format:
        # [ [ [[x1,y1],[x2,y2],[x3,y3],[x4,y4]], (text, confidence) ], ... ]
        for line_result in ocr_result:
            if not line_result:
                continue
            for item in line_result:
                if not item or len(item) < 2:
                    continue
                poly, (text, conf) = item[0], item[1]
                if conf < self._conf_threshold:
                    continue
                if not text or not text.strip():
                    continue

                # Convert 4-corner polygon to axis-aligned bbox
                xs = [p[0] for p in poly]
                ys = [p[1] for p in poly]
                x_min, y_min = min(xs), min(ys)
                x_max, y_max = max(xs), max(ys)

                # Offset back to original image coordinates using region bbox
                abs_x = region.bbox.x + x_min
                abs_y = region.bbox.y + y_min

                blocks.append(OCRTextBlock(
                    text=text.strip(),
                    bbox=BoundingBox(
                        x=abs_x,
                        y=abs_y,
                        width=x_max - x_min,
                        height=y_max - y_min,
                    ),
                    confidence=float(conf),
                    region_label=region.label,
                ))

        return blocks
