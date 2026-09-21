"""
app/services/vision/stub_pipeline.py
──────────────────────────────────────
Sprint 1 compatibility shim — now powered by Gemini for real images.

``process_scan_stub`` is the function called by the /scan/image and /scan/qr
routers.  It preserves the Sprint 1 interface (extracted_fields override dict)
while delegating the real work to either:

  a) Gemini multimodal vision (Sprint 3 — real images)
  b) The Sprint 2 ``VisionPipeline`` stub (fallback when Gemini key is missing)

Sprint 1 dict-override path (used by /scan/qr and tests):
    pass ``extracted_fields=<dict>`` → run that dict directly through the
    validator, bypassing image decode / detect / OCR entirely.

Sprint 3 Gemini image path:
    pass ``image_base64=<str>`` only → Gemini extracts all LMPC fields →
    validator produces verdict.  Falls back to stub pipeline when
    GEMINI_API_KEY is missing or Gemini call fails.

The /scan/image and /scan/qr response shapes are **not changed**.

Return value
────────────
A 6-tuple:
    (extracted_data, fields, violations, verdict, verdictNote, rule_version)
"""

from __future__ import annotations

import logging
import base64
import binascii
from typing import Optional
from sqlalchemy.orm import Session

from app.services.vision.pipeline import VisionPipeline
from app.services.gemini_service import extract_fields_from_image
from app.utils.lmpc_validator import validate_package_data, RULE_ENGINE_VERSION

logger = logging.getLogger(__name__)

# Singleton pipeline — used as fallback when Gemini is unavailable
_DEFAULT_PIPELINE = VisionPipeline()


async def process_scan_stub(
    image_base64: str,
    extracted_fields: Optional[dict] = None,
    *,
    pipeline: Optional[VisionPipeline] = None,
    db: Optional[Session] = None,
) -> tuple[dict, list, list, str, str, str]:
    """
    Thin shim between the scan routers and the vision / Gemini backend.

    Returns:
        (extracted_data, fields, violations, verdict, verdictNote, rule_version)

    Args:
        image_base64:     Base64 image string (may be invalid — handled
                          gracefully, not raised as an exception).
        extracted_fields: When provided, bypasses the full pipeline and runs
                          the supplied dict directly through the validator.
                          Used by /scan/qr and Sprint 1 tests.
        pipeline:         Optional ``VisionPipeline`` for dependency injection
                          in tests (e.g. to inject a low-confidence stub).
        db:               Optional SQLAlchemy Session to pass to the validator.
    """
    # ── Sprint 1 override path (QR scan / test) ───────────────────────────────
    if extracted_fields is not None:
        extracted_data = extracted_fields
        ocr_full_text = extracted_fields.get("ocr_full_text", "")
        fields, violations, verdict, verdictNote, rule_version = validate_package_data(
            extracted_data, ocr_full_text, db=db
        )
        return extracted_data, fields, violations, verdict, verdictNote, rule_version

    # ── Sprint 3 Gemini path ──────────────────────────────────────────────────
    # Strip data-URI prefix if present (frontend may send "data:image/...;base64,")
    clean_b64 = image_base64
    if "," in image_base64:
        clean_b64 = image_base64.split(",", 1)[1]

    # Preserve the pipeline's precise invalid-image diagnostic before trying
    # the external extractor. This is an input error, not provider downtime.
    try:
        base64.b64decode(clean_b64, validate=True)
    except (binascii.Error, ValueError):
        result = (pipeline or _DEFAULT_PIPELINE).run(clean_b64)
        extracted_data = result.extracted_fields.to_dict()
        return (
            extracted_data,
            result.fields,
            result.violations,
            result.verdict,
            result.verdict_note,
            RULE_ENGINE_VERSION,
        )

    gemini_fields = await extract_fields_from_image(clean_b64)

    if gemini_fields is not None:
        logger.info("Using Gemini extraction for image scan.")
        ocr_full_text = gemini_fields.get("ocr_full_text", "")
        fields, violations, verdict, verdictNote, rule_version = validate_package_data(
            gemini_fields, ocr_full_text, db=db
        )
        return gemini_fields, fields, violations, verdict, verdictNote, rule_version

    # Do not return deterministic demo OCR here: that made every unrelated
    # package look identical and could create a misleading compliance result.
    # A missing/failed provider is an explicit manual-review failure instead.
    logger.error(
        "Gemini unavailable; refusing to substitute deterministic demo data. "
        "Set GEMINI_API_KEY and verify the configured model."
    )
    extracted_data = {
        "ocr_full_text": "",
        "scan_error": "Vision extraction service unavailable",
    }
    fields, violations, verdict, verdict_note, rule_version = validate_package_data(
        extracted_data, db=db
    )
    violations.insert(0, {
        "field": "scan_service",
        "plain": "The label could not be scanned because the vision extraction service is unavailable. Manual review required.",
        "rule": "Internal",
        "severity": "critical",
    })
    return extracted_data, fields, violations, "fail", "Scan service unavailable. Manual review required.", rule_version
