"""
app/schemas/vision.py
─────────────────────
Pydantic models that guard the boundary between raw vision-extraction output
(from OCR / real YOLO pipeline) and the LMPC validator.

All fields are optional so that partially-extracted labels are handled
gracefully.  ``model_config`` uses ``coerce_numbers_to_str=False`` but
sets the validator mode to **lax** (``ConfigDict(strict=False)``) so that
string-encoded numbers like ``"250"`` are silently coerced to ``float``
instead of raising a 422.  Truly un-parseable values will be discarded and
replaced with ``None`` (see each field's ``default``).

Extra keys from the vision pipeline are silently ignored via
``extra="ignore"`` — future pipeline fields never break existing validation.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ConsumerCareDetails(BaseModel):
    """Validates the consumer-care sub-object inside ``ExtractedPackageData``."""

    model_config = ConfigDict(extra="ignore", strict=False)

    name: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

    @field_validator("name", "telephone", "email", "address", mode="before")
    @classmethod
    def coerce_to_str(cls, v: object) -> Optional[str]:
        """Accept any scalar (int, float, bool) and stringify it; discard None."""
        if v is None:
            return None
        return str(v).strip() or None


class ExtractedPackageData(BaseModel):
    """
    Validated representation of the package fields extracted by the vision
    pipeline (real or stubbed).

    The validator is intentionally **lenient**:
    - Unknown fields are dropped (``extra="ignore"``).
    - Numeric strings are coerced to ``float`` (``strict=False``).
    - Values that still cannot be coerced fall back to ``None`` gracefully.
    """

    model_config = ConfigDict(extra="ignore", strict=False)

    # ── Manufacturer ──────────────────────────────────────────────────────────
    manufacturer: Optional[str] = None
    manufacturer_confidence: Optional[float] = Field(default=92.0, ge=0.0, le=100.0)

    # ── Net weight / quantity ─────────────────────────────────────────────────
    net_weight_g: Optional[float] = Field(default=None, ge=0.0)
    net_weight_str: Optional[str] = None
    net_weight_confidence: Optional[float] = Field(default=95.0, ge=0.0, le=100.0)
    net_weight_font_height_mm: Optional[float] = Field(default=None, ge=0.0)

    # ── Consumer care ─────────────────────────────────────────────────────────
    consumer_care: Optional[ConsumerCareDetails] = None

    # ── OCR full text (passed separately to prohibited-expression scanner) ─────
    ocr_full_text: Optional[str] = None

    # ── Validators ────────────────────────────────────────────────────────────

    @field_validator(
        "manufacturer_confidence",
        "net_weight_confidence",
        "net_weight_font_height_mm",
        "net_weight_g",
        mode="before",
    )
    @classmethod
    def coerce_numeric(cls, v: object) -> Optional[float]:
        """
        Attempt to coerce to float.  Return None on failure so that a
        corrupted string like ``"???"`` is treated as *missing* rather than
        raising a validation error that would surface as a 422 or 500.
        """
        if v is None:
            return None
        try:
            return float(v)  # type: ignore[arg-type]
        except (ValueError, TypeError):
            return None

    @field_validator("manufacturer", "net_weight_str", "ocr_full_text", mode="before")
    @classmethod
    def coerce_str(cls, v: object) -> Optional[str]:
        if v is None:
            return None
        coerced = str(v).strip()
        return coerced if coerced else None

    def to_dict(self) -> dict:
        """
        Return a plain dict compatible with the legacy ``extracted_data``
        format expected by ``validate_package_data`` and ``generate_evidence_seal``.
        """
        return self.model_dump(exclude_none=False)
