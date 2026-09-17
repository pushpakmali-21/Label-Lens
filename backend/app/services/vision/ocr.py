"""
app/services/vision/ocr.py
───────────────────────────
Sprint 2 OCR layer.

Defines ``OCREngine`` — a structural protocol for text-recognition backends —
and ``StubOCREngine``, a deterministic offline implementation that emits fixed
text blocks for each known region label.

No ML dependencies are imported here.  The real adapter (PaddleOCR) will guard
its import inside the class body when it is built in a future sprint.

Public API
──────────
OCREngine       — typing.Protocol  (structural interface)
StubOCREngine   — offline deterministic implementation
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from app.services.vision.types import BoundingBox, DetectedRegion, OCRTextBlock


# ── Protocol ──────────────────────────────────────────────────────────────────

@runtime_checkable
class OCREngine(Protocol):
    """
    Structural protocol for OCR backends.

    Sprint 2 real implementation: PaddleOCREngine (guarded import, not yet built).
    Sprint 2 offline: StubOCREngine.

    Any class that implements
    ``run(region: DetectedRegion) -> list[OCRTextBlock]``
    satisfies this protocol — no inheritance required.
    """

    def run(self, region: DetectedRegion) -> list[OCRTextBlock]:
        """
        Extract text blocks from a detected image region.

        Args:
            region: A ``DetectedRegion`` produced by a ``VisionDetector``.
                    ``region.crop_b64`` may be ``None`` in stub mode.

        Returns:
            List of ``OCRTextBlock`` objects found within the region.
            Returns an empty list for regions with no text (e.g. coin, QR).
        """
        ...


# ── Deterministic text corpus ─────────────────────────────────────────────────
# Maps region label → list of (text, confidence, bbox-offset) tuples.
# bbox values are relative offsets within a 1000×1000 normalised space.
_STUB_TEXT: dict[str, list[dict]] = {
    "manufacturer_panel": [
        {
            "text": "Acme Corp, 123 Industrial Way, Mumbai - 400001",
            "confidence": 0.93,
            "bbox": {"x": 12.0, "y": 12.0, "width": 470.0, "height": 35.0},
        },
    ],
    "net_qty_string": [
        {
            "text": "Net Wt when packed 500g",
            "confidence": 0.90,
            "bbox": {"x": 12.0, "y": 152.0, "width": 300.0, "height": 28.0},
        },
    ],
    "consumer_care_panel": [
        {
            "text": "Consumer Care: Acme Help Desk",
            "confidence": 0.87,
            "bbox": {"x": 12.0, "y": 232.0, "width": 460.0, "height": 24.0},
        },
        {
            "text": "Tel: 1800-123-4567",
            "confidence": 0.91,
            "bbox": {"x": 12.0, "y": 260.0, "width": 200.0, "height": 24.0},
        },
        {
            "text": "care@acme.example",
            "confidence": 0.89,
            "bbox": {"x": 12.0, "y": 288.0, "width": 200.0, "height": 24.0},
        },
        {
            "text": "123 Industrial Way, Mumbai - 400001",
            "confidence": 0.85,
            "bbox": {"x": 12.0, "y": 316.0, "width": 460.0, "height": 24.0},
        },
    ],
    # Coin and QR regions produce no OCR text
    "coin": [],
    "qr_code": [],
}


class StubOCREngine:
    """
    Deterministic offline OCR engine for Sprint 2 skeleton.

    Returns a fixed set of ``OCRTextBlock`` objects per detected region label.
    Confidence values can be overridden at construction time to exercise
    confidence-based routing paths in tests.

    Sprint 2 real replacement: ``PaddleOCREngine`` in a future module that wraps
    ``paddleocr.PaddleOCR`` behind a guarded import.
    """

    def __init__(self, default_confidence: float | None = None) -> None:
        """
        Args:
            default_confidence: If provided, overrides every text block's
                                confidence value.  Must be in [0.0, 1.0].
        """
        self._override_conf = default_confidence

    # ── Public API (satisfies OCREngine protocol) ──────────────────────────────

    def run(self, region: DetectedRegion) -> list[OCRTextBlock]:
        """
        Return deterministic text blocks for the given region.

        Args:
            region: ``DetectedRegion`` whose ``label`` selects the text corpus.
                    Unknown labels return an empty list rather than raising.

        Returns:
            List of ``OCRTextBlock`` objects (may be empty for coin / QR regions).
        """
        specs = _STUB_TEXT.get(region.label, [])
        blocks: list[OCRTextBlock] = []
        for spec in specs:
            confidence = (
                self._override_conf
                if self._override_conf is not None
                else spec["confidence"]
            )
            bbox = BoundingBox(**spec["bbox"])
            blocks.append(
                OCRTextBlock(
                    text=spec["text"],
                    bbox=bbox,
                    confidence=float(confidence),
                    region_label=region.label,
                )
            )
        return blocks
