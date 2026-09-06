"""
app/services/vision/stub_pipeline.py
──────────────────────────────────────
Sprint 1 compatibility shim.

``process_scan_stub`` is the function called by the /scan/image and /scan/qr
routers.  It preserves the Sprint 1 interface (extracted_fields override dict)
while delegating the real work to the Sprint 2 ``VisionPipeline``.

Sprint 1 dict-override path (used by /scan/qr and tests):
    pass ``extracted_fields=<dict>`` → run that dict directly through the
    validator, bypassing image decode / detect / OCR entirely.

Sprint 2 image path:
    pass ``image_base64=<str>`` only → full VisionPipeline.run() chain,
    including graceful handling of invalid/empty base64.

The /scan/image and /scan/qr response shapes are **not changed**.
"""

from __future__ import annotations

from typing import Optional

from app.services.vision.pipeline import VisionPipeline
from app.utils.lmpc_validator import validate_package_data

# Singleton pipeline with default stubs; callers may inject alternatives for
# integration tests or future real-model swap-in.
_DEFAULT_PIPELINE = VisionPipeline()


async def process_scan_stub(
    image_base64: str,
    extracted_fields: Optional[dict] = None,
    *,
    pipeline: Optional[VisionPipeline] = None,
) -> tuple[dict, list, list, str, str]:
    """
    Thin shim between the scan routers and the Sprint 2 vision pipeline.

    Returns:
        (extracted_data, fields, violations, verdict, verdictNote)
        — same 5-tuple the routers have always expected.

    Args:
        image_base64:     Base64 image string (may be invalid — handled
                          gracefully, not raised as an exception).
        extracted_fields: When provided, bypasses the full pipeline and runs
                          the supplied dict directly through the validator.
                          Used by /scan/qr and Sprint 1 tests.
        pipeline:         Optional ``VisionPipeline`` for dependency injection
                          in tests (e.g. to inject a low-confidence stub).
    """
    # ── Sprint 1 override path ────────────────────────────────────────────────
    if extracted_fields is not None:
        extracted_data = extracted_fields
        ocr_full_text = extracted_fields.get("ocr_full_text", "")
        fields, violations, verdict, verdictNote = validate_package_data(
            extracted_data, ocr_full_text
        )
        return extracted_data, fields, violations, verdict, verdictNote

    # ── Sprint 2 full pipeline path ───────────────────────────────────────────
    active_pipeline = pipeline or _DEFAULT_PIPELINE
    result = active_pipeline.run(image_base64)

    extracted_data = result.extracted_fields.to_dict()
    return extracted_data, result.fields, result.violations, result.verdict, result.verdict_note
