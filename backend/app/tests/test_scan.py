"""
app/tests/test_scan.py
───────────────────────
Integration tests for /api/v1/scan/image and /api/v1/scan/qr endpoints.
All tests are offline-safe (no Docker, no DB required).
"""

import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ────────────────────────────────────────────────────────────────────────────────
# /scan/image tests
# ────────────────────────────────────────────────────────────────────────────────

def test_scan_image_offline_stub():
    """Default stub (no extracted_fields) should return a valid ScanResponse shape."""
    payload = {
        "image_base64": "dummy_base64_data",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "device_id": "test_device_01",
    }

    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200

    data = response.json()

    # Assert JSON shape matches ScanResponse
    assert "audit_id" in data
    assert "verdict" in data
    assert "verdictNote" in data
    assert "fields" in data
    assert "violations" in data
    assert "evidence_seal" in data

    # Assert evidence seal shape
    seal = data["evidence_seal"]
    assert "sha256" in seal
    assert "shortHash" in seal
    assert "timestamp" in seal
    assert seal["sealed"] is True

    # Verdict must be one of the three valid values
    assert data["verdict"] in ["pass", "review", "fail"]


def test_scan_image_known_good():
    """A complete, valid set of fields should return verdict == 'pass'."""
    payload = {
        "image_base64": "dummy",
        "device_id": "test_device_02",
        "extracted_fields": {
            "manufacturer": "Acme Corp, Mumbai",
            "net_weight_g": 500.0,
            "net_weight_str": "500g",
            "net_weight_font_height_mm": 5.0,   # Valid for 500g (> 4mm required)
            "ocr_full_text": "Acme Corp, Mumbai. Net weight 500g. Best before 6 months.",
            # All fields have implicitly high confidence (default 92/95)
        },
    }
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "pass"


def test_scan_image_known_bad():
    """Invalid net-weight format + undersized font should return 'review' with Rule 11(1) + Rule 7."""
    payload = {
        "image_base64": "dummy",
        "device_id": "test_device_03",
        "extracted_fields": {
            "manufacturer": "Acme Corp",
            "net_weight_g": 500.0,
            "net_weight_str": "approx 500g",      # "approx" is prohibited
            "net_weight_font_height_mm": 2.0,      # Too small for 500g (needs 4mm)
            "ocr_full_text": "Acme Corp. Approx 500g weight.",
        },
    }
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "review"
    violation_rules = [v["rule"] for v in data["violations"]]
    assert "Rule 11(1)" in violation_rules
    assert "Rule 7" in violation_rules


def test_scan_image_missing_manufacturer():
    """Missing manufacturer should return verdict == 'fail' (critical violation)."""
    payload = {
        "image_base64": "dummy",
        "device_id": "test_device_04",
        "extracted_fields": {
            "net_weight_g": 200.0,
            "net_weight_str": "200g",
            "net_weight_font_height_mm": 2.5,
            "ocr_full_text": "200g net weight",
        },
    }
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "fail"
    violation_fields = [v["field"] for v in data["violations"]]
    assert "manufacturer" in violation_fields


def test_scan_image_consumer_care_partial():
    """Partial consumer-care dict should add review violations without failing."""
    payload = {
        "image_base64": "dummy",
        "device_id": "test_device_05",
        "extracted_fields": {
            "manufacturer": "Good Mnfr Pvt Ltd, Delhi",
            "net_weight_g": 100.0,
            "net_weight_str": "100g",
            "net_weight_font_height_mm": 2.5,
            "ocr_full_text": "Good Mnfr 100g",
            "consumer_care": {
                "name": "Consumer Helpdesk",
                "telephone": "1800-123-4567",
                # email and address intentionally missing
            },
        },
    }
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Should not fail — missing consumer-care fields are medium severity
    assert data["verdict"] in ["review", "pass"]
    violation_rules = [v["rule"] for v in data["violations"]]
    assert "Rule 6(1)(f)" in violation_rules


