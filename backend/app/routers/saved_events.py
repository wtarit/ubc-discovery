from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.event import Event
from app.models.saved_event import SavedEvent
from app.models.user import User
from app.schemas.saved_event import (
    SavedEventListResponse,
    SavedEventResponse,
    SavedEventWithEventResponse,
)
from app.presenters.event import event_to_response

router = APIRouter(prefix="/saved-events", tags=["Saved Events"])


@router.get("", response_model=SavedEventListResponse)
async def list_saved_events(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(
        select(func.count()).select_from(SavedEvent).where(SavedEvent.user_id == user.id)
    )
    total = count_result.scalar()

    result = await db.execute(
        select(SavedEvent, Event)
        .join(Event, Event.id == SavedEvent.event_id)
        .where(SavedEvent.user_id == user.id)
        .order_by(SavedEvent.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    saved = result.all()
    return SavedEventListResponse(
        saved_events=[
            SavedEventWithEventResponse(
                **SavedEventResponse.model_validate(saved_event).model_dump(),
                event=event_to_response(event),
            )
            for saved_event, event in saved
        ],
        total=total,
    )


@router.post("/{event_id}", response_model=SavedEventResponse)
async def save_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify event exists
    event_result = await db.execute(select(Event).where(Event.id == event_id))
    if not event_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already saved (upsert: return existing if so)
    existing_result = await db.execute(
        select(SavedEvent).where(and_(SavedEvent.user_id == user.id, SavedEvent.event_id == event_id))
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        return SavedEventResponse.model_validate(existing)

    saved_event = SavedEvent(user_id=user.id, event_id=event_id)
    db.add(saved_event)
    await db.commit()
    await db.refresh(saved_event)
    return SavedEventResponse.model_validate(saved_event)


@router.delete("/{event_id}", status_code=204)
async def unsave_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedEvent).where(and_(SavedEvent.user_id == user.id, SavedEvent.event_id == event_id))
    )
    saved_event = result.scalar_one_or_none()
    if not saved_event:
        raise HTTPException(status_code=404, detail="Saved event not found")

    await db.delete(saved_event)
    await db.commit()

