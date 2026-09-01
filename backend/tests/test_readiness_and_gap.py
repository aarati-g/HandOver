from app.schemas.handover import OperationalState
from app.services.gap_service import gap_service
from app.services.handover_service import handover_service


def test_gap_detection_on_demo_input():
    """Verify that gap detection correctly identifies missing post-repair testing on COMP-03."""
    state = OperationalState(
        issue="Abnormal vibration",
        current_status="needs_attention",
        completed_actions=["Belt replaced"],
        pending_actions=["Motor inspection"],
        workaround="Operate below 70% load",
        root_cause="Unknown",
        unknowns=["Root cause has not been confirmed"],
    )
    raw_text = "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
    
    gap = gap_service.detect_gap(state, raw_text=raw_text)
    assert gap.detected is True
    assert "tested" in gap.question.lower() or "load" in gap.question.lower()
    assert gap.severity == "medium"
    assert gap.reason is not None


def test_gap_prioritization_high_over_medium():
    """Verify that safety/isolation gaps take priority over testing gaps."""
    state = OperationalState(
        issue="Transformer overheating",
        current_status="offline",  # Offline triggers high priority LOTO check
        completed_actions=["Fan bearing replaced"],
        pending_actions=[],
        unknowns=["Thermal limit exceeded"],
    )
    gap = gap_service.detect_gap(state)
    assert gap.detected is True
    assert gap.severity == "high"
    assert "isolation" in gap.question.lower() or "loto" in gap.question.lower()


def test_readiness_breakdown_and_status():
    """Verify deterministic scoring breakdown and lifecycle state classification."""
    state = OperationalState(
        issue="Abnormal vibration",
        current_status="needs_attention",
        completed_actions=["Belt replaced"],
        pending_actions=["Motor inspection"],
        workaround="Operate below 70% load",
        root_cause="Unknown",
        operational_context="Discovered on shift 2",
        unknowns=["Root cause not confirmed"],
        next_action="Inspect motor",
    )
    
    # Active gap
    initial_eval = handover_service.evaluate_readiness(state, gap_detected=True, answered_gap=False)
    assert initial_eval.score == 72
    assert initial_eval.status == "needs_attention"
    assert initial_eval.breakdown.current_status == 20
    assert initial_eval.breakdown.issue == 15
    assert initial_eval.breakdown.completed_actions == 15
    assert initial_eval.breakdown.pending_actions == 15

    # Answered gap
    answered_eval = handover_service.evaluate_readiness(state, gap_detected=False, answered_gap=True)
    assert answered_eval.score >= 90
    assert answered_eval.status == "ready"


def test_meaningful_change_detection():
    """Verify detection of meaningful state transitions."""
    prev = OperationalState(
        issue="Normal operation",
        current_status="operational",
        completed_actions=["Daily oil check"],
        pending_actions=[],
        workaround=None,
    )
    curr = OperationalState(
        issue="Abnormal vibration",
        current_status="needs_attention",
        completed_actions=["Belt replaced"],
        pending_actions=["Motor inspection"],
        workaround="Operate below 70% load",
    )
    
    comp = handover_service.detect_changes(prev, curr)
    assert comp.has_changes is True
    fields = [c.field for c in comp.changes]
    assert "current_status" in fields
    assert "issue" in fields
    assert "workaround" in fields


def test_ignore_wording_only_differences():
    """Verify that minor cosmetic or article variations are ignored."""
    prev = OperationalState(
        issue="Abnormal vibration",
        current_status="needs_attention",
        completed_actions=["Belt was replaced"],
        pending_actions=["Motor inspection"],
        workaround="Operate below 70% load",
    )
    curr = OperationalState(
        issue="Abnormal vibration",
        current_status="needs_attention",
        completed_actions=["The belt was replaced"],
        pending_actions=["Motor inspection"],
        workaround="Operate below 70% load",
    )
    
    comp = handover_service.detect_changes(prev, curr)
    assert comp.has_changes is False
    assert len(comp.changes) == 0
