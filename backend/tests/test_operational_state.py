import pytest
from app.schemas.handover import OperationalState
from app.services.ai import get_ai_provider


def test_complete_operational_state_extraction():
    """Verify that all 11 fields are extracted and validated in complete operational state."""
    state = OperationalState(
        issue="Coolant pump seal leakage",
        current_status="needs_attention",
        completed_actions=["Pump isolated", "Mechanical seal replaced"],
        pending_actions=["Pressure test at 5 bar", "Re-torque flange bolts"],
        workaround="Bypass valve opened to 25%",
        root_cause="Thermal fatigue on elastomer gasket",
        operational_context="Discovered during high-ambient shift (38°C)",
        risks=["Minor slip hazard in containment basin"],
        unknowns=["Gasket batch number unconfirmed"],
        next_action="Perform hydro-test at 5 bar before releasing bypass",
        confidence=0.92,
    )
    assert state.issue == "Coolant pump seal leakage"
    assert len(state.completed_actions) == 2
    assert len(state.pending_actions) == 2
    assert state.workaround == "Bypass valve opened to 25%"
    assert state.operational_context is not None
    assert state.next_action is not None
    assert state.confidence == 0.92


def test_incomplete_operational_state_unknown_preservation():
    """Verify that incomplete handovers preserve unknowns rather than hallucinating facts."""
    state = OperationalState(
        issue="Generator vibration alarm",
        current_status="degraded",
        completed_actions=[],
        pending_actions=["Perform diagnostic sweep"],
        workaround=None,
        root_cause="Unknown",
        operational_context=None,
        risks=[],
        unknowns=["Root cause not confirmed", "Safety isolation status unconfirmed"],
        next_action="Perform diagnostic sweep",
        confidence=0.70,
    )
    assert state.root_cause == "Unknown"
    assert len(state.unknowns) == 2
    assert "Root cause not confirmed" in state.unknowns


@pytest.mark.asyncio
async def test_ai_provider_demo_extraction():
    """Verify AI extraction on COMP-03 demo scenario."""
    provider = get_ai_provider()
    demo_text = "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
    
    state = await provider.analyze_handover(
        text=demo_text,
        asset_context={"asset_code": "COMP-03", "name": "Compressor #03"},
    )
    
    assert state.issue == "Abnormal vibration"
    assert "Belt replaced" in state.completed_actions
    assert "Motor inspection" in state.pending_actions
    assert state.workaround == "Operate below 70% load"
    assert state.root_cause == "Unknown"
    assert "Root cause has not been confirmed" in state.unknowns
