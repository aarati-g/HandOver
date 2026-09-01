import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_list_and_get_assets():
    """Verify GET /api/assets and GET /api/assets/{asset_id}."""
    with TestClient(app) as client:
        # List assets
        response = client.get("/api/assets")
        assert response.status_code == 200
        assets = response.json()
        assert len(assets) >= 1
        codes = [a["asset_code"] for a in assets]
        assert "COMP-03" in codes

        # Get single asset
        res_single = client.get("/api/assets/COMP-03")
        assert res_single.status_code == 200
        assert res_single.json()["name"] == "Compressor #03"


def test_handover_analysis_and_answer_flow():
    """Verify POST /api/handovers/analyze and POST /api/handovers/{id}/answer."""
    with TestClient(app) as client:
        # 1. Analyze handover
        payload = {
            "asset_id": "COMP-03",
            "text": "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
        }
        response = client.post("/api/handovers/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["asset_id"] == "COMP-03"
        assert data["operational_state"]["issue"] == "Abnormal vibration"
        assert "Belt replaced" in data["operational_state"]["completed_actions"]
        assert "Motor inspection" in data["operational_state"]["pending_actions"]
        assert data["gap"]["detected"] is True
        assert "tested" in data["gap"]["question"].lower() or "load" in data["gap"]["question"].lower()
        assert data["readiness_score"] == 72
        assert "handover_id" in data
        handover_id = data["handover_id"]

        # 2. Answer the gap
        ans_payload = {
            "answer": "Yes, it was tested under normal load and vibration remained elevated."
        }
        ans_res = client.post(f"/api/handovers/{handover_id}/answer", json=ans_payload)
        assert ans_res.status_code == 200
        ans_data = ans_res.json()
        assert ans_data["readiness_score"] >= 90
        assert ans_data["gap"]["detected"] is False

        # 3. Check history
        hist_res = client.get("/api/assets/COMP-03/history")
        assert hist_res.status_code == 200
        history = hist_res.json()
        assert len(history) >= 1
        assert history[0]["asset_id"] == "COMP-03"
