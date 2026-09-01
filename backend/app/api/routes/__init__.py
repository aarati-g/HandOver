from .health import router as health_router
from .assets import router as assets_router
from .handovers import router as handovers_router

__all__ = ["health_router", "assets_router", "handovers_router"]
