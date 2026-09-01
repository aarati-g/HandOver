from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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


def resolve_frontend_dist() -> Path:
    """Resolve the production frontend dist directory path."""
    if settings.FRONTEND_DIST_DIR:
        custom = Path(settings.FRONTEND_DIST_DIR)
        if custom.exists():
            return custom

    # Standard monorepo path: HandOver/frontend/dist
    repo_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
    if repo_dist.exists():
        return repo_dist

    cwd_dist = Path.cwd() / "frontend" / "dist"
    if cwd_dist.exists():
        return cwd_dist

    cwd_parent_dist = Path.cwd().parent / "frontend" / "dist"
    if cwd_parent_dist.exists():
        return cwd_parent_dist

    return repo_dist


frontend_dist = resolve_frontend_dist()


@app.get("/")
async def serve_root():
    """Serve production React app index or API information fallback."""
    index_file = frontend_dist / "index.html"
    if frontend_dist.exists() and index_file.is_file():
        return FileResponse(index_file)
    return {
        "project": "Handover",
        "description": "AI Operational Memory for the Next Person",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "api": settings.API_V1_STR,
        "status": "backend_ready",
    }


@app.get("/{full_path:path}")
async def serve_spa_frontend(full_path: str):
    """Serve specific static assets or fallback to index.html for client-side routing."""
    # Guard against intercepting unmatched API routes
    if full_path.startswith("api/") or full_path == "api":
        raise HTTPException(status_code=404, detail="API route not found")

    if frontend_dist.exists():
        if full_path:
            static_file = frontend_dist / full_path
            if static_file.is_file():
                return FileResponse(static_file)

        index_file = frontend_dist / "index.html"
        if index_file.is_file():
            return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Resource not found")

