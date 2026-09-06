"""
app/services/vision/detector.py
────────────────────────────────
Sprint 2 vision detection layer.

Defines ``VisionDetector`` — a structural protocol that the real YOLOv8 adapter
will satisfy in a later sprint — and ``StubDetector``, a deterministic offline
implementation that emits a fixed set of labelled bounding regions.

No ML dependencies are imported here.  The real adapter (not yet built) will
guard its ``ultralytics`` import inside the class body.

Public API
──────────
VisionDetector   — typing.Protocol  (structural interface)
StubDetector     — offline deterministic implementation
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from app.services.vision.types import BoundingBox, DetectedRegion


# ── Protocol ──────────────────────────────────────────────────────────────────

@runtime_checkable
class VisionDetector(Protocol):
    """
    Structural protocol for object-detection backends.

    Sprint 2 real implementation: YOLOv8Detector (guarded import, not yet built).
    Sprint 2 offline: StubDetector.

    Any class that implements ``detect(image_b64: str) -> list[DetectedRegion]``
    satisfies this protocol — no inheritance required.
    """

    def detect(self, image_b64: str) -> list[DetectedRegion]:
        """
        Run object detection on a base64-encoded image.

        Args:
            image_b64: Base64-encoded JPEG or PNG image string.
                       May be empty or invalid — implementations must
                       handle gracefully and return an empty list.

        Returns:
            List of ``DetectedRegion`` objects, one per detected area.
            Returns an empty list if the image is unusable.
        """
        ...


# ── Stub implementation ────────────────────────────────────────────────────────

# Deterministic region layout emitted by StubDetector.
# x, y, width, height are all in a normalised 1000×1000 pixel space so tests
# are image-size-independent.
_STUB_REGIONS: list[dict] = [
    {
        "label": "manufacturer_panel",
        "bbox": {"x": 10.0, "y": 10.0, "width": 480.0, "height": 120.0},
        "confidence": 0.91,
        "text_hint": "Acme Corp, 123 Industrial Way, Mumbai - 400001",
    },
    {
        "label": "net_qty_string",
        "bbox": {"x": 10.0, "y": 150.0, "width": 480.0, "height": 60.0},
        "confidence": 0.88,
        "text_hint": "Net Wt when packed 500g",
    },
    {
        "label": "consumer_care_panel",
        "bbox": {"x": 10.0, "y": 230.0, "width": 480.0, "height": 100.0},
        "confidence": 0.85,
        "text_hint": (
            "Consumer Care: Acme Help Desk | Tel: 1800-123-4567 "
            "| care@acme.example | 123 Industrial Way, Mumbai"
        ),
    },
    {
        "label": "coin",
        "bbox": {"x": 520.0, "y": 10.0, "width": 230.0, "height": 230.0},
        "confidence": 0.79,
        "text_hint": "",
    },
    {
        "label": "qr_code",
        "bbox": {"x": 800.0, "y": 10.0, "width": 180.0, "height": 180.0},
        "confidence": 0.83,
        "text_hint": "",
    },
]


class StubDetector:
    """
    Deterministic offline detector for Sprint 2 skeleton.

    Returns a fixed set of five regions (manufacturer panel, net quantity
    string, consumer care panel, coin, QR code) with preset confidence values.

    Confidence can be overridden at construction time to test confidence-based
    routing (e.g. set ``default_confidence=0.3`` to force a ``review`` verdict).

    Sprint 2 real replacement: ``YOLOv8Detector`` in a future module that wraps
    ``ultralytics.YOLO`` behind a guarded import.
    """

    def __init__(self, default_confidence: float | None = None) -> None:
        """
        Args:
            default_confidence: If provided, overrides every region's confidence
                                value.  Must be in [0.0, 1.0].  Useful for
                                writing confidence-routing tests.
        """
        self._override_conf = default_confidence

    # ── Public API (satisfies VisionDetector protocol) ─────────────────────────

    def detect(self, image_b64: str) -> list[DetectedRegion]:
        """
        Return deterministic stub regions regardless of image content.

        An empty or invalid ``image_b64`` still returns the full region list so
        that downstream pipeline stages can exercise their own logic in tests.

        Args:
            image_b64: Base64-encoded image (ignored in stub).

        Returns:
            List of five ``DetectedRegion`` objects.
        """
        regions: list[DetectedRegion] = []
        for spec in _STUB_REGIONS:
            confidence = (
                self._override_conf
                if self._override_conf is not None
                else spec["confidence"]
            )
            bbox = BoundingBox(**spec["bbox"])
            regions.append(
                DetectedRegion(
                    label=spec["label"],
                    bbox=bbox,
                    confidence=float(confidence),
                )
            )
        return regions
