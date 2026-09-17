"""
app/services/vision/calibration.py
────────────────────────────────────
Sprint 2 coin-based calibration layer.

Uses the detected coin region to compute the pixel-to-millimetre ratio for an
image, and provides helpers to convert OCR bounding-box heights into mm — the
value the LMPC font-slab check (Rule 7) requires.

All maths delegates to the already-tested helpers in ``lmpc_validator``:
  - ``calculate_pixel_per_mm(coin_pixel_diameter) -> float``
  - ``convert_px_to_mm(font_px, pixel_per_mm) -> float``

No OpenCV or ML dependency is imported here.

Public API
──────────
compute_calibration(coin_region) -> CalibrationResult
estimate_font_height_mm(text_block, pixel_per_mm) -> float
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional

from app.services.vision.types import DetectedRegion, OCRTextBlock
from app.utils.lmpc_validator import calculate_pixel_per_mm, convert_px_to_mm


# ── Result type ────────────────────────────────────────────────────────────────

@dataclass
class CalibrationResult:
    """
    Output of the coin-based image calibration step.

    Attributes:
        pixel_per_mm:   Pixels per millimetre derived from the coin diameter.
                        0.0 when no coin region was detected.
        coin_pixel_diameter: Detected coin diameter in pixels (width of bbox).
                             0.0 when no coin region was detected.
        calibrated:     True when a valid coin region was present and the ratio
                        is non-zero.
    """
    pixel_per_mm: float
    coin_pixel_diameter: float
    calibrated: bool


# ── Public functions ───────────────────────────────────────────────────────────

def compute_calibration(coin_region: Optional[DetectedRegion]) -> CalibrationResult:
    """
    Compute the pixel-to-mm ratio from a detected coin region.

    Uses the Indian 5-Rupee coin reference (23 mm diameter) stored in
    ``lmpcRules.json`` via ``calculate_pixel_per_mm``.

    The coin's detected bounding-box *width* is used as the pixel diameter.
    This is appropriate because YOLO returns a tight axis-aligned box around
    the roughly circular coin; width and height should be approximately equal.

    Args:
        coin_region: A ``DetectedRegion`` with ``label == "coin"``, or ``None``
                     if no coin was detected in the image.

    Returns:
        ``CalibrationResult`` with a valid ratio when a coin is present,
        or a zeroed-out result when coin is absent.
    """
    if coin_region is None:
        return CalibrationResult(
            pixel_per_mm=0.0,
            coin_pixel_diameter=0.0,
            calibrated=False,
        )

    coin_px_diameter = coin_region.bbox.width
    px_per_mm = calculate_pixel_per_mm(coin_px_diameter)

    return CalibrationResult(
        pixel_per_mm=px_per_mm,
        coin_pixel_diameter=coin_px_diameter,
        calibrated=px_per_mm > 0.0,
    )


def estimate_font_height_mm(
    text_block: OCRTextBlock,
    pixel_per_mm: float,
) -> float:
    """
    Estimate the real-world font height (mm) of an OCR text block.

    Uses the bounding-box height of the text block as the pixel font height,
    then converts via the calibrated pixel-per-mm ratio.

    When ``pixel_per_mm`` is 0.0 (uncalibrated), returns 0.0 — the caller
    should treat 0.0 as "unknown" and skip Rule 7 font-slab checks.

    Args:
        text_block:    An ``OCRTextBlock`` whose ``bbox.height`` is the
                       pixel-space height of the text line.
        pixel_per_mm:  Calibrated ratio from ``compute_calibration``.
                       Pass 0.0 to skip conversion.

    Returns:
        Font height in millimetres (2 decimal places), or 0.0 when
        calibration is unavailable.
    """
    if pixel_per_mm <= 0.0:
        return 0.0
    return convert_px_to_mm(text_block.bbox.height, pixel_per_mm)
