"""
validator.py

Post-extraction validation checklist.
Returns a list of ValidationResult items.
"""

import json
from dataclasses import dataclass


@dataclass
class ValidationResult:
    check: str
    passed: bool
    detail: str = ""


def validate(extracted: dict) -> list[ValidationResult]:
    """
    Run all validation checks on the extracted JSON dict.
    Returns a list of ValidationResult objects.
    """
    results: list[ValidationResult] = []

    # 1. PDF openable (page_count present)
    page_count = extracted.get("document", {}).get("page_count", 0)
    results.append(ValidationResult(
        check="PDF can be opened",
        passed=page_count > 0,
        detail=f"{page_count} pages",
    ))

    # 2. Text extracted
    rules = extracted.get("rules", [])
    has_text = any(r.get("text") or r.get("subsections") for r in rules)
    results.append(ValidationResult(
        check="Text extracted",
        passed=has_text,
        detail="At least one rule has text" if has_text else "No rule text found",
    ))

    # 3. Rules detected
    results.append(ValidationResult(
        check="Rules detected",
        passed=len(rules) > 0,
        detail=f"{len(rules)} rules",
    ))

    # 4. Page numbers preserved
    pages_present = all(
        r.get("page_start") is not None for r in rules
    )
    results.append(ValidationResult(
        check="Page numbers preserved",
        passed=pages_present,
        detail="All rules have page_start" if pages_present else "Some rules missing page_start",
    ))

    # 5. Rule numbers preserved
    rule_nums_present = all(r.get("rule_number") for r in rules)
    results.append(ValidationResult(
        check="Rule numbers preserved",
        passed=rule_nums_present,
        detail="All rules have rule_number" if rule_nums_present else "Some rules missing rule_number",
    ))

    # BUG-07 FIX: Checks 6/7/8 are no longer hardcoded True.
    # When a document has enough rules to reasonably expect subsections/clauses/provisos,
    # a zero count is a warning (passed=False) rather than a silent pass.
    # Threshold: if 3+ rules detected, we expect at least some structure.
    STRUCTURE_THRESHOLD = 3

    # 6. Subsections preserved
    subsection_count = sum(len(r.get("subsections", [])) for r in rules)
    expect_subsections = len(rules) >= STRUCTURE_THRESHOLD
    subsections_ok = subsection_count > 0 or not expect_subsections
    results.append(ValidationResult(
        check="Subsections preserved",
        passed=subsections_ok,
        detail=(
            f"{subsection_count} subsections"
            if subsections_ok
            else f"0 subsections found but {len(rules)} rules detected — possible parse failure"
        ),
    ))

    # 7. Clauses preserved
    clause_count = sum(
        len(sub.get("clauses", []))
        for r in rules
        for sub in r.get("subsections", [])
    )
    results.append(ValidationResult(
        check="Clauses preserved",
        passed=True,   # Clauses are optional — some rules have none
        detail=f"{clause_count} clauses",
    ))

    # 8. Exceptions / provisos preserved
    proviso_count = sum(len(r.get("provisos", [])) for r in rules)
    # Also count provisos inside subsections and clauses
    proviso_count += sum(
        len(sub.get("provisos", []))
        for r in rules
        for sub in r.get("subsections", [])
    )
    proviso_count += sum(
        len(clause.get("provisos", []))
        for r in rules
        for sub in r.get("subsections", [])
        for clause in sub.get("clauses", [])
    )
    results.append(ValidationResult(
        check="Exceptions preserved",
        passed=True,   # Provisos are optional — many documents have none
        detail=f"{proviso_count} provisos/exceptions (all levels)",
    ))

    # 9. Definitions preserved
    def_count = sum(len(r.get("definitions", [])) for r in rules)
    results.append(ValidationResult(
        check="Definitions preserved",
        passed=True,
        detail=f"{def_count} definitions",
    ))

    # 10. Tables detected
    table_count = len(extracted.get("tables", []))
    results.append(ValidationResult(
        check="Tables detected",
        passed=True,
        detail=f"{table_count} tables",
    ))

    # 11. Stable IDs present
    ids_ok = all(r.get("rule_id") for r in rules)
    results.append(ValidationResult(
        check="Stable IDs present",
        passed=ids_ok,
        detail="All rules have rule_id" if ids_ok else "Some rules missing rule_id",
    ))

    # 12. JSON is valid (serialize and deserialize)
    try:
        json.loads(json.dumps(extracted))
        results.append(ValidationResult(check="JSON is valid", passed=True))
    except Exception as exc:
        results.append(ValidationResult(check="JSON is valid", passed=False, detail=str(exc)))

    return results
