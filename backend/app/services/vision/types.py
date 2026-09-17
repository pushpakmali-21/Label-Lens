"""
app/services/vision/types.py
─────────────────────────────
Sprint 2 interface types for the real vision pipeline.

All types are pure Python dataclasses — no ML dependencies.
Sprint 2 will populate these from YOLOv8 / PaddleOCR outputs;
Sprint 1 stub code may use them as structured containers.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


# ── Bounding box ──────────────────────────────────────────────────────────────

@dataclass
class BoundingBox:
    """Pixel-coordinate bounding box (top-left origin)."""
    x: float          # left edge in pixels
    y: float          # top edge in pixels
    width: float      # box width in pixels
    height: float     # box height in pixels

    @property
    def area(self) -> float:
        return self.width * self.height


# ── Detected region (YOLO output) ─────────────────────────────────────────────

@dataclass
class DetectedRegion:
    """
    A single region detected by the object-detection model (Sprint 2: YOLOv8).

    Attributes:
        label      -- class label, e.g. "manufacturer_panel", "mrp_block",
                      "net_qty_string", "consumer_care_panel", "coin", "qr_code"
        bbox       -- pixel bounding box within the original image
        confidence -- detection confidence [0.0, 1.0]
        crop_b64   -- base64-encoded cropped image of this region (optional,
                      populated before passing to OCR)
    """
    label: str
    bbox: BoundingBox
    confidence: float
    crop_b64: Optional[str] = None


# ── OCR text block (PaddleOCR output) ─────────────────────────────────────────

@dataclass
class OCRTextBlock:
    """
    A single text segment returned by the OCR engine (Sprint 2: PaddleOCR).

    Attributes:
        text       -- raw recognised text
        bbox       -- pixel bounding box of this text block
        confidence -- OCR confidence [0.0, 1.0]
        region_label -- which DetectedRegion this block belongs to (if any)
    """
    text: str
    bbox: BoundingBox
    confidence: float
    region_label: Optional[str] = None


# ── Per-field confidence score ─────────────────────────────────────────────────

@dataclass
class ConfidenceScore:
    """
    Confidence wrapper for a single extracted package field.

    Attributes:
        field_name   -- e.g. "manufacturer", "net_weight_str"
        value        -- extracted value string
        confidence   -- combined detection + OCR confidence [0.0, 100.0]
                        (scaled to 100 to match existing FieldResult schema)
        detection_conf -- raw detection model confidence [0.0, 1.0]
        ocr_conf       -- raw OCR confidence [0.0, 1.0]
    """
    field_name: str
    value: str
    confidence: float          # 0–100 scale (matches FieldResult.confidence)
    detection_conf: float = 1.0
    ocr_conf: float = 1.0


# ── Extracted package fields ───────────────────────────────────────────────────

@dataclass
class ExtractedPackageFields:
    """
    Typed container for all fields the validator expects.

    Populated by the OCR + region-classification step in Sprint 2.
    Sprint 1 stub populates this from manually provided dicts.
    """
    manufacturer: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    net_weight_g: Optional[float] = None
    net_weight_str: Optional[str] = None
    net_weight_font_height_mm: Optional[float] = None
    mrp: Optional[float] = None
    ocr_full_text: str = ""
    # Consumer-care sub-fields
    consumer_care: Optional[dict] = None   # keys: name, telephone, email, address
    # Calibration
    coin_pixel_diameter: Optional[float] = None
    pixel_per_mm: Optional[float] = None

    def to_dict(self) -> dict:
        """Return a plain dict suitable for validate_package_data()."""
        return {k: v for k, v in self.__dict__.items() if v is not None}


# ── Preprocessing result ───────────────────────────────────────────────────────

@dataclass
class PreprocessingResult:
    """
    Metadata about the preprocessing steps applied to an uploaded image.

    Sprint 2: populated by OpenCV pipeline (denoise → deskew → contrast normalise).
    Sprint 1: not used; kept here so preprocessing.py can type its return value.
    """
    original_width: int
    original_height: int
    processed_width: int
    processed_height: int
    deskew_angle_deg: float = 0.0
    denoise_applied: bool = False
    contrast_normalised: bool = False
    steps_applied: list[str] = field(default_factory=list)
    processed_image_b64: Optional[str] = None  # base64 of the processed image
