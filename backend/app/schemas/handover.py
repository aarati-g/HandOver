from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class OperationalState(BaseModel):
    """Structured operational state extracted from raw handover knowledge."""
    issue: Optional[str] = Field(default=None, description="Primary issue or symptom identified")
    current_status: str = Field(default="needs_attention", description="operational, needs_attention, almost_ready, degraded, offline")
    completed_actions: List[str] = Field(default_factory=list, description="Actions already executed and verified")
    pending_actions: List[str] = Field(default_factory=list, description="Actions that must be done next")
    workaround: Optional[str] = Field(default=None, description="Temporary operating conditions, limits or bypasses")
    root_cause: Optional[str] = Field(default=None, description="Identified root cause or explicit Unknown")
    operational_context: Optional[str] = Field(default=None, description="Operating conditions, load, ambient factors, shift context")
    risks: List[str] = Field(default_factory=list, description="Safety, environmental, or equipment risks")
    unknowns: List[str] = Field(default_factory=list, description="Unconfirmed or missing details identified")
    next_action: Optional[str] = Field(default=None, description="Immediate next step for the incoming technician")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score of AI extraction")


class ReadinessBreakdown(BaseModel):
    """Transparent category breakdown of the readiness score."""
    current_status: int = 0
    issue: int = 0
    completed_actions: int = 0
    pending_actions: int = 0
    operational_context: int = 0
    workaround: int = 0
    next_action: int = 0
    unknowns: int = 0


class ReadinessDetail(BaseModel):
    """Complete readiness evaluation containing score, category breakdown, and status."""
    score: int = Field(ge=0, le=100, description="0-100 deterministic readiness score")
    status: str = Field(description="incomplete (0-49), needs_attention (50-74), almost_ready (75-89), ready (90-100)")
    breakdown: ReadinessBreakdown


class GapDetectionResult(BaseModel):
    """Detected information gap in the operational state."""
    detected: bool = Field(description="Whether a critical knowledge gap was detected")
    question: Optional[str] = Field(default=None, description="Targeted question to ask the technician")
    reason: Optional[str] = Field(default=None, description="Explanation of why this information is needed for the next shift")
    severity: Optional[str] = Field(default=None, description="low, medium, high")


class HandoverAnalyzeRequest(BaseModel):
    """Input payload to analyze raw handover input."""
    asset_id: str = Field(description="Asset code, e.g. COMP-03")
    text: str = Field(description="Messy technician notes, voice transcript, or observations")


class HandoverAnalyzeResponse(BaseModel):
    """Complete response returned to the frontend after analysis."""
    handover_id: Optional[int] = None
    asset_id: str
    operational_state: OperationalState
    readiness: ReadinessDetail
    readiness_score: int = Field(ge=0, le=100, description="Deterministic readiness score")
    gap: GapDetectionResult


class HandoverAnswerRequest(BaseModel):
    """Input payload to answer a detected gap question."""
    answer: str = Field(description="Technician's response to the gap question")


class HandoverAnswerResponse(BaseModel):
    """Response returned after answering a gap question."""
    handover_id: int
    asset_id: str
    operational_state: OperationalState
    readiness: ReadinessDetail
    readiness_score: int
    gap: GapDetectionResult


class StateChange(BaseModel):
    """A detected delta between two operational states."""
    field: str
    previous: Optional[str]
    current: Optional[str]
    severity: str = "low"  # low, medium, high


class StateComparisonRequest(BaseModel):
    """Request payload to compare two operational states."""
    previous_state: Optional[OperationalState] = None
    current_state: OperationalState


class StateComparisonResponse(BaseModel):
    """Comparison result of two operational states."""
    has_changes: bool = False
    changes: List[StateChange] = Field(default_factory=list)


class HandoverEventItem(BaseModel):
    """Audit log item representing an operational handover event."""
    id: int
    handover_id: int
    event_type: str
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HandoverHistoryItem(BaseModel):
    """Historical handover record representation."""
    id: int
    asset_id: str
    raw_input: str
    operational_state: OperationalState
    readiness_score: int
    readiness_status: Optional[str] = "needs_attention"
    events: List[HandoverEventItem] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
