"""
Tests for the /og OpenGraph endpoint.

Covers:
- OG HTML response for valid events
- Meta tag presence (og:title, og:description, og:image, twitter:card)
- 404 for missing events
- No image tags when event has no picture key
- XSS escaping of user-controlled content
"""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event


class TestOgEvent:
    async def test_og_returns_html(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        event = sample_events[0]
        resp = await unauthed_client.get(f"/og/events/{event.id}")
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"]

    async def test_og_contains_meta_tags(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        event = sample_events[0]
        resp = await unauthed_client.get(f"/og/events/{event.id}")
        body = resp.text
        assert 'og:title' in body
        assert 'og:description' in body
        assert 'og:url' in body
        assert 'og:type' in body
        assert 'og:site_name' in body
        assert 'twitter:card' in body
        assert 'twitter:title' in body

    async def test_og_event_title_in_html(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        event = sample_events[0]
        resp = await unauthed_client.get(f"/og/events/{event.id}")
        assert event.title in resp.text

    async def test_og_404_for_missing_event(self, unauthed_client: AsyncClient):
        resp = await unauthed_client.get("/og/events/notfound")
        assert resp.status_code == 404

    async def test_og_url_meta_present(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        event = sample_events[0]
        resp = await unauthed_client.get(f"/og/events/{event.id}")
        assert f"/events/{event.id}" in resp.text

    async def test_og_no_image_tags_when_no_picture(
        self, unauthed_client: AsyncClient, db_session: AsyncSession
    ):
        event = Event(
            title="No Image Event",
            source="manual",
            source_label="campus_community",
            vibes=[],
        )
        db_session.add(event)
        await db_session.flush()

        resp = await unauthed_client.get(f"/og/events/{event.id}")
        assert resp.status_code == 200
        assert "og:image" not in resp.text
        assert "twitter:image" not in resp.text
        assert 'twitter:card" content="summary"' in resp.text

    async def test_og_xss_escaped(
        self, unauthed_client: AsyncClient, db_session: AsyncSession
    ):
        event = Event(
            title='<script>alert("xss")</script>',
            description='<img src=x onerror=alert(1)>',
            source="manual",
            source_label="campus_community",
            vibes=[],
        )
        db_session.add(event)
        await db_session.flush()

        resp = await unauthed_client.get(f"/og/events/{event.id}")
        assert resp.status_code == 200
        assert "<script>" not in resp.text
        assert "<img " not in resp.text
        assert "&lt;script&gt;" in resp.text
        assert "&lt;img " in resp.text
