import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

EVENT_SOURCE_LABELS = ("ubc_official", "ams_club", "campus_community")
EVENT_VIBES = (
    "social",
    "career",
    "academic",
    "arts",
    "culture",
    "outdoors",
    "sports",
    "food",
    "wellness",
    "volunteering",
)


class EventResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    source: str
    source_label: str
    source_url: str | None
    external_cta_label: str | None
    club_name: str | None
    image_url: str | None
    vibes: list[str]
    latitude: float | None
    longitude: float | None
    location_name: str | None
    event_date: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class CreateEventRequest(BaseModel):
    title: str
    description: str | None = None
    club_name: str | None = None
    image_url: str | None = None
    source_label: str = "campus_community"
    source_url: str | None = None
    external_cta_label: str | None = None
    vibes: list[str] = Field(default_factory=list)
    latitude: float | None = None
    longitude: float | None = None
    location_name: str | None = None
    event_date: datetime | None = None

    @field_validator("source_label")
    @classmethod
    def validate_source_label(cls, value: str) -> str:
        if value not in EVENT_SOURCE_LABELS:
            raise ValueError("source_label must be one of the fixed event source labels")
        return value

    @field_validator("vibes")
    @classmethod
    def validate_vibes(cls, value: list[str]) -> list[str]:
        invalid = [vibe for vibe in value if vibe not in EVENT_VIBES]
        if invalid:
            raise ValueError("vibes must use the fixed event vibe taxonomy")
        return value


class EventListResponse(BaseModel):
    events: list[EventResponse]
    total: int
