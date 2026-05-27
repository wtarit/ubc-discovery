import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.event import EventResponse


class SavedEventResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    event_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SavedEventWithEventResponse(SavedEventResponse):
    event: EventResponse


class SavedEventListResponse(BaseModel):
    saved_events: list[SavedEventWithEventResponse]
    total: int
