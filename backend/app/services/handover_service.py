import re
from typing import List, Optional, Tuple
from app.schemas.handover import (
    OperationalState,
    ReadinessBreakdown,
    ReadinessDetail,
    StateChange,
    StateComparisonResponse,
)


def normalize_text(text: Optional[str]) -> str:
    """Normalizes text by lowercasing, stripping punctuation and redundant articles for diff comparison."""
    if not text:
        return ""
    # Remove leading articles (the, a, an)
    cleaned = re.sub(r'^(the|a|an)\s+', '', text.strip().lower())
    # Remove punctuation and normalize whitespace
    cleaned = re.sub(r'[^\w\s]', '', cleaned)
    return " ".join(cleaned.split())


class HandoverService:
    """
    Core intelligence service for deterministic readiness scoring,
    category breakdowns, and semantic change detection.
    """

    @staticmethod
    def get_readiness_status(score: int) -> str:
        """
        Classifies score into readiness lifecycle states:
        0–49   = incomplete
        50–74  = needs_attention
        75–89  = almost_ready
        90–100 = ready
        """
        if score >= 90:
            return "ready"
        elif score >= 75:
            return "almost_ready"
        elif score >= 50:
            return "needs_attention"
        return "incomplete"

    @classmethod
    def evaluate_readiness(
        cls,
        state: OperationalState,
        gap_detected: bool = False,
        answered_gap: bool = False,
    ) -> ReadinessDetail:
        """
        Calculates a deterministic 0-100 score and transparent category breakdown.
        """
        breakdown = ReadinessBreakdown()

        # 1. Current status (20)
        if state.current_status in ["operational", "needs_attention", "almost_ready", "degraded", "offline"]:
            breakdown.current_status = 20
        elif state.current_status:
            breakdown.current_status = 10

        # 2. Issue (15)
        if state.issue and state.issue.strip() and state.issue.lower() != "unknown":
            breakdown.issue = 15

        # 3. Completed actions (15)
        if state.completed_actions and len(state.completed_actions) > 0:
            breakdown.completed_actions = 15

        # 4. Pending actions (15)
        if state.pending_actions and len(state.pending_actions) > 0:
            breakdown.pending_actions = 15

        # 5. Operational context (10)
        if state.operational_context and len(state.operational_context.strip()) > 5:
            breakdown.operational_context = 10
        elif state.workaround:
            # Workaround gives partial operational context
            breakdown.operational_context = 5

        # 6. Workaround (10)
        if state.workaround:
            breakdown.workaround = 10
        elif state.current_status == "operational":
            # Fully operational requires no workaround
            breakdown.workaround = 10

        # 7. Next action (5)
        if state.next_action and len(state.next_action.strip()) > 3:
            breakdown.next_action = 5
        elif state.pending_actions:
            breakdown.next_action = 3

        # 8. Unknowns explicitly identified (10)
        # Identifying unknowns is valued higher than leaving them unstated
        if len(state.unknowns) > 0:
            breakdown.unknowns = 10
        elif state.root_cause and state.root_cause.lower() != "unknown":
            breakdown.unknowns = 10
        else:
            breakdown.unknowns = 4

        raw_sum = (
            breakdown.current_status
            + breakdown.issue
            + breakdown.completed_actions
            + breakdown.pending_actions
            + breakdown.operational_context
            + breakdown.workaround
            + breakdown.next_action
            + breakdown.unknowns
        )

        # Apply gap penalty or answer boost
        final_score = raw_sum
        if gap_detected and not answered_gap:
            # Active unaddressed gap caps or reduces the score
            final_score = max(0, min(raw_sum - 18, 72))
        elif answered_gap:
            final_score = max(raw_sum, 92)

        final_score = min(max(final_score, 0), 100)
        status = cls.get_readiness_status(final_score)

        return ReadinessDetail(
            score=final_score,
            status=status,
            breakdown=breakdown,
        )

    @classmethod
    def calculate_readiness_score(
        cls,
        state: OperationalState,
        gap_detected: bool = False,
        answered_gap: bool = False,
    ) -> int:
        """Helper returning the integer score directly."""
        return cls.evaluate_readiness(state, gap_detected, answered_gap).score

    @staticmethod
    def detect_changes(
        previous_state: Optional[OperationalState],
        current_state: OperationalState,
    ) -> StateComparisonResponse:
        """
        Compares two operational states and returns only meaningful changes,
        ignoring minor wording variations or capitalization differences.
        """
        if not previous_state:
            return StateComparisonResponse(has_changes=False, changes=[])

        changes: List[StateChange] = []

        # 1. Current status change
        if normalize_text(previous_state.current_status) != normalize_text(current_state.current_status):
            severity = "high" if current_state.current_status in ["degraded", "offline", "needs_attention"] else "medium"
            changes.append(
                StateChange(
                    field="current_status",
                    previous=previous_state.current_status,
                    current=current_state.current_status,
                    severity=severity,
                )
            )

        # 2. Issue change
        if normalize_text(previous_state.issue) != normalize_text(current_state.issue):
            if current_state.issue and previous_state.issue:
                changes.append(
                    StateChange(
                        field="issue",
                        previous=previous_state.issue,
                        current=current_state.issue,
                        severity="high" if any(w in str(current_state.issue).lower() for w in ["vibration", "leak", "alarm", "trip"]) else "medium",
                    )
                )

        # 3. Workaround change
        if normalize_text(previous_state.workaround) != normalize_text(current_state.workaround):
            changes.append(
                StateChange(
                    field="workaround",
                    previous=previous_state.workaround,
                    current=current_state.workaround,
                    severity="medium",
                )
            )

        # 4. Pending actions difference
        prev_pending_norm = {normalize_text(a) for a in previous_state.pending_actions}
        curr_pending_norm = {normalize_text(a) for a in current_state.pending_actions}
        if prev_pending_norm != curr_pending_norm:
            added = [a for a in current_state.pending_actions if normalize_text(a) not in prev_pending_norm]
            if added:
                changes.append(
                    StateChange(
                        field="pending_actions",
                        previous=", ".join(previous_state.pending_actions) or "None",
                        current=", ".join(current_state.pending_actions),
                        severity="medium",
                    )
                )

        # 5. Risks difference
        prev_risks_norm = {normalize_text(r) for r in previous_state.risks}
        curr_risks_norm = {normalize_text(r) for r in current_state.risks}
        if prev_risks_norm != curr_risks_norm:
            changes.append(
                StateChange(
                    field="risks",
                    previous=", ".join(previous_state.risks) or "None",
                    current=", ".join(current_state.risks) or "None",
                    severity="high" if current_state.risks else "low",
                )
            )

        # 6. Operational context difference
        if normalize_text(previous_state.operational_context) != normalize_text(current_state.operational_context):
            changes.append(
                StateChange(
                    field="operational_context",
                    previous=previous_state.operational_context,
                    current=current_state.operational_context,
                    severity="low",
                )
            )

        return StateComparisonResponse(
            has_changes=len(changes) > 0,
            changes=changes,
        )


handover_service = HandoverService()
