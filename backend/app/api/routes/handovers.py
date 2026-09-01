from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import Asset, Handover
from app.schemas.handover import (
    HandoverAnalyzeRequest,
    HandoverAnalyzeResponse,
    HandoverAnswerRequest,
    HandoverAnswerResponse,
    OperationalState,
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
    Analyze messy technician input with AI, extract operational memory,
    detect critical knowledge gaps, and calculate deterministic readiness.
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

    # 3. Detect information gaps
    gap = gap_service.detect_gap(
        state=operational_state,
        raw_text=payload.text,
    )

    # 4. Calculate deterministic readiness score
    readiness = handover_service.calculate_readiness_score(
        state=operational_state,
        gap_detected=gap.detected,
        answered_gap=False,
    )

    # 5. Persist to database
    handover_record = Handover(
        asset_id=payload.asset_id,
        raw_input=payload.text,
        issue=operational_state.issue,
        completed_actions=operational_state.completed_actions,
        pending_actions=operational_state.pending_actions,
        workaround=operational_state.workaround,
        root_cause=operational_state.root_cause,
        current_status=operational_state.current_status,
        risks=operational_state.risks,
        unknowns=operational_state.unknowns,
        confidence=operational_state.confidence,
        readiness_score=readiness,
        gap_data=gap.model_dump(),
    )
    db.add(handover_record)

    # Update asset status if asset exists
    if asset:
        asset.status = operational_state.current_status

    await db.commit()
    await db.refresh(handover_record)

    return HandoverAnalyzeResponse(
        handover_id=handover_record.id,
        asset_id=payload.asset_id,
        operational_state=operational_state,
        gap=gap,
        readiness_score=readiness,
    )


@router.post("/{handover_id}/answer", response_model=HandoverAnswerResponse)
async def answer_handover_gap(
    handover_id: int,
    payload: HandoverAnswerRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Answer a detected gap question, merge clarification into operational state,
    re-evaluate gaps, and recalculate readiness score.
    """
    stmt = select(Handover).where(Handover.id == handover_id)
    handover = (await db.execute(stmt)).scalar_one_or_none()

    if not handover:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Handover record #{handover_id} not found",
        )

    # 1. Reconstruct current operational state
    op_state = OperationalState(
        issue=handover.issue,
        completed_actions=list(handover.completed_actions or []),
        pending_actions=list(handover.pending_actions or []),
        workaround=handover.workaround,
        root_cause=handover.root_cause,
        current_status=handover.current_status,
        risks=list(handover.risks or []),
        unknowns=list(handover.unknowns or []),
        confidence=handover.confidence or 1.0,
    )

    # 2. Merge answer into operational state
    answer_text = payload.answer.strip()
    if answer_text:
        # Add the verified test/clarification to completed actions
        if "tested" in answer_text.lower() and not any("tested" in a.lower() for a in op_state.completed_actions):
            op_state.completed_actions.append(f"Verification test: {answer_text}")
        else:
            op_state.completed_actions.append(f"Clarification: {answer_text}")

        # Clear resolved unknowns if addressed
        if op_state.unknowns:
            op_state.unknowns = [
                u for u in op_state.unknowns
                if not any(w in u.lower() for w in ["load", "test", "verification"])
            ]

    # 3. Re-run gap analysis
    updated_gap = gap_service.detect_gap(
        state=op_state,
        raw_text=handover.raw_input,
        answered_context=answer_text,
    )

    # 4. Recalculate readiness score
    updated_readiness = handover_service.calculate_readiness_score(
        state=op_state,
        gap_detected=updated_gap.detected,
        answered_gap=True,
    )

    # 5. Update database record
    handover.completed_actions = op_state.completed_actions
    handover.unknowns = op_state.unknowns
    handover.readiness_score = updated_readiness
    handover.gap_data = updated_gap.model_dump()
    handover.raw_input = f"{handover.raw_input}\n[Clarification]: {answer_text}"

    await db.commit()
    await db.refresh(handover)

    return HandoverAnswerResponse(
        handover_id=handover.id,
        asset_id=handover.asset_id,
        readiness_score=updated_readiness,
        gap=updated_gap,
        operational_state=op_state,
    )
