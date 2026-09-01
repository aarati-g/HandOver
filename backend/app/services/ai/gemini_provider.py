import json
import logging
from typing import Optional, Dict, Any
from app.core.config import settings
from app.schemas.handover import OperationalState
from app.services.ai.base import AIProvider
from app.services.ai.prompts import SYSTEM_INSTRUCTION

logger = logging.getLogger(__name__)


class MockFallbackAIProvider(AIProvider):
    """
    Deterministic Fallback AI Provider.
    Ensures zero-downtime offline demos and tests when Gemini credentials are not configured or network fails.
    """

    async def analyze_handover(
        self,
        text: str,
        asset_context: Optional[Dict[str, Any]] = None,
    ) -> OperationalState:
        lower_text = text.lower()

        # Primary Demo Match: COMP-03 / vibration demo
        if "vibration" in lower_text or "belt" in lower_text:
            completed = []
            if "belt" in lower_text:
                completed.append("Belt replaced")
            if not completed:
                completed.append("Initial inspection")

            pending = []
            if "motor" in lower_text:
                pending.append("Motor inspection")
            if not pending:
                pending.append("Follow-up monitoring")

            workaround = None
            if "70%" in lower_text or "load" in lower_text:
                workaround = "Operate below 70% load"

            return OperationalState(
                issue="Abnormal vibration",
                completed_actions=completed,
                pending_actions=pending,
                workaround=workaround,
                root_cause="Unknown",
                current_status="needs_attention",
                risks=[],
                unknowns=["Root cause has not been confirmed"],
                confidence=0.86,
            )

        # General deterministic heuristic extraction for fallback
        completed = []
        pending = []
        unknowns = []
        issue = "Operational event"

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

        if not completed:
            completed.append("Shift handover recorded")
        if not pending:
            pending.append("Routine post-shift inspection")
        unknowns.append("Full operational verification pending")

        return OperationalState(
            issue=issue,
            completed_actions=completed,
            pending_actions=pending,
            workaround=None,
            root_cause="Under Investigation",
            current_status="needs_attention",
            risks=[],
            unknowns=unknowns,
            confidence=0.80,
        )


class GeminiProvider(AIProvider):
    """
    Google GenAI SDK provider for Gemini models.
    Configured strictly through environment variables.
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

            prompt = f"{SYSTEM_INSTRUCTION}\n{context_str}\n\nTechnician Handover Input:\n\"\"\"{text}\"\"\"\n\nReturn the structured OperationalState JSON."

            # Use structured response schema
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
                logger.warning("Empty response from Gemini API, falling back to mock provider.")
                return await self.fallback.analyze_handover(text, asset_context)

        except Exception as e:
            logger.error(f"Gemini API invocation failed: {e}. Falling back to deterministic provider.")
            return await self.fallback.analyze_handover(text, asset_context)
