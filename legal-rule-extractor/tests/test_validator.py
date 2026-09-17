"""
test_validator.py

Tests for the validation checklist.
"""

import unittest

from src.validator import validate


def _minimal_valid_output(n_rules=2) -> dict:
    rules = []
    for i in range(1, n_rules + 1):
        rules.append({
            "rule_id": f"LMPC_001_RULE_{i:03d}",
            "rule_number": str(i),
            "title": f"Rule {i}",
            "text": f"Text of rule {i}.",
            "subsections": [],
            "provisos": [],
            "definitions": [],
            "amendment_refs": [],
            "page_start": i,
            "page_end": i,
            "chapter": None,
        })
    return {
        "document": {"page_count": 10},
        "rules": rules,
        "tables": [],
    }


class TestValidator(unittest.TestCase):
    def test_passes_on_valid_output(self):
        output = _minimal_valid_output()
        results = validate(output)
        failed = [v for v in results if not v.passed]
        self.assertEqual(failed, [], msg=f"Failed checks: {failed}")

    def test_fails_when_no_rules(self):
        output = _minimal_valid_output()
        output["rules"] = []
        results = validate(output)
        rules_check = next(v for v in results if v.check == "Rules detected")
        self.assertFalse(rules_check.passed)

    def test_fails_when_no_page_count(self):
        output = _minimal_valid_output()
        output["document"]["page_count"] = 0
        results = validate(output)
        page_check = next(v for v in results if "opened" in v.check)
        self.assertFalse(page_check.passed)

    def test_fails_when_rule_missing_id(self):
        output = _minimal_valid_output()
        output["rules"][0]["rule_id"] = ""
        results = validate(output)
        id_check = next(v for v in results if "Stable IDs" in v.check)
        self.assertFalse(id_check.passed)

    def test_json_validity_check(self):
        output = _minimal_valid_output()
        results = validate(output)
        json_check = next(v for v in results if v.check == "JSON is valid")
        self.assertTrue(json_check.passed)


if __name__ == "__main__":
    unittest.main()
