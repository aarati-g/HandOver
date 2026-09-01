from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Initialize DB schema and seed demo assets
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Handover — AI Operational Memory for the Next Person (iQOO Hackathon 2026)",
    lifespan=lifespan,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware configured for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount direct health endpoint at /health
app.include_router(health_router)

# Mount main API router at /api
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "project": "Handover",
        "description": "AI Operational Memory for the Next Person",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "api": settings.API_V1_STR,
    }
