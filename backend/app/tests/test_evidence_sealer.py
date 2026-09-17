"""
app/tests/test_evidence_sealer.py
───────────────────────────────────
Engineer 3 — evidence integrity tests for evidence_sealer.

Tests verify:
  1. Reproducibility — identical inputs always produce the same hash.
  2. Field sensitivity — changing any single input (image_hash, verdict,
     rule_version, fields, violations, GPS, device_id) changes the hash.
  3. Output structure — all expected keys are present with correct types.
  4. rule_version is embedded in the seal dict.
  5. Serialisation is canonical — list ordering does not affect the hash
     (order within each object does not, but list order does — this is intentional
     because the order of violations is meaningful).
"""

from __future__ import annotations

import copy

import pytest

from app.utils.evidence_sealer import generate_evidence_seal


# ── Shared fixture data ────────────────────────────────────────────────────────

BASE_FIELDS = [
    {"label": "Manufacturer name & address", "value": "Acme Ltd", "source": "pack",
     "status": "ok", "confidence": 92.0, "rule": "Rule 6(1)(a)"},
    {"label": "Net quantity", "value": "250g", "source": "pack",
     "status": "ok", "confidence": 95.0, "rule": "Rule 6(1)(c)"},
]

BASE_VIOLATIONS: list[dict] = []   # clean scan — no violations

BASE_ARGS = dict(
    image_hash="abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    verdict="pass",
    timestamp_iso="2026-09-10T12:00:00",
    rule_version="1.0.4",
    fields=BASE_FIELDS,
    violations=BASE_VIOLATIONS,
    gps_lat=19.076,
    gps_lon=72.877,
    device_id="inspector-device-001",
)


def make_seal(**overrides) -> dict:
    args = {**BASE_ARGS, **overrides}
    return generate_evidence_seal(**args)


# ────────────────────────────────────────────────────────────────────────────────
# Output structure
# ────────────────────────────────────────────────────────────────────────────────

class TestSealStructure:

    def test_returns_dict_with_required_keys(self):
        seal = make_seal()
        for key in ("sha256", "shortHash", "timestamp", "rule_version", "sealed"):
            assert key in seal, f"Missing key: {key}"

    def test_sha256_is_64_hex_chars(self):
        seal = make_seal()
        assert isinstance(seal["sha256"], str)
        assert len(seal["sha256"]) == 64
        assert all(c in "0123456789abcdef" for c in seal["sha256"])

    def test_short_hash_is_first_8_chars_of_sha256(self):
        seal = make_seal()
        assert seal["shortHash"] == seal["sha256"][:8]

    def test_sealed_is_true(self):
        assert make_seal()["sealed"] is True

    def test_timestamp_preserved(self):
        seal = make_seal(timestamp_iso="2026-01-15T08:30:00")
        assert seal["timestamp"] == "2026-01-15T08:30:00"

    def test_rule_version_in_seal(self):
        seal = make_seal(rule_version="1.0.4")
        assert seal["rule_version"] == "1.0.4"


# ────────────────────────────────────────────────────────────────────────────────
# Reproducibility
# ────────────────────────────────────────────────────────────────────────────────

class TestReproducibility:

    def test_same_inputs_same_hash(self):
        seal_a = make_seal()
        seal_b = make_seal()
        assert seal_a["sha256"] == seal_b["sha256"]

    def test_same_inputs_same_hash_multiple_times(self):
        hashes = {make_seal()["sha256"] for _ in range(10)}
        assert len(hashes) == 1

    def test_deep_copy_of_fields_produces_same_hash(self):
        """Ensure the hash doesn't rely on object identity."""
        fields_copy = copy.deepcopy(BASE_FIELDS)
        seal_a = make_seal(fields=BASE_FIELDS)
        seal_b = make_seal(fields=fields_copy)
        assert seal_a["sha256"] == seal_b["sha256"]

    def test_optional_params_absent_same_hash(self):
        """No GPS / device_id — calling twice gives identical hash."""
        args = {k: v for k, v in BASE_ARGS.items()
                if k not in ("gps_lat", "gps_lon", "device_id")}
        seal_a = generate_evidence_seal(**args)
        seal_b = generate_evidence_seal(**args)
        assert seal_a["sha256"] == seal_b["sha256"]


# ────────────────────────────────────────────────────────────────────────────────
# Field sensitivity — any change must alter the hash
# ────────────────────────────────────────────────────────────────────────────────

