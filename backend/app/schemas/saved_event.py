from datetime import datetime

from pydantic import BaseModel

from app.schemas.event import EventResponse


class SavedEventResponse(BaseModel):
    event_id: str
    saved_at: datetime


class SavedEventListItem(BaseModel):
    saved_at: datetime
    event: EventResponse


class SavedEventListResponse(BaseModel):
    saved_events: list[SavedEventListItem]
    total: int
