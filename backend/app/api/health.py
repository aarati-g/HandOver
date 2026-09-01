from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    service: str


@router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Health check endpoint to verify service availability."""
    return HealthResponse(
        status="ok",
        service="handover-api"
    )
