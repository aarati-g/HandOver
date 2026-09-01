from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import Asset, Handover, HandoverEvent
from app.schemas.handover import (
    HandoverAnalyzeRequest,
    HandoverAnalyzeResponse,
    HandoverAnswerRequest,
    HandoverAnswerResponse,
    OperationalState,
    StateComparisonRequest,
    StateComparisonResponse,
)
from app.services.ai import get_ai_provider
from app.services.gap_service import gap_service
from app.services.handover_service import handover_service

router = APIRouter(prefix="/handovers", tags=["Handovers"])


@router.post("/analyze", response_model=HandoverAnalyzeResponse)
async def analyze_handover(
    payload: HandoverAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Core AI Extraction: Converts raw technician notes into structured operational memory,
    identifies critical knowledge gaps, and evaluates deterministic readiness.
    """
    # 1. Look up asset context
    stmt = select(Asset).where(Asset.asset_code == payload.asset_id)
    asset = (await db.execute(stmt)).scalar_one_or_none()

    asset_context = None
    if asset:
        asset_context = {
            "asset_code": asset.asset_code,
            "name": asset.name,
            "type": asset.type,
            "location": asset.location,
        }

    # 2. Extract operational state using swappable AI provider
    ai_provider = get_ai_provider()
    operational_state = await ai_provider.analyze_handover(
        text=payload.text,
        asset_context=asset_context,
    )

    # 3. Detect prioritized information gaps
    gap = gap_service.detect_gap(
        state=operational_state,
        raw_text=payload.text,
    )

    # 4. Calculate deterministic readiness score & status breakdown
    readiness = handover_service.evaluate_readiness(
        state=operational_state,
        gap_detected=gap.detected,
        answered_gap=False,
    )

    # 5. Persist handover record
    handover_record = Handover(
        asset_id=payload.asset_id,
        raw_input=payload.text,
        issue=operational_state.issue,
        completed_actions=operational_state.completed_actions,
        pending_actions=operational_state.pending_actions,
        workaround=operational_state.workaround,
        root_cause=operational_state.root_cause,
        operational_context=operational_state.operational_context,
        current_status=operational_state.current_status,
        risks=operational_state.risks,
        unknowns=operational_state.unknowns,
        next_action=operational_state.next_action,
        confidence=operational_state.confidence,
        readiness_score=readiness.score,
        readiness_status=readiness.status,
        readiness_breakdown=readiness.breakdown.model_dump(),
        gap_data=gap.model_dump(),
    )
    db.add(handover_record)
    await db.flush()

    # 6. Record audit events
    events = [
        HandoverEvent(
            handover_id=handover_record.id,
            event_type="HANDOVER_CREATED",
            details={"asset_id": payload.asset_id, "initial_status": operational_state.current_status},
        )
    ]
    if gap.detected:
        events.append(
            HandoverEvent(
                handover_id=handover_record.id,
                event_type="GAP_DETECTED",
                details={"question": gap.question, "severity": gap.severity, "reason": gap.reason},
            )
        )
    db.add_all(events)

    # Update asset status
    if asset:
        asset.status = operational_state.current_status

    await db.commit()
    await db.refresh(handover_record)

    return HandoverAnalyzeResponse(
        handover_id=handover_record.id,
        asset_id=payload.asset_id,
        operational_state=operational_state,
        readiness=readiness,
        readiness_score=readiness.score,
        gap=gap,
    )


@router.post("/{handover_id}/answer", response_model=HandoverAnswerResponse)
async def answer_handover_gap(
    handover_id: int,
    payload: HandoverAnswerRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Incorporate user's answer into operational memory, re-evaluate gaps,
    recalculate readiness score, and record audit history.
    """
    stmt = select(Handover).options(selectinload(Handover.events)).where(Handover.id == handover_id)
    handover = (await db.execute(stmt)).scalar_one_or_none()

    if not handover:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Handover record #{handover_id} not found",
        )

    # 1. Reconstruct current operational state
    current_state = OperationalState(
        issue=handover.issue,
        current_status=handover.current_status,
        completed_actions=list(handover.completed_actions or []),
        pending_actions=list(handover.pending_actions or []),
        workaround=handover.workaround,
        root_cause=handover.root_cause,
        operational_context=handover.operational_context,
        risks=list(handover.risks or []),
        unknowns=list(handover.unknowns or []),
        next_action=handover.next_action,
        confidence=handover.confidence or 1.0,
    )

    # 2. Get last asked question
    gap_question = (handover.gap_data or {}).get("question") or "Clarification required"

    # 3. AI provider re-evaluates state with answer
    ai_provider = get_ai_provider()
    updated_state = await ai_provider.re_evaluate_with_answer(
        current_state=current_state,
        question=gap_question,
        answer=payload.answer,
    )

    # 4. Re-run gap analysis
    updated_gap = gap_service.detect_gap(
        state=updated_state,
        raw_text=handover.raw_input,
        answered_context=payload.answer,
    )

    # 5. Recalculate readiness
    updated_readiness = handover_service.evaluate_readiness(
        state=updated_state,
        gap_detected=updated_gap.detected,
        answered_gap=True,
    )

    # 6. Record audit events
    events = [
        HandoverEvent(
            handover_id=handover.id,
            event_type="GAP_ANSWERED",
            details={"question": gap_question, "answer": payload.answer},
        ),
        HandoverEvent(
            handover_id=handover.id,
            event_type="READINESS_CHANGED",
            details={
                "previous_score": handover.readiness_score,
                "new_score": updated_readiness.score,
                "status": updated_readiness.status,
            },
        ),
    ]
    db.add_all(events)

    # 7. Update database record
    handover.completed_actions = updated_state.completed_actions
    handover.pending_actions = updated_state.pending_actions
    handover.workaround = updated_state.workaround
    handover.root_cause = updated_state.root_cause
    handover.operational_context = updated_state.operational_context
    handover.current_status = updated_state.current_status
    handover.risks = updated_state.risks
    handover.unknowns = updated_state.unknowns
    handover.next_action = updated_state.next_action
    handover.confidence = updated_state.confidence
    handover.readiness_score = updated_readiness.score
    handover.readiness_status = updated_readiness.status
    handover.readiness_breakdown = updated_readiness.breakdown.model_dump()
    handover.gap_data = updated_gap.model_dump()
    handover.raw_input = f"{handover.raw_input}\n[Answer]: {payload.answer}"

    await db.commit()
    await db.refresh(handover)

    return HandoverAnswerResponse(
        handover_id=handover.id,
        asset_id=handover.asset_id,
        operational_state=updated_state,
        readiness=updated_readiness,
        readiness_score=updated_readiness.score,
        gap=updated_gap,
    )


@router.post("/compare", response_model=StateComparisonResponse)
async def compare_states(payload: StateComparisonRequest):
    """
    Compare two operational states and detect meaningful shifts in status,
    issues, risks, and next steps while ignoring wording-only variations.
    """
    return handover_service.detect_changes(
        previous_state=payload.previous_state,
        current_state=payload.current_state,
    )
