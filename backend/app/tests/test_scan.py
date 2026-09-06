from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_scan_image_offline_stub():
    payload = {
        "image_base64": "dummy_base64_data",
        "gps_lat": 19.0760,
        "gps_lon": 72.8777,
        "device_id": "test_device_01"
    }
    
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    
    # Assert JSON shape matches ScanResponse (frontend mock)
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
    
    # Check stub values are flowing through validator
    assert data["verdict"] in ["pass", "review", "fail"]

def test_scan_image_known_good():
    payload = {
        "image_base64": "dummy",
        "device_id": "test_device_02",
        "extracted_fields": {
            "manufacturer": "Acme Corp, Mumbai",
            "net_weight_g": 500.0,
            "net_weight_str": "500g",
            "net_weight_font_height_mm": 5.0, # Valid for 500g (>4mm)
            "ocr_full_text": "Acme Corp, Mumbai. Net weight 500g. Best before 6 months."
        }
    }
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "pass"

def test_scan_image_known_bad():
    payload = {
        "image_base64": "dummy",
        "device_id": "test_device_03",
        "extracted_fields": {
            "manufacturer": "Acme Corp",
            "net_weight_g": 500.0,
            "net_weight_str": "approx 500g", # "approx" is prohibited
            "net_weight_font_height_mm": 2.0, # Too small for 500g (should be >4mm)
            "ocr_full_text": "Acme Corp. Approx 500g weight."
        }
    }
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "review"
    violations = [v["rule"] for v in data["violations"]]
    assert "Rule 11(1)" in violations
    assert "Rule 7" in violations

def test_scan_qr():
    payload = {
        "qr_content": "Acme Corp 100g 50 INR",
        "device_id": "qr_scanner_01"
    }
    response = client.post("/api/v1/scan/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "audit_id" in data
    assert data["verdict"] in ["pass", "fail", "review"]
