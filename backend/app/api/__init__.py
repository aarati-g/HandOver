from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.assets import router as assets_router
from app.api.routes.handovers import router as handovers_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(assets_router)
api_router.include_router(handovers_router)

__all__ = ["api_router", "health_router", "assets_router", "handovers_router"]
