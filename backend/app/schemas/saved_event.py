import uuid
from datetime import datetime

from pydantic import BaseModel


class SavedEventResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    event_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SavedEventListResponse(BaseModel):
    saved_events: list[SavedEventResponse]
    total: int
