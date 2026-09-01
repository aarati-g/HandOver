from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_serves_frontend_or_status():
    """Verify GET / returns 200 with HTML or status info."""
    response = client.get("/")
    assert response.status_code == 200


def test_spa_client_routes_fallback():
    """Verify client-side routes like /assets/COMP-03 return 200 index.html."""
    response = client.get("/assets/COMP-03")
    assert response.status_code == 200


def test_api_routes_not_swallowed_by_spa_fallback():
    """Verify non-existent API routes return 404 JSON."""
    response = client.get("/api/unknown_endpoint_xyz")
    assert response.status_code == 404
    assert response.json()["detail"] == "API route not found"


def test_docs_and_health_continue_working():
    """Verify docs and health endpoints are accessible."""
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"

    res_docs = client.get("/docs")
    assert res_docs.status_code == 200
