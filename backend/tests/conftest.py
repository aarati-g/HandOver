import asyncio
import pytest
from app.db.database import init_db


@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    """Ensure database schema is created and demo data seeded before tests run."""
    loop = asyncio.new_event_loop()
    loop.run_until_complete(init_db())
    loop.close()