class TestFieldSensitivity:

    def _base_hash(self) -> str:
        return make_seal()["sha256"]

    def test_different_image_hash_changes_seal(self):
        h = make_seal(image_hash="0" * 64)["sha256"]
        assert h != self._base_hash()

    def test_different_verdict_changes_seal(self):
        h = make_seal(verdict="fail")["sha256"]
        assert h != self._base_hash()

    def test_different_rule_version_changes_seal(self):
        h = make_seal(rule_version="2.0.0")["sha256"]
        assert h != self._base_hash()

    def test_different_timestamp_changes_seal(self):
        h = make_seal(timestamp_iso="2020-01-01T00:00:00")["sha256"]
        assert h != self._base_hash()

    def test_different_gps_lat_changes_seal(self):
        h = make_seal(gps_lat=28.644)["sha256"]
        assert h != self._base_hash()

    def test_different_gps_lon_changes_seal(self):
        h = make_seal(gps_lon=77.216)["sha256"]
        assert h != self._base_hash()

    def test_different_device_id_changes_seal(self):
        h = make_seal(device_id="other-device-999")["sha256"]
        assert h != self._base_hash()

    def test_added_violation_changes_seal(self):
        """Adding a violation to the list must change the seal."""
        violations_with_one = [
            {"field": "manufacturer", "plain": "Missing", "rule": "Rule 6(1)(a)",
             "severity": "critical"},
        ]
        h = make_seal(violations=violations_with_one)["sha256"]
        assert h != self._base_hash()

    def test_mutated_field_value_changes_seal(self):
        """Changing a field value (e.g. verdict note) must change the seal."""
        mutated_fields = copy.deepcopy(BASE_FIELDS)
        mutated_fields[0]["value"] = "TAMPERED VALUE"
        h = make_seal(fields=mutated_fields)["sha256"]
        assert h != self._base_hash()

    def test_mutated_field_confidence_changes_seal(self):
        mutated_fields = copy.deepcopy(BASE_FIELDS)
        mutated_fields[0]["confidence"] = 0.0   # lower confidence
        h = make_seal(fields=mutated_fields)["sha256"]
        assert h != self._base_hash()

    def test_extra_field_appended_to_list_changes_seal(self):
        extra_fields = BASE_FIELDS + [{
            "label": "Consumer care declaration", "value": "Incomplete (50% present)",
            "source": "pack", "status": "review", "confidence": 50.0,
            "rule": "Rule 6(1)(f)",
        }]
        h = make_seal(fields=extra_fields)["sha256"]
        assert h != self._base_hash()

    def test_missing_gps_vs_provided_gps_differ(self):
        """Providing GPS vs omitting it must produce different hashes."""
        h_with_gps = make_seal(gps_lat=19.076, gps_lon=72.877)["sha256"]
        h_no_gps = make_seal(gps_lat=None, gps_lon=None)["sha256"]
        assert h_with_gps != h_no_gps

    def test_missing_device_id_vs_provided_differ(self):
        h_with = make_seal(device_id="dev-001")["sha256"]
        h_without = make_seal(device_id=None)["sha256"]
        assert h_with != h_without


# ────────────────────────────────────────────────────────────────────────────────
# Edge cases
# ────────────────────────────────────────────────────────────────────────────────

class TestEdgeCases:

    def test_empty_fields_and_violations_is_stable(self):
        seal_a = make_seal(fields=[], violations=[])
        seal_b = make_seal(fields=[], violations=[])
        assert seal_a["sha256"] == seal_b["sha256"]

    def test_none_fields_defaults_to_empty_list(self):
        """Passing fields=None should be treated as []."""
        seal_none = generate_evidence_seal(
            image_hash=BASE_ARGS["image_hash"],
            verdict=BASE_ARGS["verdict"],
            timestamp_iso=BASE_ARGS["timestamp_iso"],
            rule_version=BASE_ARGS["rule_version"],
            fields=None,
            violations=None,
        )
        seal_empty = generate_evidence_seal(
            image_hash=BASE_ARGS["image_hash"],
            verdict=BASE_ARGS["verdict"],
            timestamp_iso=BASE_ARGS["timestamp_iso"],
            rule_version=BASE_ARGS["rule_version"],
            fields=[],
            violations=[],
        )
        # Both treat missing lists as [] — should produce the same hash
        assert seal_none["sha256"] == seal_empty["sha256"]

    def test_unicode_values_in_fields_do_not_crash(self):
        """Unicode manufacturer names (Hindi / Tamil) must not crash serialisation."""
        unicode_fields = [
            {"label": "Manufacturer name & address",
             "value": "अमूल डेयरी, आनंद, गुजरात",
             "source": "pack", "status": "ok", "confidence": 91.0, "rule": "Rule 6(1)(a)"},
        ]
        seal = make_seal(fields=unicode_fields)
        assert len(seal["sha256"]) == 64

    def test_large_violation_list_is_stable(self):
        """Many violations should not cause performance or serialisation issues."""
        many_violations = [
            {"field": f"field_{i}", "plain": f"Issue {i}", "rule": f"Rule {i}",
             "severity": "medium"}
            for i in range(50)
        ]
        seal_a = make_seal(violations=many_violations)
        seal_b = make_seal(violations=many_violations)
        assert seal_a["sha256"] == seal_b["sha256"]

    def test_violation_order_matters(self):
        """The order of violations in the list is part of the hash — intentional."""
        v1 = {"field": "a", "plain": "first",  "rule": "R1", "severity": "medium"}
        v2 = {"field": "b", "plain": "second", "rule": "R2", "severity": "high"}
        hash_ab = make_seal(violations=[v1, v2])["sha256"]
        hash_ba = make_seal(violations=[v2, v1])["sha256"]
        assert hash_ab != hash_ba
