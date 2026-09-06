from app.utils.lmpc_validator import validate_package_data
import hashlib

from typing import Optional

async def process_scan_stub(image_base64: str, extracted_fields: Optional[dict] = None) -> tuple[dict, list, list, str, str]:
    """
    Stub vision pipeline for Sprint 1.
    Instead of running YOLO + PaddleOCR, it mocks the extraction or uses provided fields.
    Returns: (extracted_data, fields, violations, verdict, verdictNote)
    """
    
    # Use provided extracted fields for offline validation, or fallback to mock
    if extracted_fields is not None:
        extracted_data = extracted_fields
        ocr_full_text = extracted_fields.get("ocr_full_text", "")
    else:
        extracted_data = {
            "manufacturer": "Acme Corp, 123 Industrial Way, Mumbai",
            "net_weight_g": 250.0,
            "net_weight_str": "250g",
            "net_weight_font_height_mm": 1.5, # Should be >= 4.0mm for 250g (Slab C)
        }
        ocr_full_text = "Acme Corp, 123 Industrial Way, Mumbai. Net Wt when packed 250g. Best before 6 months."
    
    # Run through the LMPC validator
    fields, violations, verdict, verdictNote = validate_package_data(extracted_data, ocr_full_text)
    
    return extracted_data, fields, violations, verdict, verdictNote
