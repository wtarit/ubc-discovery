import json
from datetime import datetime, timezone
from unittest.mock import patch

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.user import User
from app.services import recommender


def _make_embedding_from_title(title: str) -> list[float]:
    h = sum(ord(c) for c in title)
    return [
        (h % 10) / 10.0,
        ((h * 3) % 10) / 10.0,
        ((h * 7) % 10) / 10.0,
        ((h * 11) % 10) / 10.0,
    ]


class TestCosineSimilarity:
    def test_identical(self):
        v = [1.0, 0.0, 0.5]
        assert recommender.cosine_similarity(v, v) == 1.0

    def test_orthogonal(self):
        assert recommender.cosine_similarity([1.0, 0.0], [0.0, 1.0]) == 0.0

    def test_zero_vector(self):
        assert recommender.cosine_similarity([0.0, 0.0], [1.0, 0.0]) == 0.0

    def test_negative_values(self):
        a = [1.0, -2.0, 3.0]
        b = [-1.0, 2.0, -3.0]
        assert recommender.cosine_similarity(a, b) == -1.0

    def test_length_mismatch(self):
        try:
            recommender.cosine_similarity([1.0], [1.0, 2.0])
            assert False, "expected ValueError"
        except ValueError:
            pass


class TestVibeJaccard:
    def test_identical(self):
        assert recommender.vibe_jaccard(
            ["social", "academic"], ["academic", "social"]
        ) == 1.0

    def test_disjoint(self):
        assert recommender.vibe_jaccard(["social"], ["career"]) == 0.0

    def test_partial(self):
        assert recommender.vibe_jaccard(
            ["social", "academic", "career"], ["social", "academic"]
        ) == 2.0 / 3.0

    def test_both_empty(self):
        assert recommender.vibe_jaccard([], []) == 0.0

    def test_one_empty(self):
        assert recommender.vibe_jaccard(["social"], []) == 0.0


class TestHybridScore:
    def test_same_event(self):
        emb = [0.5, 0.5, 0.5, 0.5]
        vibes = ["social", "academic"]
        score = recommender.hybrid_score(emb, emb, vibes, vibes)
        assert score == 1.0 + 0.2 * 1.0
        assert score == 1.2

    def test_no_overlap(self):
        a = [1.0, 0.0, 0.0, 0.0]
        b = [0.0, 1.0, 0.0, 0.0]
        score = recommender.hybrid_score(a, b, ["social"], ["career"])
        assert score == 0.0


class TestMeanEmbedding:
    def test_single(self):
        result = recommender.mean_embedding([[1.0, 2.0, 3.0]])
        assert result == [1.0, 2.0, 3.0]

    def test_multiple(self):
        result = recommender.mean_embedding([
            [1.0, 2.0],
            [3.0, 4.0],
            [5.0, 6.0],
        ])
        assert result == [3.0, 4.0]

    def test_empty(self):
        assert recommender.mean_embedding([]) is None


class TestSimilarEvents:
    async def test_returns_similar(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        with patch.object(recommender, "embed_text") as mock_embed:
            mock_embed.return_value = _make_embedding_from_title("generic")

            event = sample_events[0]
            resp = await unauthed_client.get(
                f"/recommendations/events/{event.id}/similar", params={"n": 2}
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["event_id"] == event.id
        assert len(data["events"]) <= 2
        assert len(data["scores"]) == len(data["events"])
        ids = [e["id"] for e in data["events"]]
        assert event.id not in ids

    async def test_not_found(self, unauthed_client: AsyncClient):
        resp = await unauthed_client.get("/recommendations/events/nope123/similar")
        assert resp.status_code == 404

    async def test_respects_n(
        self, unauthed_client: AsyncClient, sample_events: list[Event]
    ):
        with patch.object(recommender, "embed_text") as mock_embed:
            mock_embed.return_value = _make_embedding_from_title("generic")
            resp = await unauthed_client.get(
                f"/recommendations/events/{sample_events[0].id}/similar",
                params={"n": 1},
            )

        assert resp.status_code == 200
        assert len(resp.json()["events"]) == 1


class TestForYou:
    async def test_falls_back_to_recent_when_no_saved(
        self, client: AsyncClient, sample_events: list[Event]
    ):
        resp = await client.get("/recommendations/events/for-you", params={"n": 5})

        assert resp.status_code == 200
        data = resp.json()
        assert data["source"] == "recent"
        assert len(data["events"]) > 0
        assert all(s == 0.0 for s in data["scores"])

    async def test_requires_auth(self, unauthed_client: AsyncClient):
        resp = await unauthed_client.get("/recommendations/events/for-you")
        assert resp.status_code == 401

    async def test_personalized_from_saved(
        self, client: AsyncClient, sample_events: list[Event], test_user: User
    ):
        event = sample_events[0]
        save_resp = await client.post(f"/events/{event.id}/save")
        assert save_resp.status_code == 200

        with patch.object(recommender, "embed_text") as mock_embed:
            mock_embed.return_value = _make_embedding_from_title(event.title)
            resp = await client.get("/recommendations/events/for-you", params={"n": 5})

        assert resp.status_code == 200
        data = resp.json()
        assert data["source"] == "saved_events"
        assert len(data["events"]) > 0
        assert any(s > 0.0 for s in data["scores"])
        saved_ids = [s.event_id for s in [event]]
        result_ids = [e["id"] for e in data["events"]]
        for sid in saved_ids:
            assert sid not in result_ids
