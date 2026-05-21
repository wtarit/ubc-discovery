from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from app.config import settings

engine = create_async_engine(
    settings.database_url, echo=False, connect_args={"ssl": "require"}
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session


async def ensure_event_discovery_columns(conn) -> None:
    await conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS source_label VARCHAR(50) NOT NULL DEFAULT 'campus_community'"))
    await conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS external_cta_label VARCHAR(80)"))
    await conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS vibes JSONB NOT NULL DEFAULT '[]'::jsonb"))
