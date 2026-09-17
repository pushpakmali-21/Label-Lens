"""
app/services/vision/classifier.py
───────────────────────────────────
Sprint 2 stub: confidence-weighted verdict classifier.

Real implementation (Sprint 2) will:
  - Aggregate per-field detection + OCR confidence scores
  - Apply thresholds from lmpcRules.json (auto_pass: 85, human_review: 75, auto_fail: 40)
  - Route low-confidence extractions to "review" rather than an automatic pass/fail

Sprint 1: delegates straight to lmpc_validator — the threshold check is already
applied there via the confidence_thresholds from lmpcRules.json.
"""

from __future__ import annotations

from typing import Optional

from app.services.vision.types import ConfidenceScore


def classify_verdict(
    fields: list[dict],
    violations: list[dict],
    field_confidences: Optional[list[ConfidenceScore]] = None,
) -> tuple[str, str]:
    """
    Classify the final verdict from validated fields, violations, and confidence scores.

    Sprint 1 stub — delegates to the rule engine's own verdict calculation.
    The calling code (validate_package_data) already computes and returns
    (verdict, verdictNote); this function is a thin pass-through that Sprint 2
    will replace with confidence-weighted logic.

    Args:
        fields:            List of FieldResult dicts from the validator.
        violations:        List of ViolationResult dicts from the validator.
        field_confidences: Optional per-field ConfidenceScore list (Sprint 2).

    Returns:
        Tuple of (verdict, verdictNote) strings.
        verdict in {"pass", "review", "fail"}.
    """
    # Determine base verdict from severity
    if any(v.get("severity") == "critical" for v in violations):
        base_verdict = "fail"
        note = "Critical LMPC violations detected. Missing mandatory declarations."
    elif violations:
        base_verdict = "review"
        note = f"Detected {len(violations)} potential LMPC formatting issues requiring review."
    else:
        base_verdict = "pass"
        note = "All LMPC rules appear to be followed based on visible pack data."

    # Sprint 2: apply confidence-based downgrade here
    # if field_confidences:
    #     min_conf = min((fc.confidence for fc in field_confidences), default=100.0)
    #     if min_conf < THRESHOLDS["human_review"] and base_verdict == "pass":
    #         return "review", f"Low OCR confidence ({min_conf:.1f}%) — manual review required."

    return base_verdict, note
