from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import Asset, Handover
from app.schemas.asset import AssetCreate, AssetResponse
from app.schemas.handover import (
    HandoverHistoryItem,
    HandoverEventItem,
    OperationalState,
    OperationalEventSummary,
)

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


@router.get("/{asset_id}/history", response_model=List[OperationalEventSummary])
async def get_asset_history(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve chronological operational events for an asset (e.g. HANDOVER_CREATED, GAP_DETECTED, GAP_ANSWERED).
    """
    # Verify asset exists
    asset_stmt = select(Asset).where(
        (Asset.asset_code == asset_id) | (Asset.id == int(asset_id) if asset_id.isdigit() else False)
    )
    asset = (await db.execute(asset_stmt)).scalar_one_or_none()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset '{asset_id}' not found",
        )

    stmt = (
        select(Handover)
        .options(selectinload(Handover.events))
        .where(Handover.asset_id == asset.asset_code)
        .order_by(Handover.created_at.asc())
    )
    result = await db.execute(stmt)
    handovers = result.scalars().all()

    chronological_events: List[OperationalEventSummary] = []

    for h in handovers:
        if h.events:
            for e in h.events:
                # Determine clean human summary
                summary = ""
                if e.details and "summary" in e.details:
                    summary = e.details["summary"]
                elif e.event_type == "HANDOVER_CREATED":
                    summary = h.issue or "Shift handover recorded"
                elif e.event_type == "GAP_DETECTED":
                    summary = (e.details or {}).get("reason") or (e.details or {}).get("question") or "Operating-load test not confirmed"
                elif e.event_type == "GAP_ANSWERED":
                    ans = (e.details or {}).get("answer") or ""
                    summary = f"Clarification: {ans}" if ans else "Gap answered"
                elif e.event_type == "READINESS_CHANGED":
                    summary = f"Readiness evaluated at {(e.details or {}).get('new_score', h.readiness_score)}%"
                else:
                    summary = f"Event: {e.event_type}"

                chronological_events.append(
                    OperationalEventSummary(
                        type=e.event_type,
                        timestamp=e.created_at,
                        summary=summary,
                        details=e.details or {},
                        handover_id=h.id,
                    )
                )
        else:
            # Fallback if no specific sub-events recorded
            chronological_events.append(
                OperationalEventSummary(
                    type="HANDOVER_CREATED",
                    timestamp=h.created_at,
                    summary=h.issue or "Shift handover recorded",
                    details={"raw_input": h.raw_input},
                    handover_id=h.id,
                )
            )

    return chronological_events
