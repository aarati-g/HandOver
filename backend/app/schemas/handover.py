from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class OperationalState(BaseModel):
    """Structured operational state extracted from raw handover knowledge."""
    issue: Optional[str] = Field(default=None, description="Primary issue or symptom identified")
    completed_actions: List[str] = Field(default_factory=list, description="Actions already executed")
    pending_actions: List[str] = Field(default_factory=list, description="Actions that must be done next")
    workaround: Optional[str] = Field(default=None, description="Temporary operating conditions or limits")
    root_cause: Optional[str] = Field(default=None, description="Identified root cause or explicit Unknown")
    current_status: str = Field(default="needs_attention", description="operational, needs_attention, degraded, offline")
    risks: List[str] = Field(default_factory=list, description="Safety, environmental or equipment risks")
    unknowns: List[str] = Field(default_factory=list, description="Unconfirmed or missing details identified")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score of AI extraction")


class GapDetectionResult(BaseModel):
    """Detected information gap in the operational state."""
    detected: bool = Field(description="Whether a critical knowledge gap was detected")
    question: Optional[str] = Field(default=None, description="Targeted question to ask the technician")
    severity: Optional[str] = Field(default=None, description="low, medium, high")


class HandoverAnalyzeRequest(BaseModel):
    """Input payload to analyze raw handover input."""
    asset_id: str = Field(description="Asset code, e.g. COMP-03")
    text: str = Field(description="Messy technician notes, voice transcript, or observations")


class HandoverAnalyzeResponse(BaseModel):
    """Response returned to the frontend after analysis."""
    handover_id: Optional[int] = None
    asset_id: str
    operational_state: OperationalState
    gap: GapDetectionResult
    readiness_score: int = Field(ge=0, le=100, description="Calculated 0-100 deterministic readiness score")


class HandoverAnswerRequest(BaseModel):
    """Input payload to answer a detected gap question."""
    answer: str = Field(description="Technician's response to the gap question")


class HandoverAnswerResponse(BaseModel):
    """Response returned after answering a gap question."""
    handover_id: int
    asset_id: str
    readiness_score: int
    gap: GapDetectionResult
    operational_state: OperationalState


class StateChange(BaseModel):
    """A detected delta between two operational states."""
    field: str
    previous: Optional[str]
    current: Optional[str]
    severity: str = "low"  # low, medium, high


class StateComparisonResponse(BaseModel):
    """Comparison result of two operational states."""
    changes: List[StateChange]


class HandoverHistoryItem(BaseModel):
    """Historical handover record representation."""
    id: int
    asset_id: str
    raw_input: str
    operational_state: OperationalState
    readiness_score: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
