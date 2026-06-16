from pydantic import BaseModel

from app.schemas.event import EventResponse


class SimilarEventsResponse(BaseModel):
    event_id: str
    events: list[EventResponse]
    scores: list[float]


class ForYouResponse(BaseModel):
    events: list[EventResponse]
    scores: list[float]
    source: str
