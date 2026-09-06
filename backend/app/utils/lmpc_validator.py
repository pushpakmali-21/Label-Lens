"""
app/utils/lmpc_validator.py
────────────────────────────
Python port of src/utils/lmpcValidator.js.

Validates extracted package fields against the Legal Metrology (Packaged
Commodities) Rules, 2011 and returns a structured verdict.

Public API
──────────
validate_package_data(extracted_data, ocr_full_text)
    → (fields, violations, verdict, verdictNote)

validate_consumer_care(details)
    → {"isComplete": bool, "missingFields": list, "score": int}

calculate_pixel_per_mm(coin_pixel_diameter)
    → float   # pixels per millimetre

convert_px_to_mm(font_px, pixel_per_mm)
    → float   # millimetres, 2-decimal precision
"""

from __future__ import annotations

import json
import re
from pathlib import Path

# ── Rules data ─────────────────────────────────────────────────────────────────

RULES_PATH = Path(__file__).parent.parent / "data" / "lmpcRules.json"
with open(RULES_PATH, "r") as _f:
    LMPC_RULES = json.load(_f)

# Confidence thresholds (from lmpcRules.json)
_THRESHOLDS: dict[str, float] = LMPC_RULES.get("confidence_thresholds", {
    "auto_pass": 85,
    "human_review": 75,
    "auto_fail": 40,
})


# ── Font slab ──────────────────────────────────────────────────────────────────

def resolve_font_slab(net_weight_g: float) -> dict | None:
    """
    Determine the required font slab based on net weight/quantity in grams or ml.

    Mirrors ``resolveFontSlab`` in lmpcValidator.js.
    LMPC Rules 2011, Second Schedule.
    """
    slabs = LMPC_RULES.get("weight_slabs_font_mapping", [])
    for slab in slabs:
        rnge = slab.get("net_quantity_range", {})

        if "min_inclusive_g_ml" in rnge and net_weight_g < rnge["min_inclusive_g_ml"]:
            continue
        if "min_exclusive_g_ml" in rnge and net_weight_g <= rnge["min_exclusive_g_ml"]:
            continue
        if "max_inclusive_g_ml" in rnge and net_weight_g > rnge["max_inclusive_g_ml"]:
            continue

        return slab

    # Fallback: return last slab (largest range), matching JS behaviour
    return slabs[-1] if slabs else None


# ── Prohibited expressions ─────────────────────────────────────────────────────

def detect_prohibited_expressions(ocr_text: str) -> list[dict]:
    """
    Scan raw OCR text for prohibited LMPC expressions using whole-word matching.

    Mirrors ``detectProhibitedExpressions`` in lmpcValidator.js.
    Covers Rule 11(1) and Rule 13 / Second Schedule.
    """
    if not ocr_text or not isinstance(ocr_text, str):
        return []

    text_lower = ocr_text.lower()
    violations = []

    for expr in LMPC_RULES.get("prohibited_expressions", []):
        term = expr["term"]
        # Whole-word / phrase boundary match (mirrors JS \b regex)
        pattern = r"\b" + re.escape(term) + r"\b"
        if re.search(pattern, text_lower):
            violations.append({
                "field": "net_weight_format",
                "plain": f"Found prohibited expression: '{term}'. Reason: {expr['reason']}",
                "rule": expr["rule"],
                "severity": "high",
            })

    return violations


# ── Consumer care validation ───────────────────────────────────────────────────

def validate_consumer_care(details: dict) -> dict:
    """
    Validate consumer care declaration completeness.

    Mirrors ``validateConsumerCare`` in lmpcValidator.js.

    Args:
        details: dict with keys from mandatory_consumer_care_fields
                 (name, telephone, email, address)

    Returns:
        {
            "isComplete": bool,
            "missingFields": [{"key": ..., "label": ..., "mandatory": ...}, ...],
            "score": int   # 0-100 completeness score
        }
    """
    mandatory = LMPC_RULES.get("mandatory_consumer_care_fields", [])
    missing = []

    for field_def in mandatory:
        key = field_def["key"]
        val = details.get(key)
        if not val or (isinstance(val, str) and not val.strip()):
            missing.append(field_def)

    total = len(mandatory)
    score = round(((total - len(missing)) / total) * 100) if total > 0 else 0

    return {
        "isComplete": len(missing) == 0,
        "missingFields": missing,
        "score": score,
    }


# ── Pixel / font helpers ───────────────────────────────────────────────────────

def calculate_pixel_per_mm(coin_pixel_diameter: float) -> float:
    """
    Calculate pixel-to-mm ratio using a reference calibration coin.

    Uses the Indian 5-Rupee coin (23 mm diameter) from lmpcRules.json.
    Mirrors ``calculatePixelPerMm`` in lmpcValidator.js.

    Args:
        coin_pixel_diameter: Detected diameter of the coin in pixels.

    Returns:
        Pixels per millimetre, or 0.0 if input is invalid.
    """
    standard_diameter_mm: float = LMPC_RULES.get("coin_reference", {}).get("diameter_mm", 23.0)
    if not coin_pixel_diameter or coin_pixel_diameter <= 0:
        return 0.0
    return coin_pixel_diameter / standard_diameter_mm


def convert_px_to_mm(font_px: float, pixel_per_mm: float) -> float:
    """
    Convert a font height measurement from pixels to millimetres.

    Mirrors ``convertPxToMm`` in lmpcValidator.js.

    Args:
        font_px:      Font height in pixels.
        pixel_per_mm: Calibrated pixels-per-mm ratio from calculate_pixel_per_mm().

    Returns:
        Height in millimetres (rounded to 2 decimal places), or 0.0 if ratio invalid.
    """
    if not pixel_per_mm or pixel_per_mm <= 0:
        return 0.0
    return round(font_px / pixel_per_mm, 2)


