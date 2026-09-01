from typing import List, Optional
from app.schemas.handover import OperationalState, StateChange


class HandoverService:
    """
    Core domain service handling deterministic readiness scoring,
    change detection between shifts, and state updates.
    """

    @staticmethod
    def calculate_readiness_score(
        state: OperationalState,
        gap_detected: bool = False,
        answered_gap: bool = False,
    ) -> int:
        """
        Calculates a deterministic 0-100 handover readiness score based on explicit criteria.

        Weighting:
        - Current status specified: 20
        - Issue clearly identified: 15
        - Completed actions recorded: 15
        - Pending actions documented: 15
        - Workaround / operating condition: 10
        - Operational/safety risks reviewed: 10
        - Unknowns explicitly identified: 10
        - Next action defined: 5
        Total = 100
        """
        score = 0

        # Current status (20)
        if state.current_status in ["operational", "needs_attention", "degraded", "offline"]:
            score += 20

        # Issue (15)
        if state.issue and state.issue.strip() and state.issue.lower() != "unknown":
            score += 15

        # Completed actions (15)
        if state.completed_actions and len(state.completed_actions) > 0:
            score += 15

        # Pending actions (15)
        if state.pending_actions and len(state.pending_actions) > 0:
            score += 15

        # Workaround (10)
        if state.workaround:
            score += 10
        elif state.current_status == "operational":
            # No workaround needed if operational
            score += 10

        # Safety / risks accounted for (10)
        if len(state.risks) > 0 or state.current_status == "operational":
            score += 10
        else:
            # Assumed low risk but penalize slight ambiguity
            score += 7

        # Unknowns acknowledged (10)
        if len(state.unknowns) > 0:
            score += 10
        elif state.root_cause and state.root_cause.lower() != "unknown":
            score += 10
        else:
            score += 5

        # Next action clarity (5)
        if state.pending_actions and len(state.pending_actions) > 0:
            score += 5

        # Gap penalty / boost
        if gap_detected and not answered_gap:
            # An active unaddressed gap reduces score
            score = max(0, min(score - 15, 72))
        elif answered_gap:
            score = max(score, 92)

        return min(max(score, 0), 100)

    @staticmethod
    def detect_changes(
        previous_state: Optional[OperationalState],
        current_state: OperationalState,
    ) -> List[StateChange]:
        """
        Compares two operational states and returns only meaningful deltas.
        """
        if not previous_state:
            return []

        changes: List[StateChange] = []

        # 1. Status change
        if previous_state.current_status != current_state.current_status:
            severity = "high" if current_state.current_status in ["degraded", "offline"] else "medium"
            changes.append(
                StateChange(
                    field="current_status",
                    previous=previous_state.current_status,
                    current=current_state.current_status,
                    severity=severity,
                )
            )

        # 2. Issue change
        if previous_state.issue != current_state.issue and current_state.issue:
            changes.append(
                StateChange(
                    field="issue",
                    previous=previous_state.issue,
                    current=current_state.issue,
                    severity="high" if "vibration" in str(current_state.issue).lower() else "medium",
                )
            )

        # 3. Workaround change
        if previous_state.workaround != current_state.workaround:
            changes.append(
                StateChange(
                    field="workaround",
                    previous=previous_state.workaround,
                    current=current_state.workaround,
                    severity="medium",
                )
            )

        # 4. Completed actions added
        prev_completed = set(previous_state.completed_actions)
        curr_completed = set(current_state.completed_actions)
        new_completed = curr_completed - prev_completed
        if new_completed:
            changes.append(
                StateChange(
                    field="completed_actions",
                    previous=", ".join(prev_completed) if prev_completed else "None",
                    current=", ".join(curr_completed),
                    severity="low",
                )
            )

        return changes


handover_service = HandoverService()
