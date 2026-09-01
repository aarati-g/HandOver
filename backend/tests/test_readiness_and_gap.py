from app.schemas.handover import OperationalState
from app.services.gap_service import gap_service
from app.services.handover_service import handover_service


def test_gap_detection_on_demo_input():
    """Verify that gap detection correctly identifies missing post-repair testing."""
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
    raw_text = "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
    
    gap = gap_service.detect_gap(state, raw_text=raw_text)
    assert gap.detected is True
    assert "tested" in gap.question.lower() or "load" in gap.question.lower()
    assert gap.severity == "medium"


def test_gap_resolution_after_answer():
    """Verify that gap is resolved when technician provides load testing confirmation."""
    state = OperationalState(
        issue="Abnormal vibration",
        completed_actions=["Belt replaced", "Verification test: Tested under normal load"],
        pending_actions=["Motor inspection"],
        workaround="Operate below 70% load",
        root_cause="Unknown",
        current_status="needs_attention",
        risks=[],
        unknowns=[],
        confidence=0.90,
    )
    gap = gap_service.detect_gap(state, answered_context="Yes, it was tested under normal load")
    assert gap.detected is False


def test_deterministic_readiness_score():
    """Verify that readiness score calculation is deterministic and weighted properly."""
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
    
    # With active gap
    initial_score = handover_service.calculate_readiness_score(state, gap_detected=True, answered_gap=False)
    assert initial_score == 72

    # After gap answered
    answered_score = handover_service.calculate_readiness_score(state, gap_detected=False, answered_gap=True)
    assert answered_score >= 90


def test_change_detection():
    """Verify that state changes between two handovers are detected."""
    prev = OperationalState(
        issue="Normal operation",
        completed_actions=["Oil top-up"],
        pending_actions=[],
        current_status="operational",
    )
    curr = OperationalState(
        issue="Abnormal vibration",
        completed_actions=["Belt replaced"],
        pending_actions=["Motor inspection"],
        current_status="needs_attention",
    )
    
    changes = handover_service.detect_changes(prev, curr)
    assert len(changes) >= 2
    fields = [c.field for c in changes]
    assert "current_status" in fields
    assert "issue" in fields
