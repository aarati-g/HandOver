from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.schemas.handover import OperationalState


class AIProvider(ABC):
    """
    Abstract Base Interface for Handover AI Services.
    Decouples routes and domain logic from specific LLM vendors (Gemini, Local/Ollama, Open Source).
    """

    @abstractmethod
    async def analyze_handover(
        self,
        text: str,
        asset_context: Optional[Dict[str, Any]] = None,
    ) -> OperationalState:
        """
        Analyze unstructured technician knowledge and extract structured operational state.
        """
        pass

    @abstractmethod
    async def re_evaluate_with_answer(
        self,
        current_state: OperationalState,
        question: str,
        answer: str,
        asset_context: Optional[Dict[str, Any]] = None,
    ) -> OperationalState:
        """
        Update an operational state by incorporating the technician's answer to a gap question.
        """
        pass
