"""
app/tests/test_lmpc_validator.py
──────────────────────────────────
Engineer 3 — defensive input validation tests for lmpc_validator.

Tests verify that:
  1. Corrupted / un-parseable field values are coerced to None (not a crash).
  2. String-encoded numbers are silently coerced to float.
  3. Unknown extra keys are ignored.
  4. Completely empty / None inputs produce a safe verdict.
  5. rule_version is always a non-empty string in the returned tuple.
  6. RULE_ENGINE_VERSION module constant is populated and matches the JSON file.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.utils.lmpc_validator import (
    validate_package_data,
    RULE_ENGINE_VERSION,
    LMPC_RULES,
)
from app.schemas.vision import ExtractedPackageData, ConsumerCareDetails


# ────────────────────────────────────────────────────────────────────────────────
# RULE_ENGINE_VERSION module constant
# ────────────────────────────────────────────────────────────────────────────────

class TestRuleEngineVersion:

    def test_version_is_non_empty_string(self):
        assert isinstance(RULE_ENGINE_VERSION, str)
        assert len(RULE_ENGINE_VERSION) > 0

    def test_version_matches_json_file(self):
        rules_path = Path(__file__).parent.parent / "data" / "lmpcRules.json"
        with open(rules_path) as f:
            raw = json.load(f)
        assert RULE_ENGINE_VERSION == raw.get("rule_engine_version")


# ────────────────────────────────────────────────────────────────────────────────
# ExtractedPackageData — defensive Pydantic schema
# ────────────────────────────────────────────────────────────────────────────────

class TestExtractedPackageDataSchema:

    def test_valid_data_passes_through_unchanged(self):
        data = ExtractedPackageData(
            manufacturer="Acme Ltd",
            manufacturer_confidence=92.0,
            net_weight_g=250.0,
            net_weight_str="250g",
            net_weight_confidence=95.0,
        )
        assert data.manufacturer == "Acme Ltd"
        assert data.net_weight_g == pytest.approx(250.0)

    def test_string_encoded_float_coerced(self):
        """net_weight_g='250' (string) should be silently coerced to 250.0."""
        data = ExtractedPackageData(net_weight_g="250", net_weight_confidence="88.5")
        assert data.net_weight_g == pytest.approx(250.0)
        assert data.net_weight_confidence == pytest.approx(88.5)

    def test_unparseable_float_becomes_none(self):
        """net_weight_g='???' cannot be coerced → should become None, not raise."""
        data = ExtractedPackageData(net_weight_g="???", net_weight_font_height_mm="bad")
        assert data.net_weight_g is None
        assert data.net_weight_font_height_mm is None

    def test_extra_keys_are_ignored(self):
        """Unknown pipeline keys (e.g. future YOLO bounding boxes) must not raise."""
        data = ExtractedPackageData(
            manufacturer="Test Co",
            some_future_key="ignored",
            another_unknown_field=42,
        )
        assert data.manufacturer == "Test Co"
        # No AttributeError — extra keys just vanish
        assert not hasattr(data, "some_future_key")

    def test_empty_dict_produces_safe_defaults(self):
        """An empty dict should give us None/defaults everywhere — not crash."""
        data = ExtractedPackageData()
        assert data.manufacturer is None
        assert data.net_weight_g is None
        assert data.consumer_care is None

    def test_none_values_stay_none(self):
        data = ExtractedPackageData(
            manufacturer=None,
            net_weight_g=None,
        )
        assert data.manufacturer is None
        assert data.net_weight_g is None

    def test_consumer_care_parsed_from_dict(self):
        data = ExtractedPackageData(
            consumer_care={
                "name": "Care Dept",
                "telephone": "1800-000-0000",
                "email": "care@example.com",
                "address": "HQ, Mumbai",
            }
        )
        assert data.consumer_care is not None
        assert data.consumer_care.name == "Care Dept"

    def test_consumer_care_with_non_string_values_coerced(self):
        """Integer values in consumer_care sub-fields should be stringified."""
        data = ExtractedPackageData(
            consumer_care={"telephone": 18001110000}
        )
        assert data.consumer_care.telephone == "18001110000"

    def test_whitespace_string_becomes_none(self):
        data = ExtractedPackageData(manufacturer="   ")
        assert data.manufacturer is None

    def test_zero_net_weight_is_valid(self):
        """0.0 is a valid float; should not be silently dropped."""
        data = ExtractedPackageData(net_weight_g=0.0)
        assert data.net_weight_g == pytest.approx(0.0)


# ────────────────────────────────────────────────────────────────────────────────
# validate_package_data — bad / corrupted input safety
# ────────────────────────────────────────────────────────────────────────────────

class TestValidatePackageDataDefensive:

    def _call(self, extracted: dict, ocr: str = "") -> tuple:
        return validate_package_data(extracted, ocr)

    # ── 5-tuple return contract ──────────────────────────────────────────────

    def test_returns_five_tuple(self):
        result = self._call({"manufacturer": "X", "net_weight_g": 100.0})
        assert len(result) == 5

    def test_rule_version_is_always_non_empty(self):
        _, _, _, _, rule_version = self._call({})
        assert isinstance(rule_version, str) and len(rule_version) > 0

    # ── String-encoded numerics ──────────────────────────────────────────────

    def test_string_net_weight_is_handled(self):
        """Passing net_weight_g as a string should not crash."""
        extracted = {
            "manufacturer": "Safe Corp",
            "manufacturer_confidence": 90.0,
            "net_weight_g": "250",   # string, should be coerced
            "net_weight_str": "250g",
            "net_weight_confidence": 90.0,
        }
        fields, violations, verdict, verdictNote, _ = self._call(extracted)
        # net_weight should be found (coerced to 250.0 → present → no violation)
        net_field = next((f for f in fields if "Net" in f["label"]), None)
        assert net_field is not None
        assert net_field["status"] == "ok"

    def test_string_manufacturer_confidence_is_handled(self):
        extracted = {
            "manufacturer": "Alpha Foods",
            "manufacturer_confidence": "88",   # string
            "net_weight_g": 100.0,
        }
        fields, violations, verdict, _, _ = self._call(extracted)
        mfg = next(f for f in fields if "Manufacturer" in f["label"])
        assert mfg["status"] == "ok"
        assert mfg["confidence"] == pytest.approx(88.0)

    # ── Completely unparseable values ────────────────────────────────────────

    def test_garbage_net_weight_treated_as_missing(self):
        """Unparseable net_weight_g → None → triggers 'missing' violation."""
        extracted = {
            "manufacturer": "Good Co",
            "manufacturer_confidence": 90.0,
            "net_weight_g": "NOT_A_NUMBER",
        }
        _, violations, verdict, _, _ = self._call(extracted)
        assert verdict == "fail"
        violation_fields = [v["field"] for v in violations]
        assert "net_weight" in violation_fields

    def test_garbage_manufacturer_confidence_falls_back_to_none(self):
        """
        Un-parseable confidence ('###') → coerce_numeric returns None → validator
        falls back to 0.0.  The manufacturer field IS found (status=ok) but at
        0.0 confidence, which is below the human_review threshold (75), so the
        overall verdict is downgraded to 'review'.
        """
        extracted = {
            "manufacturer": "Test Co",
            "manufacturer_confidence": "###",
            "net_weight_g": 200.0,
            "net_weight_confidence": 90.0,
        }
        fields, violations, verdict, verdictNote, _ = self._call(extracted)
        mfg = next(f for f in fields if "Manufacturer" in f["label"])
        # Field is present but at 0.0 confidence (safe fallback)
        assert mfg["status"] == "ok"
        assert mfg["confidence"] == pytest.approx(0.0)
        # 0.0 confidence < 75 threshold → verdict downgraded from pass to review
        assert verdict in ("review", "fail")

    # ── Empty / minimal inputs ───────────────────────────────────────────────

    def test_empty_dict_returns_fail(self):
        """Completely empty data → all mandatory fields missing → fail."""
        _, violations, verdict, _, _ = self._call({})
        assert verdict == "fail"
        assert len(violations) >= 2  # manufacturer + net_weight

    def test_none_values_treated_as_missing(self):
        extracted = {"manufacturer": None, "net_weight_g": None}
        _, violations, verdict, _, _ = self._call(extracted)
        assert verdict == "fail"

    def test_extra_garbage_keys_do_not_crash(self):
        """Completely unknown keys from a future vision model must not crash."""
        extracted = {
            "manufacturer": "Good Co",
            "manufacturer_confidence": 90.0,
            "net_weight_g": 100.0,
            "net_weight_confidence": 90.0,
            "__pydantic_internal__": "injection_attempt",
            "bbox_coords": [[0, 0, 100, 100]],
            "model_version": "yolov8-nano",
        }
        fields, violations, verdict, _, _ = self._call(extracted)
        # Should not crash; verdict depends on rule checks only
        assert verdict in ("pass", "review", "fail")

    # ── Font slab edge cases ─────────────────────────────────────────────────

    def test_string_font_height_is_handled(self):
        """net_weight_font_height_mm as string should be coerced and checked."""
        extracted = {
            "manufacturer": "Good Co",
            "manufacturer_confidence": 90.0,
            "net_weight_g": 100.0,
            "net_weight_confidence": 90.0,
            "net_weight_font_height_mm": "1.0",   # string, below SLAB_B threshold
        }
        _, violations, verdict, _, _ = self._call(extracted)
        # 1.0mm < 2.0mm required for 100g → font violation
        font_violations = [v for v in violations if v["field"] == "net_weight_font"]
        assert len(font_violations) == 1

    def test_unparseable_font_height_skips_slab_check(self):
        """Garbage font height → None → slab check skipped, no spurious violation."""
        extracted = {
            "manufacturer": "Good Co",
            "manufacturer_confidence": 90.0,
            "net_weight_g": 100.0,
            "net_weight_confidence": 90.0,
            "net_weight_font_height_mm": "GARBAGE",
        }
        _, violations, verdict, _, _ = self._call(extracted)
        font_violations = [v for v in violations if v["field"] == "net_weight_font"]
        # Garbage height → None → no slab comparison → no font violation
        assert len(font_violations) == 0
