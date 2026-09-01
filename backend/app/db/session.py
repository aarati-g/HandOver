from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

Base = declarative_base()

# Async engine setup (pgvector ready)
engine = None
async_session_maker = None

if settings.DATABASE_URL:
    engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, future=True)
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """Dependency for obtaining an async database session."""
    if not async_session_maker:
        yield None
        return
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
