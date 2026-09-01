from datetime import datetime, timezone, timedelta
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

Base = declarative_base()

# SQLAlchemy Async Engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async database session."""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables and seed initial demo assets and handover history."""
    from app.db.models import Asset, Handover, HandoverEvent
    from sqlalchemy import select

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo data if not already present
    async with async_session_maker() as session:
        stmt = select(Asset).limit(1)
        result = await session.execute(stmt)
        if result.scalar_one_or_none() is None:
            now = datetime.now(timezone.utc)

            comp03 = Asset(
                asset_code="COMP-03",
                name="Compressor #03",
                type="Industrial Compressor",
                location="Plant Floor A - Sector 2",
                status="needs_attention",
                created_at=now - timedelta(days=2),
                updated_at=now - timedelta(days=2),
            )
            gen12 = Asset(
                asset_code="GEN-12",
                name="Generator #12",
                type="Backup Generator",
                location="Substation B - Exterior",
                status="operational",
                created_at=now - timedelta(days=5),
                updated_at=now - timedelta(hours=5),
            )
            pump07 = Asset(
                asset_code="PUMP-07",
                name="Pump #07",
                type="Water Pump",
                location="Water Treatment C",
                status="operational",
                created_at=now - timedelta(days=7),
                updated_at=now - timedelta(days=1),
            )
            session.add_all([comp03, gen12, pump07])
            await session.flush()

            # Seed initial historical handover record and events for COMP-03
            initial_handover = Handover(
                asset_id="COMP-03",
                raw_input="Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load.",
                issue="Abnormal vibration",
                completed_actions=["Belt replaced"],
                pending_actions=["Motor inspection"],
                workaround="Operate below 70% load",
                root_cause="Unknown",
                operational_context="Reported operating below 70% load during shift",
                current_status="needs_attention",
                risks=["Potential bearing fatigue if run above 75% load"],
                unknowns=["Root cause has not been confirmed"],
                next_action="Inspect motor and verify vibration under normal operating load",
                confidence=0.86,
                readiness_score=86,
                readiness_status="almost_ready",
                readiness_breakdown={
                    "current_status": 20,
                    "issue": 15,
                    "completed_actions": 15,
                    "pending_actions": 15,
                    "operational_context": 5,
                    "workaround": 10,
                    "next_action": 5,
                    "unknowns": 1,
                },
                gap_data={
                    "detected": True,
                    "question": "Was the compressor tested under normal operating load after the belt replacement?",
                    "reason": "Operating-load test not confirmed",
                    "severity": "medium",
                },
                created_at=now - timedelta(days=2),
            )
            session.add(initial_handover)
            await session.flush()

            # Seed audit events for initial history
            events = [
                HandoverEvent(
                    handover_id=initial_handover.id,
                    event_type="HANDOVER_CREATED",
                    details={"summary": "Abnormal vibration reported", "asset_id": "COMP-03"},
                    created_at=now - timedelta(days=2),
                ),
                HandoverEvent(
                    handover_id=initial_handover.id,
                    event_type="GAP_DETECTED",
                    details={
                        "summary": "Operating-load test not confirmed",
                        "question": "Was the compressor tested under normal operating load after the belt replacement?",
                    },
                    created_at=now - timedelta(days=2),
                ),
            ]
            session.add_all(events)
            await session.commit()
