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
    """Initialize database tables and seed initial demo assets."""
    from app.db.models import Asset
    from sqlalchemy import select

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo data if not already present
    async with async_session_maker() as session:
        stmt = select(Asset).limit(1)
        result = await session.execute(stmt)
        if result.scalar_one_or_none() is None:
            demo_assets = [
                Asset(
                    asset_code="COMP-03",
                    name="Compressor #03",
                    type="Compressor",
                    location="Plant Floor A - Sector 2",
                    status="needs_attention",
                ),
                Asset(
                    asset_code="GEN-12",
                    name="Generator #12",
                    type="Generator",
                    location="Substation B",
                    status="operational",
                ),
                Asset(
                    asset_code="PUMP-07",
                    name="Pump #07",
                    type="Pump",
                    location="Water Treatment C",
                    status="operational",
                ),
            ]
            session.add_all(demo_assets)
            await session.commit()
