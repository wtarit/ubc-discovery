from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.event import Event
from app.schemas.event import CreateEventRequest, EventListResponse, EventResponse
from app.services import s3

router = APIRouter(prefix="/events", tags=["Events"])


def _to_response(event: Event) -> EventResponse:
    r = EventResponse.model_validate(event)
    if event.event_picture_key:
        r.event_picture_url = s3.public_url(event.event_picture_key)
    return r


@router.get("", response_model=EventListResponse)
async def list_events(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(select(func.count()).select_from(Event))
    total = count_result.scalar()

    result = await db.execute(
        select(Event).order_by(Event.event_date.desc().nullslast(), Event.created_at.desc()).offset(skip).limit(limit)
    )
    events = result.scalars().all()
    return EventListResponse(events=[_to_response(e) for e in events], total=total)


@router.get("/search", response_model=EventListResponse)
async def search_events(
    q: str = Query(default=""),
    limit: int = Query(default=10, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Search events by title, description, location, or club name."""
    term = q.strip()
    if len(term) < 2:
        return EventListResponse(events=[], total=0)
    pattern = f"%{term}%"
    query = (
        select(Event)
        .where(
            Event.title.ilike(pattern)
            | Event.description.ilike(pattern)
            | Event.location_name.ilike(pattern)
            | Event.club_name.ilike(pattern)
        )
        .order_by(Event.event_date.asc().nullslast())
        .limit(limit)
    )
    result = await db.execute(query)
    events = result.scalars().all()
    return EventListResponse(events=[_to_response(e) for e in events], total=len(events))


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return _to_response(event)


@router.post("", response_model=EventResponse, dependencies=[Depends(require_admin)])
async def create_event(
    body: CreateEventRequest,
    db: AsyncSession = Depends(get_db),
):
    event = Event(**body.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return _to_response(event)
