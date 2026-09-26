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
* Uses configurable current Gemini model through supported ``google-genai`` SDK.
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
from types import SimpleNamespace
from typing import Optional

logger = logging.getLogger(__name__)


def normalise_gemini_fields(fields: dict) -> dict:
    """Map Gemini prompt keys to the validator's established field contract."""
    normalised = dict(fields)

    manufacturer = " ".join(
        value.strip()
        for value in (
            str(fields.get("manufacturer_name") or ""),
            str(fields.get("manufacturer_address") or ""),
        )
        if value and value.strip()
    )
    if manufacturer:
        normalised["manufacturer"] = manufacturer

    quantity = str(fields.get("net_quantity") or "").strip()
    if quantity:
        normalised["net_weight_str"] = quantity
        match = re.search(r"(\d+(?:\.\d+)?)\s*(kg|g|ml|l)\b", quantity, re.IGNORECASE)
        if match:
            amount = float(match.group(1))
            unit = match.group(2).lower()
            normalised["net_weight_g"] = amount * 1000 if unit in {"kg", "l"} else amount

    customer_care = str(fields.get("customer_care_details") or "").strip()
    if customer_care:
        # Gemini returns the consumer-care declaration as one transcription.
        # Split the machine-readable contacts so the existing validator does
        # not incorrectly report every phone/email/address as missing.
        phone = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", customer_care)
        email = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", customer_care)
        care = {"name": customer_care, "address": customer_care}
        if phone:
            care["telephone"] = phone.group(0).strip()
        if email:
            care["email"] = email.group(0).strip()
        normalised["consumer_care"] = care

    # Keep Gemini's full rule-by-rule assessment available to the shared
    # validator.  The UI should not need to know which model produced it.
    checks = fields.get("compliance_checks")
    if isinstance(checks, list):
        normalised["gemini_rule_checks"] = checks

    return normalised

# ── Prompt ─────────────────────────────────────────────────────────────────────

