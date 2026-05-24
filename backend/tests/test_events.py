"""
Tests for the /events endpoints.

Covers:
- GET /events - list all events (paginated)
- POST /events - create a manual event (authenticated)
- GET /events/nearby - nearby events (authenticated, needs location)
"""

from httpx import AsyncClient

from app.models.event import Event
from app.models.user import User


class TestListEvents:
    async def test_list_events_empty(self, unauthed_client: AsyncClient):
        resp = await unauthed_client.get("/events")
        assert resp.status_code == 200
        data = resp.json()
        assert "events" in data
        assert "total" in data
        assert isinstance(data["events"], list)

    async def test_list_events_with_data(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        resp = await unauthed_client.get("/events")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 3
        titles = [e["title"] for e in data["events"]]
        assert "Test Event 0" in titles

    async def test_list_events_pagination(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        resp = await unauthed_client.get("/events", params={"skip": 0, "limit": 2})
        assert resp.status_code == 200
        assert len(resp.json()["events"]) <= 2

    async def test_list_events_skip(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        resp = await unauthed_client.get("/events", params={"skip": 100, "limit": 20})
        assert resp.status_code == 200
        assert len(resp.json()["events"]) == 0


class TestGetEvent:
    async def test_get_event_public(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        event = sample_events[0]
        resp = await unauthed_client.get(f"/events/{event.id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == event.id
        assert len(data["id"]) == 8
        assert data["title"] == event.title
        assert data["source_label"] == event.source_label
        assert data["vibes"] == event.vibes

    async def test_get_event_not_found(self, unauthed_client: AsyncClient):
        resp = await unauthed_client.get("/events/notfound")
        assert resp.status_code == 404


class TestCreateEvent:
    async def test_create_event_success(self, client: AsyncClient):
        resp = await client.post(
            "/events",
            json={
                "title": "My New Event",
                "description": "A cool gathering",
                "club_name": "Coding Club",
                "source_label": "ams_club",
                "source_url": "https://example.com/event",
                "external_cta_label": "View registration",
                "vibes": ["career", "social"],
                "latitude": 49.2700,
                "longitude": -123.2500,
                "location_name": "The Nest",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "My New Event"
        assert data["source"] == "manual"
        assert data["source_label"] == "ams_club"
        assert data["source_url"] == "https://example.com/event"
        assert data["external_cta_label"] == "View registration"
        assert data["vibes"] == ["career", "social"]
        assert data["club_name"] == "Coding Club"

    async def test_create_event_minimal_fields(self, client: AsyncClient):
        resp = await client.post(
            "/events",
            json={"title": "Minimal Event"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Minimal Event"
        assert data["description"] == ""
        assert data["source_label"] == "campus_community"
        assert data["vibes"] == []

    async def test_create_event_rejects_unknown_vibe(self, client: AsyncClient):
        resp = await client.post(
            "/events",
            json={"title": "Unknown Vibe", "vibes": ["invented"]},
        )
        assert resp.status_code == 422

    async def test_create_event_with_date(self, client: AsyncClient):
        resp = await client.post(
            "/events",
            json={
                "title": "Future Event",
                "event_date": "2026-09-01T10:00:00Z",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["event_date"] is not None


class TestNearbyEvents:
    async def test_nearby_events(
        self, client: AsyncClient, sample_events: list[Event], test_user: User
    ):
        """test_user has home_latitude/home_longitude set; events are near UBC."""
        resp = await client.get("/events/nearby", params={"radius_km": 10.0})
        assert resp.status_code == 200
        data = resp.json()
        assert "events" in data
        assert "total" in data
