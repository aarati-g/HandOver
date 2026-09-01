from typing import Optional, List
from app.schemas.handover import OperationalState, GapDetectionResult


class CandidateGap:
    """Internal representation of a detected knowledge gap for prioritization."""
    def __init__(self, question: str, reason: str, severity: str, priority_rank: int):
        self.question = question
        self.reason = reason
        self.severity = severity  # "high", "medium", "low"
        self.priority_rank = priority_rank  # Lower number = higher priority (1 is highest)


class GapDetectionService:
    """
    Evaluates whether the oncoming technician has complete, actionable operational memory.
    Identifies missing information, evaluates multiple candidate gaps, and returns
    the single highest-value question prioritized by operational urgency.
    """

    def detect_gap(
        self,
        state: OperationalState,
        raw_text: Optional[str] = None,
        answered_context: Optional[str] = None,
    ) -> GapDetectionResult:
        """
        Evaluate completeness of operational state and return the highest-priority gap.
        """
        combined_text = f"{raw_text or ''} {answered_context or ''}".lower()

        # If question was already answered with load/verification testing
        if "tested" in combined_text and ("yes" in combined_text or "normal load" in combined_text or "verified" in combined_text):
            return GapDetectionResult(
                detected=False,
                question=None,
                reason=None,
                severity=None,
            )

        candidate_gaps: List[CandidateGap] = []

        # =========================================================================
        # HIGH PRIORITY GAPS (Safety / Critical Status / Unresolved Isolation)
        # =========================================================================

        # 1. Offline/Critical status with unconfirmed isolation (LOTO)
        if state.current_status == "offline" and not any("loto" in act.lower() or "isolated" in act.lower() for act in state.completed_actions):
            candidate_gaps.append(
                CandidateGap(
                    question="Has Lockout/Tagout (LOTO) or electrical/mechanical isolation been verified for this asset?",
                    reason="Asset is offline but safety isolation status has not been confirmed for the incoming shift.",
                    severity="high",
                    priority_rank=10,
                )
            )

        # 2. Critical status without pending diagnostic or emergency actions
        if state.current_status in ["offline", "degraded"] and not state.pending_actions:
            candidate_gaps.append(
                CandidateGap(
                    question="What urgent diagnostic or containment action must the oncoming technician take first?",
                    reason="Asset is in degraded/offline condition without a documented pending action.",
                    severity="high",
                    priority_rank=20,
                )
            )

        # =========================================================================
        # MEDIUM PRIORITY GAPS (Validation/Testing / Workarounds / Next Actions)
        # =========================================================================

        # 3. Post-repair validation/load testing missing after mechanical intervention (e.g. Belt/Motor/Bearing)
        has_mechanical_repair = any(
            any(w in act.lower() for w in ["belt", "motor", "pump", "valve", "bearing", "gear", "replaced", "repaired", "installed"])
            for act in state.completed_actions
        )
        if has_mechanical_repair and "tested" not in combined_text and "verification" not in combined_text:
            candidate_gaps.append(
                CandidateGap(
                    question="Was the machine tested under normal operating load after the belt replacement?",
                    reason="Mechanical repair was completed but post-repair load verification test was not reported.",
                    severity="medium",
                    priority_rank=30,
                )
            )

        # 4. Workaround specified without numeric operational limit or restriction
        if state.workaround and not any(char.isdigit() for char in state.workaround):
            candidate_gaps.append(
                CandidateGap(
                    question=f"What is the exact load, pressure, or temperature limit for the '{state.workaround}' workaround?",
                    reason="A workaround was noted but specific numeric operational limits were not defined.",
                    severity="medium",
                    priority_rank=40,
                )
            )

        # 5. Missing explicit next action
        if not state.next_action and not state.pending_actions and state.current_status != "operational":
            candidate_gaps.append(
                CandidateGap(
                    question="What specific step should the incoming technician perform next?",
                    reason="No immediate next action was specified for the next shift.",
                    severity="medium",
                    priority_rank=50,
                )
            )

        # =========================================================================
        # LOW PRIORITY GAPS (Contextual / Environmental Details)
        # =========================================================================

        # 6. Issue reported without any completed troubleshooting actions
        if state.issue and not state.completed_actions:
            candidate_gaps.append(
                CandidateGap(
                    question="Were any initial troubleshooting or physical checks performed during this shift?",
                    reason="Issue was reported but no completed actions were documented.",
                    severity="low",
                    priority_rank=60,
                )
            )

        # 7. Unaddressed unknowns
        if state.unknowns:
            first_unknown = state.unknowns[0]
            candidate_gaps.append(
                CandidateGap(
                    question=f"Can you provide more detail regarding: {first_unknown}?",
                    reason=f"Technician identified an unconfirmed assumption: {first_unknown}.",
                    severity="low",
                    priority_rank=70,
                )
            )

        # Return single highest-priority gap
        if candidate_gaps:
            candidate_gaps.sort(key=lambda g: g.priority_rank)
            top_gap = candidate_gaps[0]
            return GapDetectionResult(
                detected=True,
                question=top_gap.question,
                reason=top_gap.reason,
                severity=top_gap.severity,
            )

        return GapDetectionResult(
            detected=False,
            question=None,
            reason=None,
            severity=None,
        )


gap_service = GapDetectionService()