def test_scan_image_response_shape_stable():
    """Regression: ScanResponse fields must not change shape."""
    response = client.post("/api/v1/scan/image", json={"image_base64": "x"})
    assert response.status_code == 200
    data = response.json()
    required_top_level = {"audit_id", "verdict", "verdictNote", "fields", "violations", "evidence_seal"}
    assert required_top_level == required_top_level & set(data.keys())
    if data["fields"]:
        f = data["fields"][0]
        assert {"label", "value", "source", "status", "confidence", "rule"}.issubset(f.keys())
    seal = data["evidence_seal"]
    assert {"sha256", "shortHash", "timestamp", "sealed"}.issubset(seal.keys())


# ────────────────────────────────────────────────────────────────────────────────
# /scan/qr tests
# ────────────────────────────────────────────────────────────────────────────────

def test_scan_qr_heuristic_payload():
    """Original test: free-text heuristic QR payload returns a valid verdict."""
    payload = {
        "qr_content": "Acme Corp 100g 50 INR",
        "device_id": "qr_scanner_01",
    }
    response = client.post("/api/v1/scan/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "audit_id" in data
    assert data["verdict"] in ["pass", "fail", "review"]


def test_scan_qr_good_json_payload():
    """Well-formed JSON QR with manufacturer + net weight should pass."""
    qr = json.dumps({
        "manufacturer": "Fresh Foods Ltd, Pune",
        "net_weight_str": "500g",
        "net_weight_g": 500.0,
        "net_weight_font_height_mm": 5.0,
        "mrp": 120.0,
    })
    payload = {"qr_content": qr, "device_id": "qr_scanner_02"}
    response = client.post("/api/v1/scan/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "pass", (
        f"Expected pass but got {data['verdict']}; violations: {data['violations']}"
    )


def test_scan_qr_kv_payload():
    """KEY:VALUE line-delimited QR content should be parsed and validated."""
    qr = "Manufacturer: Sunrise Agro, Nashik\nNet: 250g\nMRP: 40"
    payload = {"qr_content": qr, "device_id": "qr_scanner_03"}
    response = client.post("/api/v1/scan/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Should get a valid verdict (pass or review depending on font height absence)
    assert data["verdict"] in ["pass", "review", "fail"]
    assert "audit_id" in data


def test_scan_qr_kv_good_passes():
    """KEY:VALUE with all needed fields + valid font height should pass."""
    qr = (
        "Manufacturer: Happy Snacks Pvt Ltd, Bengaluru\n"
        "Net: 100g\n"
        "MRP: 35\n"
    )
    payload = {"qr_content": qr, "device_id": "qr_scanner_04"}
    response = client.post("/api/v1/scan/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    # manufacturer + net_weight present, no font height (so Rule 7 not triggered)
    # should not be fail
    assert data["verdict"] in ["pass", "review"]


def test_scan_qr_empty_payload_fails():
    """Empty QR content should return verdict == 'fail'."""
    payload = {"qr_content": "   ", "device_id": "qr_scanner_fail_01"}
    response = client.post("/api/v1/scan/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "fail"
    assert len(data["violations"]) > 0
    assert data["violations"][0]["field"] == "qr_content"


def test_scan_qr_junk_payload_fails():
    """Garbage QR content with no useful fields should return verdict == 'fail'."""
    payload = {"qr_content": "!@#$%^&*()", "device_id": "qr_scanner_fail_02"}
    response = client.post("/api/v1/scan/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "fail"


def test_scan_qr_response_shape_stable():
    """Regression: /scan/qr must return the same ScanResponse shape as /scan/image."""
    qr = json.dumps({"manufacturer": "TestCo", "net_weight_str": "100g"})
    response = client.post("/api/v1/scan/qr", json={"qr_content": qr})
    assert response.status_code == 200
    data = response.json()
    required = {"audit_id", "verdict", "verdictNote", "fields", "violations", "evidence_seal"}
    assert required.issubset(set(data.keys()))
