import pytest
from app.schemas.handover import OperationalState
from app.services.ai import get_ai_provider


def test_operational_state_schema_validation():
    """Verify strict Pydantic validation of OperationalState."""
    state = OperationalState(
        issue="Abnormal vibration",
        completed_actions=["Belt replaced"],
        pending_actions=["Motor inspection"],
        workaround="Operate below 70% load",
        root_cause="Unknown",
        current_status="needs_attention",
        risks=[],
        unknowns=["Root cause has not been confirmed"],
        confidence=0.86,
    )
    assert state.issue == "Abnormal vibration"
    assert len(state.completed_actions) == 1
    assert state.confidence == 0.86
    assert state.current_status == "needs_attention"


@pytest.mark.asyncio
async def test_ai_provider_fallback_offline():
    """Verify that the AI provider works offline without requiring external API keys."""
    provider = get_ai_provider()
    demo_text = "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
    
    result = await provider.analyze_handover(
        text=demo_text,
        asset_context={"asset_code": "COMP-03", "name": "Compressor #03"},
    )
    
    assert isinstance(result, OperationalState)
    assert result.issue == "Abnormal vibration"
    assert "Belt replaced" in result.completed_actions
    assert "Motor inspection" in result.pending_actions
    assert result.workaround == "Operate below 70% load"
    assert result.root_cause == "Unknown"
