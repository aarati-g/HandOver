from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class BaseAIService(ABC):
    """
    Abstract Base Class for Handover AI Services.
    Allows swappable AI providers (OpenAI, Anthropic, Ollama, local models).
    """

    @abstractmethod
    async def process_text(self, prompt: str, **kwargs: Any) -> Dict[str, Any]:
        """Process unstructured handover text into structured operational memory."""
        pass

    @abstractmethod
    async def generate_embedding(self, text: str) -> list[float]:
        """Generate vector embeddings for semantic retrieval (pgvector ready)."""
        pass
