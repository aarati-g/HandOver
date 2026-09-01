import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Handover API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"

    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # CORS Configuration
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ADDITIONAL_ORIGINS: List[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
    CORS_ORIGINS: Optional[str] = None

    @property
    def cors_origins(self) -> List[str]:
        if self.CORS_ORIGINS:
            if self.CORS_ORIGINS.strip() == "*":
                return ["*"]
            return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        origins = [self.FRONTEND_ORIGIN]
        origins.extend(self.ADDITIONAL_ORIGINS)
        return list(set(origins))

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./handover.db"

    # AI Configuration (Gemini API via Google GenAI SDK with swappable abstraction)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    AI_FALLBACK_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
