"""
app/services/gemini_service.py
────────────────────────────────
Gemini multimodal OCR + LMPC compliance extraction service.

Accepts a raw base64 image string, sends it to Gemini's vision model
with a carefully-crafted LMPC-aware prompt, and returns a structured
``extracted_fields`` dict that is 100% compatible with the existing
``validate_package_data`` validator — no other code needs to change.

Key design decisions
────────────────────
* Uses ``gemini-2.0-flash`` — fast, cheap, excellent vision.
* The prompt is self-contained: it embeds all mandatory LMPC Rule 6
  fields so Gemini knows exactly what to look for.
* Returns ``None`` on any failure (key missing, API error, bad JSON)
  so the caller can cleanly fall back to the stub pipeline.
* Async-friendly via ``asyncio.to_thread`` — keeps FastAPI non-blocking.
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# ── Prompt ─────────────────────────────────────────────────────────────────────

_LMPC_EXTRACTION_PROMPT = """You are an expert Indian food-safety and consumer-protection inspector trained on the Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules).

Carefully examine the product label / packaging image provided and extract ALL of the following mandatory declaration fields. For each field, read every part of the label carefully — front, back, sides, bottom.

MANDATORY FIELDS TO EXTRACT (as per LMPC Rule 6):
1. product_name           — Common or generic name of the commodity (Rule 6(1)(a))
2. net_quantity            — Net quantity with unit. Must use SI units: g, kg, ml, L. Flag if "gms", "kilos", "approx", "approx weight" or "net weight when packed" is used (Rule 6(1)(c) & Rule 13)
3. mrp                     — Maximum Retail Price including all taxes. Format: "MRP Rs. X.XX" or "₹X.XX incl. of all taxes" (Rule 6(1)(e))
4. manufacturer_name       — Full legal name of manufacturer or packer (Rule 6(1)(b))
5. manufacturer_address    — Complete postal address including city, state, PIN (Rule 6(1)(b))
6. country_of_origin       — Country of origin if imported; "India" if manufactured domestically (Rule 6(1)(f))
7. month_year_of_manufacture — Month and year of manufacture or packing. Format: MM/YYYY or "Mfg: Mon YYYY" (Rule 6(1)(g))
8. best_before             — Best before / use by / expiry date. Format: MM/YYYY or "BBE: Mon YYYY" (Rule 6(1)(h)) — optional for some commodities
9. customer_care_details   — Consumer care officer name/dept, phone/toll-free number, email, and address (Rule 6(1)(k))
10. fssai_license          — FSSAI license/registration number (14 digits) if it is a food product
11. batch_lot_number       — Batch number or lot number (Rule 6(1)(i))
12. ingredients            — List of ingredients if visible (for food products)
13. nutritional_info       — Any nutritional information table if visible
14. ocr_full_text          — Full verbatim transcription of ALL text visible on the label (every word, number, symbol)

ASSESSMENT FIELDS (your expert opinion):
15. gemini_observations    — In 2-3 sentences: note any obvious compliance issues, missing declarations, suspicious phrases, or things that need human review. Be specific — cite Rule numbers.
16. label_quality          — One of: "clear", "blurry", "partial" — describing image readability

RESPONSE FORMAT — respond ONLY with a valid JSON object, no markdown fences, no explanation:
{
  "product_name": "...",
  "net_quantity": "...",
  "mrp": "...",
  "manufacturer_name": "...",
  "manufacturer_address": "...",
  "country_of_origin": "...",
  "month_year_of_manufacture": "...",
  "best_before": "...",
  "customer_care_details": "...",
  "fssai_license": "...",
  "batch_lot_number": "...",
  "ingredients": "...",
  "nutritional_info": "...",
  "ocr_full_text": "...",
  "gemini_observations": "...",
  "label_quality": "..."
}

Rules:
- Use empty string "" for any field not visible on the label (do NOT invent values).
- Preserve exact text including spelling errors — do not correct them.
- For net_quantity, include the unit exactly as printed (flag non-SI units in gemini_observations).
- For mrp, include the full string as printed (e.g. "MRP Rs. 40.00 (Incl. of all taxes)").
- For customer_care_details, concatenate all consumer care contact info into one string.
"""


# ── Service ────────────────────────────────────────────────────────────────────

def _build_client():
    """
    Lazily import and configure the Gemini client.
    Returns None if the SDK is not installed or the key is missing.
    """
    try:
        import google.generativeai as genai  # type: ignore
        from app.core.config import settings

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.warning(
                "GEMINI_API_KEY is not set in backend/.env — "
                "Gemini service will be unavailable. "
                "Add your key and restart the server."
            )
            return None

        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.0-flash")

    except ImportError:
        logger.error(
            "google-generativeai package is not installed. "
            "Run: pip install google-generativeai"
        )
        return None


def _call_gemini_sync(image_base64: str) -> Optional[dict]:
    """
    Synchronous Gemini call — runs in a thread pool via asyncio.to_thread.

    Args:
        image_base64: Raw base64 string (no data-URI prefix).

    Returns:
        Parsed dict of extracted fields, or None on any failure.
    """
    model = _build_client()
    if model is None:
        return None

    try:
        import google.generativeai as genai  # type: ignore

        # Detect image format from base64 magic bytes
        try:
            raw = base64.b64decode(image_base64[:16] + "==")
        except Exception:
            raw = b""

        if raw[:8] == b"\x89PNG\r\n\x1a\n":
            mime_type = "image/png"
        elif raw[:3] == b"\xff\xd8\xff":
            mime_type = "image/jpeg"
        elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
            mime_type = "image/webp"
        else:
            mime_type = "image/jpeg"  # safe default

        image_part = {
            "inline_data": {
                "mime_type": mime_type,
                "data": image_base64,
            }
        }

        response = model.generate_content(
            [_LMPC_EXTRACTION_PROMPT, image_part],
            generation_config={
                "temperature": 0.1,        # low temp → deterministic extraction
                "max_output_tokens": 2048,
            },
        )

        raw_text = response.text.strip()

        # Strip markdown fences if Gemini wraps the JSON anyway
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.MULTILINE)
        raw_text = re.sub(r"\s*```$", "", raw_text, flags=re.MULTILINE)

        fields = json.loads(raw_text)
        logger.info(
            "Gemini extraction complete. Quality=%s product=%s",
            fields.get("label_quality", "?"),
            fields.get("product_name", "?"),
        )
        return fields

    except json.JSONDecodeError as exc:
        logger.error("Gemini returned non-JSON response: %s", exc)
        return None
    except Exception as exc:
        logger.error("Gemini API call failed: %s", exc)
        return None


async def extract_fields_from_image(image_base64: str) -> Optional[dict]:
    """
    Async wrapper — runs the blocking Gemini SDK call in a thread pool
    so FastAPI's event loop is never blocked.

    Args:
        image_base64: Raw base64 image string (no data-URI prefix).

    Returns:
        Dict of extracted package fields compatible with validate_package_data,
        or None if Gemini is unavailable or the call fails.
    """
    return await asyncio.to_thread(_call_gemini_sync, image_base64)
