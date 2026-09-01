from .base import AIProvider
from .gemini_provider import GeminiProvider, MockFallbackAIProvider


def get_ai_provider() -> AIProvider:
    """Factory to get the configured AIProvider instance."""
    return GeminiProvider()


__all__ = ["AIProvider", "GeminiProvider", "MockFallbackAIProvider", "get_ai_provider"]
