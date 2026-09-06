import json
import os
from pathlib import Path

# Load rules once on startup
RULES_PATH = Path(__file__).parent.parent / "data" / "lmpcRules.json"
with open(RULES_PATH, "r") as f:
    LMPC_RULES = json.load(f)

def resolve_font_slab(net_weight_g: float) -> dict:
    """Determine the required font slab based on net weight."""
    slabs = LMPC_RULES.get("weight_slabs_font_mapping", [])
    for slab in slabs:
        rnge = slab.get("net_quantity_range", {})
        
        # Check inclusive/exclusive min bounds
        if "min_inclusive_g_ml" in rnge and net_weight_g < rnge["min_inclusive_g_ml"]:
            continue
        if "min_exclusive_g_ml" in rnge and net_weight_g <= rnge["min_exclusive_g_ml"]:
            continue
            
        # Check inclusive max bound
        if "max_inclusive_g_ml" in rnge and net_weight_g > rnge["max_inclusive_g_ml"]:
            continue
            
        return slab
    return None

def detect_prohibited_expressions(ocr_text: str) -> list:
    """Scan raw OCR text for prohibited LMPC expressions."""
    text_lower = ocr_text.lower()
    violations = []
    
    for expr in LMPC_RULES.get("prohibited_expressions", []):
        if expr["term"] in text_lower:
            violations.append({
                "field": "net_weight_format",
                "plain": f"Found prohibited expression: '{expr['term']}'. Reason: {expr['reason']}",
                "rule": expr["rule"],
                "severity": "high"
            })
            
    return violations

def validate_package_data(extracted_data: dict, ocr_full_text: str = "") -> tuple[list, list, str, str]:
    """
    Main orchestration function to validate extracted fields against LMPC rules.
    Returns: (fields, violations, verdict, verdictNote)
    """
    fields = []
    violations = []
    
    # 1. Prohibited Expressions Check
    if ocr_full_text:
        expr_violations = detect_prohibited_expressions(ocr_full_text)
        violations.extend(expr_violations)
        
    # 2. Manufacturer Name & Address (Rule 6(1)(a))
    mfg_val = extracted_data.get("manufacturer", "")
    if mfg_val:
        fields.append({
            "label": "Manufacturer name & address",
            "value": mfg_val,
            "source": "pack",
            "status": "ok",
            "confidence": 92.0,
            "rule": "Rule 6(1)(a)"
        })
    else:
        fields.append({
            "label": "Manufacturer name & address",
            "value": "Not found",
            "source": "pack",
            "status": "missing",
            "confidence": 0.0,
            "rule": "Rule 6(1)(a)"
        })
        violations.append({
            "field": "manufacturer",
            "plain": "Manufacturer name and address is missing",
            "rule": "Rule 6(1)(a)",
            "severity": "critical"
        })

    # 3. Net Weight / Quantity (Rule 6(1)(c))
    net_weight_val = extracted_data.get("net_weight_g")
    net_weight_str = extracted_data.get("net_weight_str", "")
    if net_weight_val:
        # Check font slab if we have physical measurements
        font_height = extracted_data.get("net_weight_font_height_mm")
        if font_height:
            slab = resolve_font_slab(net_weight_val)
            if slab and font_height < slab["mandatory_min_font_height_mm"]:
                violations.append({
                    "field": "net_weight_font",
                    "plain": f"Font height ({font_height}mm) is smaller than required {slab['mandatory_min_font_height_mm']}mm for slab '{slab['name']}'",
                    "rule": "Rule 7",
                    "severity": "medium"
                })
        
        fields.append({
            "label": "Net quantity",
            "value": net_weight_str or f"{net_weight_val}g",
            "source": "pack",
            "status": "ok",
            "confidence": 95.0,
            "rule": "Rule 6(1)(c)"
        })
    else:
        fields.append({
            "label": "Net quantity",
            "value": "Not found",
            "source": "pack",
            "status": "missing",
            "confidence": 0.0,
            "rule": "Rule 6(1)(c)"
        })
        violations.append({
            "field": "net_weight",
            "plain": "Net quantity declaration is missing",
            "rule": "Rule 6(1)(c)",
            "severity": "critical"
        })
        
    # Compute verdict
    verdict = "pass"
    verdictNote = "All LMPC rules appear to be followed based on visible pack data."
    
    if any(v["severity"] == "critical" for v in violations):
        verdict = "fail"
        verdictNote = "Critical LMPC violations detected. Missing mandatory declarations."
    elif len(violations) > 0:
        verdict = "review"
        verdictNote = f"Detected {len(violations)} potential LMPC formatting issues requiring review."
        
    return fields, violations, verdict, verdictNote
