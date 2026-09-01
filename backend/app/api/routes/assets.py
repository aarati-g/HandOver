from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import Asset, Handover
from app.schemas.asset import AssetCreate, AssetResponse
from app.schemas.handover import HandoverHistoryItem, HandoverEventItem, OperationalState

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("", response_model=List[AssetResponse])
async def list_assets(db: AsyncSession = Depends(get_db)):
    """Retrieve all registered equipment assets."""
    stmt = select(Asset).order_by(Asset.asset_code)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details of a single equipment asset by ID or asset code."""
    stmt = select(Asset).where(
        (Asset.asset_code == asset_id) | (Asset.id == int(asset_id) if asset_id.isdigit() else False)
    )
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset '{asset_id}' not found",
        )
    return asset


@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(payload: AssetCreate, db: AsyncSession = Depends(get_db)):
    """Register a new industrial equipment asset."""
    stmt = select(Asset).where(Asset.asset_code == payload.asset_code)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset with code '{payload.asset_code}' already exists",
        )

    asset = Asset(**payload.model_dump())
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset


@router.get("/{asset_id}/history", response_model=List[HandoverHistoryItem])
async def get_asset_history(asset_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve historical handover records and event audit logs for a specific asset."""
    stmt = (
        select(Handover)
        .options(selectinload(Handover.events))
        .where(Handover.asset_id == asset_id)
        .order_by(Handover.created_at.desc())
    )
    result = await db.execute(stmt)
    handovers = result.scalars().all()

    items = []
    for h in handovers:
        op_state = OperationalState(
            issue=h.issue,
            current_status=h.current_status,
            completed_actions=h.completed_actions or [],
            pending_actions=h.pending_actions or [],
            workaround=h.workaround,
            root_cause=h.root_cause,
            operational_context=h.operational_context,
            risks=h.risks or [],
            unknowns=h.unknowns or [],
            next_action=h.next_action,
            confidence=h.confidence or 1.0,
        )
        events = [
            HandoverEventItem(
                id=e.id,
                handover_id=e.handover_id,
                event_type=e.event_type,
                details=e.details or {},
                created_at=e.created_at,
            )
            for e in (h.events or [])
        ]
        items.append(
            HandoverHistoryItem(
                id=h.id,
                asset_id=h.asset_id,
                raw_input=h.raw_input,
                operational_state=op_state,
                readiness_score=h.readiness_score,
                readiness_status=h.readiness_status or "needs_attention",
                events=events,
                created_at=h.created_at,
            )
        )
    return items
