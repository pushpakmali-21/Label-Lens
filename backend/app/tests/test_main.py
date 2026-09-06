from fastapi.testclient import TestClient
from app.main import app
from app.core.config import get_settings

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    
    settings = get_settings()
    assert data["service"] == settings.app_name
    assert data["environment"] == settings.environment
