from fastapi.testclient import TestClient
from app.main import app


def test_list_and_get_assets():
    """Verify GET /api/assets and GET /api/assets/{asset_id}."""
    with TestClient(app) as client:
        response = client.get("/api/assets")
        assert response.status_code == 200
        assets = response.json()
        assert len(assets) >= 1
        codes = [a["asset_code"] for a in assets]
        assert "COMP-03" in codes

        res_single = client.get("/api/assets/COMP-03")
        assert res_single.status_code == 200
        assert res_single.json()["name"] == "Compressor #03"
        assert res_single.json()["type"] == "Industrial Compressor"


def test_end_to_end_comp03_scenario():
    """
    End-to-End Core Story Verification:
    Technician input -> structured operational state -> gap detected ->
    targeted question -> answer submitted -> state updated ->
    readiness increases -> handover becomes ready -> events recorded.
    """
    with TestClient(app) as client:
        # Step 1: Analyze raw technician note
        payload = {
            "asset_id": "COMP-03",
            "text": "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
        }
        res_analyze = client.post("/api/handovers/analyze", json=payload)
        assert res_analyze.status_code == 200
        data = res_analyze.json()

        # Verify structured state
        assert data["asset_id"] == "COMP-03"
        op_state = data["operational_state"]
        assert op_state["issue"] == "Abnormal vibration"
        assert "Belt replaced" in op_state["completed_actions"]
        assert "Motor inspection" in op_state["pending_actions"]
        assert op_state["workaround"] == "Operate below 70% load"
        assert op_state["root_cause"] == "Unknown"
        assert "Root cause has not been confirmed" in op_state["unknowns"]

        # Verify gap detection
        assert data["gap"]["detected"] is True
        assert "tested" in data["gap"]["question"].lower() or "load" in data["gap"]["question"].lower()
        assert data["gap"]["severity"] == "medium"
        assert data["gap"]["reason"] is not None

        # Verify readiness evaluation
        assert data["readiness"]["score"] == 72
        assert data["readiness"]["status"] == "needs_attention"
        assert data["readiness"]["breakdown"]["current_status"] == 20
        assert data["readiness_score"] == 72

        handover_id = data["handover_id"]
        assert handover_id is not None

        # Step 2: Submit technician answer to gap question
        answer_payload = {
            "answer": "Yes, it was tested under normal load and vibration remained elevated."
        }
        res_answer = client.post(f"/api/handovers/{handover_id}/answer", json=answer_payload)
        assert res_answer.status_code == 200
        ans_data = res_answer.json()

        # Verify state updated with answer
        assert ans_data["readiness"]["score"] >= 90
        assert ans_data["readiness"]["status"] == "ready"
        assert ans_data["gap"]["detected"] is False

        updated_completed = ans_data["operational_state"]["completed_actions"]
        assert any("tested" in act.lower() for act in updated_completed)

        # Step 3: Verify single handover detail endpoint
        res_detail = client.get(f"/api/handovers/{handover_id}")
        assert res_detail.status_code == 200
        detail_data = res_detail.json()
        assert detail_data["id"] == handover_id
        assert detail_data["readiness_score"] >= 90
        event_types = [e["event_type"] for e in detail_data["events"]]
        assert "HANDOVER_CREATED" in event_types
        assert "GAP_DETECTED" in event_types
        assert "GAP_ANSWERED" in event_types
        assert "READINESS_CHANGED" in event_types

        # Step 4: Verify chronological asset history timeline endpoint
        res_hist = client.get("/api/assets/COMP-03/history")
        assert res_hist.status_code == 200
        history_events = res_hist.json()
        assert len(history_events) >= 1
        hist_types = [e["type"] for e in history_events]
        assert "HANDOVER_CREATED" in hist_types
        assert "GAP_DETECTED" in hist_types
        assert "GAP_ANSWERED" in hist_types


def test_compare_operational_states_endpoint():
    """Verify POST /api/handovers/compare detects meaningful shifts."""
    with TestClient(app) as client:
        payload = {
            "previous_state": {
                "issue": "Normal operation",
                "current_status": "operational",
                "completed_actions": ["Shift check"],
                "pending_actions": [],
            },
            "current_state": {
                "issue": "Abnormal vibration",
                "current_status": "needs_attention",
                "completed_actions": ["Belt replaced"],
                "pending_actions": ["Motor inspection"],
                "workaround": "Operate below 70% load",
            }
        }
        res = client.post("/api/handovers/compare", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["has_changes"] is True
        assert len(data["changes"]) >= 2
