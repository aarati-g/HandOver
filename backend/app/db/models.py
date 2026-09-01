from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.database import Base


class Asset(Base):
    """Machine/Equipment Asset model."""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    location = Column(String(150), nullable=True)
    status = Column(String(50), default="operational", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    handovers = relationship("Handover", back_populates="asset", cascade="all, delete-orphan")


class Handover(Base):
    """Operational Handover record model."""
    __tablename__ = "handovers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(String(50), ForeignKey("assets.asset_code"), nullable=False, index=True)
    raw_input = Column(Text, nullable=False)
    
    # Structured operational state
    issue = Column(String(255), nullable=True)
    completed_actions = Column(JSON, default=list, nullable=False)
    pending_actions = Column(JSON, default=list, nullable=False)
    workaround = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=True)
    current_status = Column(String(50), default="needs_attention", nullable=False)
    risks = Column(JSON, default=list, nullable=False)
    unknowns = Column(JSON, default=list, nullable=False)
    confidence = Column(Float, default=1.0, nullable=False)

    # Readiness & Gaps
    readiness_score = Column(Integer, default=0, nullable=False)
    gap_data = Column(JSON, default=dict, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    asset = relationship("Asset", back_populates="handovers")