# ── Main validator ─────────────────────────────────────────────────────────────

def validate_package_data(
    extracted_data: dict,
    ocr_full_text: str = "",
) -> tuple[list, list, str, str]:
    """
    Main orchestration function: validate extracted fields against LMPC rules.

    Checks (in order):
      1. Prohibited expressions in OCR text (Rule 11(1), Rule 13)
      2. Manufacturer name & address (Rule 6(1)(a))
      3. Net weight / quantity (Rule 6(1)(c)) + font-slab height (Rule 7)
      4. Consumer care declaration (Rule 6(1)(f)) — when present in extracted_data
      5. Confidence-based review routing

    Args:
        extracted_data: Dict of extracted package fields.
        ocr_full_text:  Full raw OCR text for prohibited-expression scanning.

    Returns:
        (fields, violations, verdict, verdictNote)
    """
    fields: list[dict] = []
    violations: list[dict] = []

    # ── 1. Prohibited expressions ──────────────────────────────────────────────
    if ocr_full_text:
        violations.extend(detect_prohibited_expressions(ocr_full_text))

    # ── 2. Manufacturer name & address — Rule 6(1)(a) ─────────────────────────
    mfg_val = extracted_data.get("manufacturer", "")
    mfg_conf = float(extracted_data.get("manufacturer_confidence", 92.0))

    if mfg_val:
        fields.append({
            "label": "Manufacturer name & address",
            "value": mfg_val,
            "source": "pack",
            "status": "ok",
            "confidence": mfg_conf,
            "rule": "Rule 6(1)(a)",
        })
    else:
        fields.append({
            "label": "Manufacturer name & address",
            "value": "Not found",
            "source": "pack",
            "status": "missing",
            "confidence": 0.0,
            "rule": "Rule 6(1)(a)",
        })
        violations.append({
            "field": "manufacturer",
            "plain": "Manufacturer name and address is missing",
            "rule": "Rule 6(1)(a)",
            "severity": "critical",
        })

    # ── 3. Net weight / quantity — Rule 6(1)(c) + Rule 7 ─────────────────────
    net_weight_val = extracted_data.get("net_weight_g")
    net_weight_str = extracted_data.get("net_weight_str", "")
    net_qty_conf = float(extracted_data.get("net_weight_confidence", 95.0))

    if net_weight_val:
        # Font slab check (Rule 7)
        font_height = extracted_data.get("net_weight_font_height_mm")
        if font_height is not None:
            slab = resolve_font_slab(float(net_weight_val))
            if slab and float(font_height) < slab["mandatory_min_font_height_mm"]:
                violations.append({
                    "field": "net_weight_font",
                    "plain": (
                        f"Font height ({font_height}mm) is smaller than required "
                        f"{slab['mandatory_min_font_height_mm']}mm "
                        f"for slab '{slab['name']}'"
                    ),
                    "rule": "Rule 7",
                    "severity": "medium",
                })

        fields.append({
            "label": "Net quantity",
            "value": net_weight_str or f"{net_weight_val}g",
            "source": "pack",
            "status": "ok",
            "confidence": net_qty_conf,
            "rule": "Rule 6(1)(c)",
        })
    else:
        fields.append({
            "label": "Net quantity",
            "value": "Not found",
            "source": "pack",
            "status": "missing",
            "confidence": 0.0,
            "rule": "Rule 6(1)(c)",
        })
        violations.append({
            "field": "net_weight",
            "plain": "Net quantity declaration is missing",
            "rule": "Rule 6(1)(c)",
            "severity": "critical",
        })

    # ── 4. Consumer care — Rule 6(1)(f) ───────────────────────────────────────
    consumer_care = extracted_data.get("consumer_care")
    if consumer_care and isinstance(consumer_care, dict):
        care_result = validate_consumer_care(consumer_care)

        for missing_field in care_result["missingFields"]:
            violations.append({
                "field": f"consumer_care_{missing_field['key']}",
                "plain": (
                    f"Consumer care declaration is missing mandatory field: "
                    f"'{missing_field['label']}'"
                ),
                "rule": "Rule 6(1)(f)",
                "severity": "medium",
            })

        care_status = "ok" if care_result["isComplete"] else "review"
        fields.append({
            "label": "Consumer care declaration",
            "value": (
                "Complete" if care_result["isComplete"]
                else f"Incomplete ({care_result['score']}% present)"
            ),
            "source": "pack",
            "status": care_status,
            "confidence": float(care_result["score"]),
            "rule": "Rule 6(1)(f)",
        })

    # ── 5. Confidence-based verdict routing ───────────────────────────────────
    # Compute base verdict from violation severity
    if any(v["severity"] == "critical" for v in violations):
        verdict = "fail"
        verdictNote = "Critical LMPC violations detected. Missing mandatory declarations."
    elif violations:
        verdict = "review"
        verdictNote = f"Detected {len(violations)} potential LMPC formatting issues requiring review."
    else:
        verdict = "pass"
        verdictNote = "All LMPC rules appear to be followed based on visible pack data."

    # If any 'ok' field has confidence below the human_review threshold,
    # downgrade a 'pass' to 'review' (never downgrade a 'fail').
    if verdict == "pass":
        human_review_threshold = _THRESHOLDS.get("human_review", 75)
        ok_confidences = [
            f["confidence"] for f in fields if f["status"] == "ok"
        ]
        if ok_confidences and min(ok_confidences) < human_review_threshold:
            verdict = "review"
            min_conf = min(ok_confidences)
            verdictNote = (
                f"Low extraction confidence ({min_conf:.1f}%) on one or more fields — "
                "manual review recommended before issuing a citation."
            )

    return fields, violations, verdict, verdictNote
