from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.event import Event
from app.models.user import User
from app.schemas.event import CreateEventRequest, EventListResponse, EventResponse
from app.services import s3
from app.utils.geo import haversine_km

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


@router.get("/nearby", response_model=EventListResponse)
async def list_nearby_events(
    radius_km: float = Query(default=10.0, le=50.0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lat = current_user.home_latitude or current_user.last_latitude
    lon = current_user.home_longitude or current_user.last_longitude
    if not lat or not lon:
        raise HTTPException(status_code=400, detail="Set your home location first")

    result = await db.execute(
        select(Event).where(Event.latitude.is_not(None), Event.longitude.is_not(None))
    )
    all_events = result.scalars().all()

    nearby = [e for e in all_events if haversine_km(lat, lon, e.latitude, e.longitude) <= radius_km]
    nearby.sort(key=lambda e: e.event_date or e.created_at, reverse=True)

    return EventListResponse(
        events=[_to_response(e) for e in nearby[skip : skip + limit]],
        total=len(nearby),
    )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return _to_response(event)


@router.post("", response_model=EventResponse)
async def create_event(
    body: CreateEventRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    event = Event(**body.model_dump(), source="manual")
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return _to_response(event)