_LMPC_EXTRACTION_PROMPT = """You are an expert Indian food-safety and consumer-protection inspector trained on the Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules).

Carefully examine the product label / packaging image provided and extract ALL of the following mandatory declaration fields. For each field, read every part of the label carefully — front, back, sides, bottom.

MANDATORY FIELDS TO EXTRACT (as per LMPC Rule 6 and applicable amendments):
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
17. compliance_checks      — An array containing one object for EVERY applicable
    check below. Each object must be:
    {"rule":"...", "status":"pass|fail|review|not_applicable",
     "finding":"...", "evidence":"exact label text or empty string"}

RULE CHECKLIST — assess every applicable item, not just the fields above:
- Rule 6(1)(a): manufacturer/packer/importer name and complete address.
- Rule 6(1)(b): common/generic name of the commodity.
- Rule 6(1)(c): net quantity in the prescribed standard unit.
- Rule 6(1)(d): month and year of manufacture/packing/import.
- Rule 6(1)(e): MRP inclusive of all taxes and required price wording.
- Rule 6(1)(f): consumer-care name, address, phone/toll-free number and email.
- Rule 6(1)(g): country of origin for imported goods.
- Rule 6(1)(h): best-before/use-by/expiry where applicable.
- Rule 6(1)(i): batch/lot/code number where applicable.
- Rule 6(1)(j): dimensions/number where the commodity requires them.
- Rule 6(1)(k): any commodity-specific declaration required by the Rules.
- Rule 6(1)(l): unit sale price where applicable.
- Rule 6(7): declarations are prominent, legible and readable.
- Rule 7 and the Second Schedule: net-quantity numeral/letter minimum height.
- Rule 8: principal display panel and required declaration placement.
- Rule 9: declaration manner, visibility and language requirements.
- Rule 10 / 10A: e-commerce/digital listing disclosures and country-of-origin
  filter, only when the image is a marketplace listing.
- Rule 11: prohibited or deceptive quantity/weight expressions.
- Rule 13 and the Second Schedule: permitted units and symbols.
- Applicable 2022 electronic-product QR proviso: only permitted declarations
  may be moved to an accessible on-pack QR code; verify the QR evidence if visible.

Do not mark a rule pass merely because its text is not visible. Use "review"
when the image is partial, blurry, or the rule's applicability cannot be proved.

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
  ,"compliance_checks": []
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
        from google import genai  # type: ignore
        from app.core.config import settings

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.warning(
                "GEMINI_API_KEY is not set in backend/.env — "
                "Gemini service will be unavailable. "
                "Add your key and restart the server."
            )
            return None

        return genai.Client(api_key=api_key)

    except ImportError:
        logger.error(
            "google-genai package is not installed. "
            "Run: pip install google-genai"
        )
        return None


def _call_gemini_sync(image_base64: str, model_override: Optional[str] = None) -> Optional[dict]:
    """
    Synchronous Gemini call — runs in a thread pool via asyncio.to_thread.

    Args:
        image_base64: Raw base64 string (no data-URI prefix).

    Returns:
        Parsed dict of extracted fields, or None on any failure.
    """
    client = _build_client()
    if client is None:
        return None

    try:
        from app.core.config import settings

        try:
            from google.genai import types  # type: ignore
        except ImportError:
            # Keeps the request boundary testable when the optional SDK is not
            # installed. In production _build_client already returns None in
            # that situation.
            class _Part:
                @staticmethod
                def from_bytes(*, data: bytes, mime_type: str):
                    return SimpleNamespace(
                        inline_data=SimpleNamespace(data=data, mime_type=mime_type)
                    )

            class _Types:
                Part = _Part

                @staticmethod
                def GenerateContentConfig(**kwargs):
                    return SimpleNamespace(**kwargs)

            types = _Types

        # Decode once. New Gemini SDK accepts bytes rather than a legacy
        # inline-data dictionary.
        try:
            raw = base64.b64decode(image_base64, validate=True)
        except Exception as exc:
            logger.warning("Gemini image input is not valid base64: %s", exc)
            return None

        if raw[:8] == b"\x89PNG\r\n\x1a\n":
            mime_type = "image/png"
        elif raw[:3] == b"\xff\xd8\xff":
            mime_type = "image/jpeg"
        elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
            mime_type = "image/webp"
        else:
            mime_type = "image/jpeg"  # safe default

        from app.core.config import settings as _cfg
        timeout_secs = getattr(_cfg, "GEMINI_TIMEOUT_SECONDS", 30)

        response = client.models.generate_content(
            model=model_override or settings.GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=raw, mime_type=mime_type),
                _LMPC_EXTRACTION_PROMPT,
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=4096,
                response_mime_type="application/json",
                http_options={"timeout": timeout_secs * 1000},
            ),
        )

        raw_text = response.text.strip()

        # Strip markdown fences if Gemini wraps the JSON anyway
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.MULTILINE)
        raw_text = re.sub(r"\s*```$", "", raw_text, flags=re.MULTILINE)

        fields = json.loads(raw_text)
        if not isinstance(fields, dict):
            logger.error("Gemini returned JSON that is not an object.")
            return None
        fields = normalise_gemini_fields(fields)
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
    Async wrapper — runs blocking Gemini SDK call in a thread pool
    so FastAPI's event loop is never blocked.

    Args:
        image_base64: Raw base64 image string (no data-URI prefix).

    Returns:
        Dict of extracted package fields compatible with validate_package_data,
        or None if Gemini is unavailable or the call fails.
    """
    from app.core.config import settings as _cfg
    timeout = getattr(_cfg, "GEMINI_TIMEOUT_SECONDS", 30)

    try:
        primary = await asyncio.wait_for(
            asyncio.to_thread(_call_gemini_sync, image_base64),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        logger.error("Gemini primary model timed out after %ss", timeout)
        primary = None

    if primary is not None:
        return primary

    # Capacity spikes can affect one model while another stable multimodal
    # model remains available. Keep this fallback bounded and model-specific;
    # never substitute deterministic demo OCR.
    fallback_model = _cfg.GEMINI_FALLBACK_MODEL
    if fallback_model and fallback_model != _cfg.GEMINI_MODEL:
        logger.warning("Primary Gemini model unavailable; trying fallback model %s", fallback_model)
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(_call_gemini_sync, image_base64, fallback_model),
                timeout=timeout,
            )
        except asyncio.TimeoutError:
            logger.error("Gemini fallback model also timed out after %ss", timeout)
            return None
    return None

