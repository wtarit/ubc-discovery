import uuid
from datetime import datetime

from pydantic import BaseModel


class ZoneUnlockResponse(BaseModel):
    id: uuid.UUID
    zone_id: str
    unlocked_at: datetime

    model_config = {"from_attributes": True}


class ZoneProgressResponse(BaseModel):
    unlocks: list[ZoneUnlockResponse]
    total_points: int
