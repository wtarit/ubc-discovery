from sqlalchemy.ext.asyncio import AsyncSession

from events_scraper.models import Event


async def load_events(db: AsyncSession, events: list[dict]) -> int:
    count = 0
    for raw in events:
        event = Event(**raw)
        db.add(event)
        count += 1
    if count > 0:
        await db.commit()
    return count
