"""
app/services/vision/extractor.py
──────────────────────────────────
Sprint 2 field-extraction layer.

Maps ``DetectedRegion`` + ``OCRTextBlock`` outputs into the typed
``ExtractedPackageFields`` container that ``validate_package_data()`` expects,
and produces per-field ``ConfidenceScore`` objects that feed confidence-based
verdict routing.

No ML dependencies are imported here.

Public API
──────────
ExtractionResult            — dataclass: fields + confidence scores
map_ocr_to_fields(regions, blocks_by_region, calibration) -> ExtractionResult
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from typing import Optional

from app.services.vision.calibration import CalibrationResult, estimate_font_height_mm
from app.services.vision.types import (
    ConfidenceScore,
    DetectedRegion,
    ExtractedPackageFields,
    OCRTextBlock,
)


# ── Result type ────────────────────────────────────────────────────────────────

@dataclass
class ExtractionResult:
    """
    Output of the OCR-to-field mapping step.

    Attributes:
        package_fields:    Typed field container ready for the validator.
        field_confidences: Per-field confidence scores (0–100 scale).
    """
    package_fields: ExtractedPackageFields
    field_confidences: list[ConfidenceScore] = field(default_factory=list)


# ── Internal helpers ───────────────────────────────────────────────────────────

def _combine_confidence(detection_conf: float, ocr_conf: float) -> float:
    """
    Combine detection and OCR confidence into a single 0–100 score.

    Uses geometric mean so that a very low score in either dimension
    pulls the combined value down significantly.

    Args:
        detection_conf: Detection model confidence [0.0, 1.0].
        ocr_conf:       OCR engine confidence [0.0, 1.0].

    Returns:
        Combined confidence in [0.0, 100.0].
    """
    product = max(0.0, detection_conf) * max(0.0, ocr_conf)
    return round(math.sqrt(product) * 100.0, 2)


def _concat_block_texts(blocks: list[OCRTextBlock]) -> str:
    """Join all text blocks in a region into a single whitespace-separated string."""
    return " ".join(b.text for b in blocks if b.text).strip()


def _avg_ocr_conf(blocks: list[OCRTextBlock]) -> float:
    """Return the average OCR confidence across a list of blocks, or 1.0 if empty."""
    if not blocks:
        return 1.0
    return sum(b.confidence for b in blocks) / len(blocks)


_NET_WEIGHT_PATTERN = re.compile(
    r"""
    (?:net\s+(?:wt|weight|quantity|qty)[^\d]*)?  # optional label
    ([\d]+(?:\.\d+)?)                            # numeric value
    \s*
    (g|kg|ml|l|gm|grm|gms|litre|liter|ltr)      # unit
    """,
    re.IGNORECASE | re.VERBOSE,
)

_UNIT_TO_GRAMS: dict[str, float] = {
    "g": 1.0, "gm": 1.0, "grm": 1.0, "gms": 1.0,
    "kg": 1000.0,
    "ml": 1.0,   # treat ml as g (same slab rules apply for liquid)
    "l": 1000.0, "liter": 1000.0, "litre": 1000.0, "ltr": 1000.0,
}


def _parse_net_weight(text: str) -> tuple[Optional[float], Optional[str]]:
    """
    Parse a net weight value and unit from raw OCR text.

    Returns:
        (net_weight_g, net_weight_str) or (None, None) if not parseable.
    """
    match = _NET_WEIGHT_PATTERN.search(text)
    if not match:
        return None, None

    value_str, unit = match.group(1), match.group(2).lower()
    try:
        value = float(value_str)
    except ValueError:
        return None, None

    multiplier = _UNIT_TO_GRAMS.get(unit, 1.0)
    net_weight_g = round(value * multiplier, 3)
    net_weight_str = f"{value_str}{unit}"
    return net_weight_g, net_weight_str


def _parse_consumer_care(blocks: list[OCRTextBlock]) -> Optional[dict]:
    """
    Heuristically extract consumer-care sub-fields from OCR blocks.

    Looks for phone numbers, emails, and address-like strings.
    Returns None when no useful consumer-care data is found.
    """
    full_text = _concat_block_texts(blocks)
    if not full_text:
        return None

    # Extract care name (first block or first line)
    name_match = re.search(r"consumer\s+care[:\s]+([^\|]+)", full_text, re.IGNORECASE)
    care_name = name_match.group(1).strip() if name_match else None

    # Phone
    phone_match = re.search(r"(?:tel|phone|ph)[:\s]*([\d\-\s]{7,})", full_text, re.IGNORECASE)
    telephone = phone_match.group(1).strip() if phone_match else None

    # Email
    email_match = re.search(r"[\w.+-]+@[\w.-]+\.[a-z]{2,}", full_text, re.IGNORECASE)
    email = email_match.group(0).strip() if email_match else None

    # Address (anything after pipe / comma chains, or last meaningful clause)
    address_match = re.search(
        r"(?:address[:\s]+|(?:[\w\s]+,\s*){2,})([A-Za-z0-9\s,\-]+\d{6})",
        full_text, re.IGNORECASE,
    )
    address = address_match.group(0).strip() if address_match else None

    result: dict = {}
    if care_name:
        result["name"] = care_name
    if telephone:
        result["telephone"] = telephone
    if email:
        result["email"] = email
    if address:
        result["address"] = address

    return result if result else None


# ── Public API ─────────────────────────────────────────────────────────────────

def map_ocr_to_fields(
    regions: list[DetectedRegion],
    blocks_by_region: dict[str, list[OCRTextBlock]],
    calibration: Optional[CalibrationResult] = None,
) -> ExtractionResult:
    """
    Map detected regions and OCR text blocks into typed package fields.

    Field mapping strategy
    ──────────────────────
    * ``manufacturer_panel``  → ``manufacturer``
    * ``net_qty_string``      → ``net_weight_g``, ``net_weight_str``,
                                ``net_weight_font_height_mm`` (when calibrated)
    * ``consumer_care_panel`` → ``consumer_care`` sub-dict
    * ``coin``                → ``coin_pixel_diameter``, ``pixel_per_mm``
                                (handled upstream by ``calibration.py``)

    Confidence scoring
    ──────────────────
    Each field's combined confidence uses the geometric mean of detection
    confidence (from the region) and OCR confidence (average across blocks).

    Args:
        regions:          ``DetectedRegion`` list from the detector.
        blocks_by_region: Mapping of ``region.label`` → OCR text blocks.
        calibration:      ``CalibrationResult`` from ``compute_calibration()``.
                          Pass ``None`` to skip font-height conversion.

    Returns:
        ``ExtractionResult`` with populated ``package_fields`` and
        ``field_confidences``.
    """
    pf = ExtractedPackageFields()
    confidences: list[ConfidenceScore] = []
    all_texts: list[str] = []

    region_map: dict[str, DetectedRegion] = {r.label: r for r in regions}

    # ── Manufacturer ──────────────────────────────────────────────────────────
    mfg_region = region_map.get("manufacturer_panel")
    mfg_blocks = blocks_by_region.get("manufacturer_panel", [])
    if mfg_region and mfg_blocks:
        mfg_text = _concat_block_texts(mfg_blocks)
        if mfg_text:
            pf.manufacturer = mfg_text
            avg_ocr = _avg_ocr_conf(mfg_blocks)
            conf = _combine_confidence(mfg_region.confidence, avg_ocr)
            confidences.append(ConfidenceScore(
                field_name="manufacturer",
                value=mfg_text,
                confidence=conf,
                detection_conf=mfg_region.confidence,
                ocr_conf=avg_ocr,
            ))
            all_texts.append(mfg_text)

    # ── Net weight ────────────────────────────────────────────────────────────
    qty_region = region_map.get("net_qty_string")
    qty_blocks = blocks_by_region.get("net_qty_string", [])
    if qty_region and qty_blocks:
        qty_text = _concat_block_texts(qty_blocks)
        all_texts.append(qty_text)
        net_weight_g, net_weight_str = _parse_net_weight(qty_text)

        if net_weight_g is not None:
            pf.net_weight_g = net_weight_g
            pf.net_weight_str = net_weight_str

            # Font height via calibration
            if calibration and calibration.calibrated and qty_blocks:
                # Use the tallest text block in the qty region as representative
                tallest = max(qty_blocks, key=lambda b: b.bbox.height)
                pf.net_weight_font_height_mm = estimate_font_height_mm(
                    tallest, calibration.pixel_per_mm
                )

            avg_ocr = _avg_ocr_conf(qty_blocks)
            conf = _combine_confidence(qty_region.confidence, avg_ocr)
            confidences.append(ConfidenceScore(
                field_name="net_weight_str",
                value=net_weight_str or "",
                confidence=conf,
                detection_conf=qty_region.confidence,
                ocr_conf=avg_ocr,
            ))

    # ── Consumer care ─────────────────────────────────────────────────────────
    care_region = region_map.get("consumer_care_panel")
    care_blocks = blocks_by_region.get("consumer_care_panel", [])
    if care_region and care_blocks:
        care_text = _concat_block_texts(care_blocks)
        all_texts.append(care_text)
        care_dict = _parse_consumer_care(care_blocks)
        if care_dict:
            pf.consumer_care = care_dict
            avg_ocr = _avg_ocr_conf(care_blocks)
            conf = _combine_confidence(care_region.confidence, avg_ocr)
            confidences.append(ConfidenceScore(
                field_name="consumer_care",
                value=str(care_dict),
                confidence=conf,
                detection_conf=care_region.confidence,
                ocr_conf=avg_ocr,
            ))

    # ── Calibration pass-through ──────────────────────────────────────────────
    if calibration and calibration.calibrated:
        pf.coin_pixel_diameter = calibration.coin_pixel_diameter
        pf.pixel_per_mm = calibration.pixel_per_mm

    # ── Build full OCR text for prohibited-expression scan ────────────────────
    pf.ocr_full_text = " ".join(all_texts).strip()

    return ExtractionResult(package_fields=pf, field_confidences=confidences)
