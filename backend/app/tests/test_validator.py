"""
app/tests/test_validator.py
────────────────────────────
Unit tests for lmpc_validator helpers:
  - validate_consumer_care
  - calculate_pixel_per_mm
  - convert_px_to_mm
  - confidence-based review routing in validate_package_data
  - QR parser (parse_qr_payload)
"""

import pytest
from app.utils.lmpc_validator import (
    validate_consumer_care,
    calculate_pixel_per_mm,
    convert_px_to_mm,
    validate_package_data,
    resolve_font_slab,
    detect_prohibited_expressions,
)
from app.services.vision.qr_parser import parse_qr_payload


# ────────────────────────────────────────────────────────────────────────────────
# validate_consumer_care
# ────────────────────────────────────────────────────────────────────────────────

class TestValidateConsumerCare:

    def test_complete_details_returns_complete(self):
        details = {
            "name": "Consumer Affairs Officer",
            "telephone": "1800-111-0000",
            "email": "care@example.com",
            "address": "123 Consumer Lane, New Delhi",
        }
        result = validate_consumer_care(details)
        assert result["isComplete"] is True
        assert result["missingFields"] == []
        assert result["score"] == 100

    def test_all_missing_returns_zero_score(self):
        result = validate_consumer_care({})
        assert result["isComplete"] is False
        assert len(result["missingFields"]) == 4
        assert result["score"] == 0

    def test_partial_two_missing_returns_50(self):
        details = {
            "name": "Care Desk",
            "telephone": "1800-000-0001",
        }
        result = validate_consumer_care(details)
        assert result["isComplete"] is False
        assert len(result["missingFields"]) == 2
        assert result["score"] == 50

    def test_whitespace_only_value_counts_as_missing(self):
        details = {
            "name": "   ",   # whitespace only
            "telephone": "1800-000-0001",
            "email": "care@example.com",
            "address": "Some address",
        }
        result = validate_consumer_care(details)
        assert result["isComplete"] is False
        missing_keys = [f["key"] for f in result["missingFields"]]
        assert "name" in missing_keys

    def test_missing_fields_have_key_and_label(self):
        result = validate_consumer_care({})
        for field in result["missingFields"]:
            assert "key" in field
            assert "label" in field


# ────────────────────────────────────────────────────────────────────────────────
# calculate_pixel_per_mm
# ────────────────────────────────────────────────────────────────────────────────

class TestCalculatePixelPerMm:

    def test_known_coin_diameter(self):
        # Indian 5-rupee coin = 23mm diameter
        # If coin appears as 230px wide, ratio = 230/23 = 10 px/mm
        ratio = calculate_pixel_per_mm(230.0)
        assert ratio == pytest.approx(10.0, rel=1e-6)

    def test_zero_diameter_returns_zero(self):
        assert calculate_pixel_per_mm(0.0) == 0.0

    def test_negative_diameter_returns_zero(self):
        assert calculate_pixel_per_mm(-5.0) == 0.0

    def test_none_returns_zero(self):
        assert calculate_pixel_per_mm(None) == 0.0

    def test_standard_23mm_coin_at_115px(self):
        ratio = calculate_pixel_per_mm(115.0)
        assert ratio == pytest.approx(5.0, rel=1e-6)


# ────────────────────────────────────────────────────────────────────────────────
# convert_px_to_mm
# ────────────────────────────────────────────────────────────────────────────────

class TestConvertPxToMm:

    def test_basic_conversion(self):
        # 20px at 10px/mm = 2.0mm
        result = convert_px_to_mm(20.0, 10.0)
        assert result == pytest.approx(2.0)

    def test_zero_pixel_per_mm_returns_zero(self):
        assert convert_px_to_mm(20.0, 0.0) == 0.0

    def test_negative_pixel_per_mm_returns_zero(self):
        assert convert_px_to_mm(20.0, -1.0) == 0.0

    def test_result_is_two_decimal_precision(self):
        result = convert_px_to_mm(10.0, 3.0)
        # 10/3 = 3.333... → rounded to 3.33
        assert result == pytest.approx(3.33, rel=1e-3)

    def test_round_trip(self):
        coin_px = 230.0                        # coin detected at 230px
        ratio = calculate_pixel_per_mm(coin_px)  # → 10.0 px/mm
        font_px = 45.0
        font_mm = convert_px_to_mm(font_px, ratio)  # → 4.5mm
        assert font_mm == pytest.approx(4.5, rel=1e-3)


# ────────────────────────────────────────────────────────────────────────────────
# confidence-based review routing in validate_package_data
# ────────────────────────────────────────────────────────────────────────────────

