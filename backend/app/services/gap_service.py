from typing import Optional
from app.schemas.handover import OperationalState, GapDetectionResult


class GapDetectionService:
    """
    Dedicated rule-based service that inspects the structured operational state
    and identifies critical missing information before the oncoming shift begins.
    """

    def detect_gap(
        self,
        state: OperationalState,
        raw_text: Optional[str] = None,
        answered_context: Optional[str] = None,
    ) -> GapDetectionResult:
        """
        Evaluate completeness of operational state and detect highest-priority gap.
        """
        combined_text = f"{raw_text or ''} {answered_context or ''}".lower()

        # If question was already answered with testing details
        if "tested" in combined_text and ("yes" in combined_text or "normal load" in combined_text):
            return GapDetectionResult(
                detected=False,
                question=None,
                severity=None,
            )

        # 1. Belt replaced / repair completed without load verification test
        if any("belt" in act.lower() for act in state.completed_actions):
            if "tested" not in combined_text and "test" not in combined_text:
                return GapDetectionResult(
                    detected=True,
                    question="Was the machine tested under normal operating load after the belt replacement?",
                    severity="medium",
                )

        # 2. Critical/degraded status without clear next action or pending inspection
        if state.current_status in ["degraded", "needs_attention", "offline"] and not state.pending_actions:
            return GapDetectionResult(
                detected=True,
                question="What specific diagnostic or repair action is scheduled next for this machine?",
                severity="high",
            )

        # 3. Workaround specified without operating load or safety parameter limits
        if state.workaround and not any(char.isdigit() for char in state.workaround):
            return GapDetectionResult(
                detected=True,
                question="What is the exact load, temperature, or speed limit specified for this workaround?",
                severity="medium",
            )

        # 4. Issue reported without completed actions or observations
        if state.issue and not state.completed_actions:
            return GapDetectionResult(
                detected=True,
                question="Were any initial troubleshooting or physical checks completed during this shift?",
                severity="medium",
            )

        # 5. Root cause completely unknown on critical asset without isolation confirmation
        if state.root_cause in ["Unknown", None] and state.current_status == "offline":
            return GapDetectionResult(
                detected=True,
                question="Has electrical and mechanical isolation (LOTO) been verified for the asset?",
                severity="high",
            )

        # 6. General fallback gap if unknowns exist
        if state.unknowns:
            first_unknown = state.unknowns[0]
            return GapDetectionResult(
                detected=True,
                question=f"Can you provide more detail regarding: {first_unknown}?",
                severity="low",
            )

        # No gaps detected
        return GapDetectionResult(
            detected=False,
            question=None,
            severity=None,
        )


gap_service = GapDetectionService()
