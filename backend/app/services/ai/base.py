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
        
        Args:
            text: Messy notes, transcript, or observation text.
            asset_context: Optional metadata about the target asset (name, type, location).
            
        Returns:
            OperationalState: Validated structured operational state.
        """
        pass