class TestConfidenceRouting:

    def test_low_confidence_field_triggers_review(self):
        """
        If manufacturer is present but with confidence < human_review threshold (75),
        the verdict should be 'review' even if there are no rule violations.
        """
        extracted = {
            "manufacturer": "Some Company Ltd",
            "manufacturer_confidence": 60.0,    # below human_review threshold (75)
            "net_weight_g": 100.0,
            "net_weight_str": "100g",
            "net_weight_font_height_mm": 2.5,   # valid for SLAB_B
            "ocr_full_text": "Some Company Ltd 100g",
        }
        fields, violations, verdict, verdictNote = validate_package_data(
            extracted, extracted["ocr_full_text"]
        )
        assert verdict == "review"
        assert "confidence" in verdictNote.lower() or "review" in verdictNote.lower()

    def test_high_confidence_passes(self):
        """All fields present with confidence >= 85 should return 'pass'."""
        extracted = {
            "manufacturer": "Top Grade Foods, Mumbai",
            "manufacturer_confidence": 95.0,
            "net_weight_g": 100.0,
            "net_weight_str": "100g",
            "net_weight_font_height_mm": 2.5,
            "net_weight_confidence": 95.0,
            "ocr_full_text": "Top Grade Foods, Mumbai 100g",
        }
        fields, violations, verdict, _ = validate_package_data(
            extracted, extracted["ocr_full_text"]
        )
        assert verdict == "pass"

    def test_critical_violation_stays_fail_despite_low_confidence(self):
        """A missing manufacturer is 'fail' regardless of other field confidences."""
        extracted = {
            # No manufacturer
            "net_weight_g": 100.0,
            "net_weight_str": "100g",
            "net_weight_font_height_mm": 2.5,
            "net_weight_confidence": 60.0,   # low, but shouldn't matter
            "ocr_full_text": "100g",
        }
        _, violations, verdict, _ = validate_package_data(extracted, "100g")
        assert verdict == "fail"
        severity_values = [v["severity"] for v in violations]
        assert "critical" in severity_values


# ────────────────────────────────────────────────────────────────────────────────
# QR parser
# ────────────────────────────────────────────────────────────────────────────────

class TestQRParser:

    def test_json_payload_full(self):
        import json
        qr = json.dumps({
            "manufacturer": "Fresh Foods Ltd, Pune",
            "net_weight_str": "500g",
            "net_weight_g": 500.0,
            "mrp": 120.0,
        })
        fields = parse_qr_payload(qr)
        assert fields["manufacturer"] == "Fresh Foods Ltd, Pune"
        assert fields["net_weight_g"] == pytest.approx(500.0)

    def test_json_payload_net_weight_str_auto_resolves_g(self):
        import json
        qr = json.dumps({"manufacturer": "X Corp", "net_weight_str": "250g"})
        fields = parse_qr_payload(qr)
        assert "net_weight_g" in fields
        assert fields["net_weight_g"] == pytest.approx(250.0)

    def test_kv_payload_parses_manufacturer_and_net(self):
        qr = "Manufacturer: Sunrise Agro, Nashik\nNet: 250g\nMRP: 40"
        fields = parse_qr_payload(qr)
        assert "manufacturer" in fields
        assert fields["manufacturer"] == "Sunrise Agro, Nashik"
        assert fields["net_weight_g"] == pytest.approx(250.0)

    def test_heuristic_payload(self):
        """Free-text with weight suffix and a numeric token."""
        fields = parse_qr_payload("Acme Corp 100g 50 INR")
        # Should extract net weight at minimum
        assert "net_weight_str" in fields or "net_weight_g" in fields

    def test_empty_payload_raises_value_error(self):
        with pytest.raises(ValueError, match="empty"):
            parse_qr_payload("   ")

    def test_junk_payload_raises_value_error(self):
        with pytest.raises(ValueError):
            parse_qr_payload("!@#$%^&*()")

    def test_kg_weight_normalised_to_grams(self):
        import json
        qr = json.dumps({"manufacturer": "BigPack Co", "net_weight_str": "2kg"})
        fields = parse_qr_payload(qr)
        assert fields["net_weight_g"] == pytest.approx(2000.0)

    def test_mrp_coerced_to_float(self):
        qr = "Manufacturer: Some Co\nMRP: 99.50"
        fields = parse_qr_payload(qr)
        assert isinstance(fields.get("mrp"), float)
        assert fields["mrp"] == pytest.approx(99.50)

    def test_heuristic_junk_free_text_raises(self):
        """Pure symbol garbage should raise ValueError."""
        with pytest.raises(ValueError):
            parse_qr_payload("@@@###$$$")
