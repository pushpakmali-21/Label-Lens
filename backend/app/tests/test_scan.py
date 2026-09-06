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
