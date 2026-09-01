import json
import logging
from typing import Optional, Dict, Any
from app.core.config import settings
from app.schemas.handover import OperationalState
from app.services.ai.base import AIProvider
from app.services.ai.prompts import SYSTEM_INSTRUCTION, RE_EVALUATE_INSTRUCTION

logger = logging.getLogger(__name__)


class MockFallbackAIProvider(AIProvider):
    """
    Deterministic Fallback AI Provider.
    Ensures zero-downtime offline demos and tests with high-fidelity operational extraction.
    """

    async def analyze_handover(
        self,
        text: str,
        asset_context: Optional[Dict[str, Any]] = None,
    ) -> OperationalState:
        lower_text = text.lower()

        # Primary Demo Match: COMP-03 / vibration demo
        if "vibration" in lower_text or "belt" in lower_text:
            completed = ["Belt replaced"] if "belt" in lower_text else ["Initial shift inspection"]
            pending = ["Motor inspection"] if "motor" in lower_text else ["Detailed diagnostic inspection"]
            workaround = "Operate below 70% load" if ("70%" in lower_text or "load" in lower_text) else None
            context = "Reported operating below 70% load during shift" if workaround else "Shift operational observation"

            return OperationalState(
                issue="Abnormal vibration",
                current_status="needs_attention",
                completed_actions=completed,
                pending_actions=pending,
                workaround=workaround,
                root_cause="Unknown",
                operational_context=context,
                risks=[],
                unknowns=["Root cause has not been confirmed"],
                next_action="Inspect motor and verify vibration under normal operating load",
                confidence=0.86,
            )

        # General deterministic heuristic extraction for fallback
        completed = []
        pending = []
        unknowns = []
        issue = "Operational event"
        context = None

        for line in text.replace(".", "\n").splitlines():
            line_str = line.strip()
            if not line_str:
                continue
            l_str = line_str.lower()
            if any(w in l_str for w in ["replaced", "fixed", "cleaned", "checked", "done", "tested"]):
                completed.append(line_str)
            elif any(w in l_str for w in ["needs", "must", "inspect", "check", "pending", "todo", "hasn't", "has not"]):
                pending.append(line_str)
            elif any(w in l_str for w in ["leak", "noise", "alarm", "error", "fault", "issue", "trip", "high", "abnormal"]):
                issue = line_str
            elif any(w in l_str for w in ["running", "load", "temp", "rpm", "operating", "bar", "psi"]):
                context = line_str

        if not completed:
            completed.append("Shift handover recorded")
        if not pending:
            pending.append("Routine post-shift inspection")
        unknowns.append("Root cause has not been confirmed")

        return OperationalState(
            issue=issue,
            current_status="needs_attention",
            completed_actions=completed,
            pending_actions=pending,
            workaround=None,
            root_cause="Unknown",
            operational_context=context or "Recorded during shift transition",
            risks=[],
            unknowns=unknowns,
            next_action=pending[0] if pending else "Perform physical inspection",
            confidence=0.80,
        )

    async def re_evaluate_with_answer(
        self,
        current_state: OperationalState,
        question: str,
        answer: str,
        asset_context: Optional[Dict[str, Any]] = None,
    ) -> OperationalState:
        updated = current_state.model_copy(deep=True)
        ans_lower = answer.lower()

        # Add verification to completed actions
        test_note = f"Verification test: {answer}"
        if not any(answer.lower() in act.lower() for act in updated.completed_actions):
            updated.completed_actions.append(test_note)

        # Clear resolved unknowns
        updated.unknowns = [
            u for u in updated.unknowns
            if not any(w in u.lower() for w in ["load", "test", "verification", "tested"])
        ]

        # Update operational context with the newly confirmed test
        if "normal load" in ans_lower or "elevated" in ans_lower:
            updated.operational_context = f"{updated.operational_context or ''} | Verified under normal load: vibration remained elevated".strip(" |")
            updated.next_action = "Perform motor bearing & alignment inspection"

        updated.confidence = min(0.95, updated.confidence + 0.08)
        return updated


class GeminiProvider(AIProvider):
    """
    Google GenAI SDK provider for Gemini models with structured JSON schema output.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self.fallback = MockFallbackAIProvider()
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")

    async def analyze_handover(
        self,
        text: str,
        asset_context: Optional[Dict[str, Any]] = None,
    ) -> OperationalState:
        if not self._client or not self.api_key:
            logger.info("Gemini API key not configured. Using deterministic fallback provider.")
            return await self.fallback.analyze_handover(text, asset_context)

        try:
            from google.genai import types

            context_str = ""
            if asset_context:
                context_str = f"\nAsset Context: Code={asset_context.get('asset_code')}, Name={asset_context.get('name')}, Type={asset_context.get('type')}, Location={asset_context.get('location')}"

            prompt = f"{SYSTEM_INSTRUCTION}\n{context_str}\n\nTechnician Handover Input:\n\"\"\"{text}\"\"\"\n\nReturn the strict OperationalState JSON."

            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=OperationalState,
                    temperature=0.1,
                ),
            )

            if response and response.text:
                parsed = json.loads(response.text)
                return OperationalState.model_validate(parsed)
            else:
                logger.warning("Empty response from Gemini API, falling back.")
                return await self.fallback.analyze_handover(text, asset_context)

        except Exception as e:
            logger.error(f"Gemini API invocation failed: {e}. Falling back to deterministic provider.")
            return await self.fallback.analyze_handover(text, asset_context)

    async def re_evaluate_with_answer(
        self,
        current_state: OperationalState,
        question: str,
        answer: str,
        asset_context: Optional[Dict[str, Any]] = None,
    ) -> OperationalState:
        if not self._client or not self.api_key:
            return await self.fallback.re_evaluate_with_answer(current_state, question, answer, asset_context)

        try:
            from google.genai import types

            prompt = f"{RE_EVALUATE_INSTRUCTION}\n\nCurrent Operational State:\n{current_state.model_dump_json(indent=2)}\n\nGap Question Asked:\n\"{question}\"\n\nTechnician Answer Given:\n\"{answer}\"\n\nReturn updated OperationalState JSON."

            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=OperationalState,
                    temperature=0.1,
                ),
            )

            if response and response.text:
                parsed = json.loads(response.text)
                return OperationalState.model_validate(parsed)
            else:
                return await self.fallback.re_evaluate_with_answer(current_state, question, answer, asset_context)

        except Exception as e:
            logger.error(f"Gemini re-evaluation failed: {e}. Using fallback.")
            return await self.fallback.re_evaluate_with_answer(current_state, question, answer, asset_context)
