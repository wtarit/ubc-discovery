from httpx import AsyncClient


class TestUnlockZone:
    async def test_unlock_zone_success(self, client: AsyncClient):
        resp = await client.post("/zones/nitobe-garden/unlock")
        assert resp.status_code == 200
        data = resp.json()
        assert data["zone_id"] == "nitobe-garden"
        assert "unlocked_at" in data
        assert "id" in data

    async def test_unlock_zone_duplicate(self, client: AsyncClient):
        await client.post("/zones/rose-garden/unlock")
        resp = await client.post("/zones/rose-garden/unlock")
        assert resp.status_code == 409

    async def test_unlock_zone_invalid_id(self, client: AsyncClient):
        resp = await client.post("/zones/nonexistent-zone/unlock")
        assert resp.status_code == 404

    async def test_unlock_zone_unauthenticated(self, unauthed_client: AsyncClient):
        resp = await unauthed_client.post("/zones/nitobe-garden/unlock")
        assert resp.status_code in (401, 403, 422)


class TestZoneProgress:
    async def test_get_progress_empty_initially(self, client: AsyncClient):
        resp = await client.get("/zones/progress")
        assert resp.status_code == 200
        data = resp.json()
        assert "unlocks" in data
        assert "total_points" in data
        assert isinstance(data["unlocks"], list)

    async def test_get_progress_after_unlocks(self, client: AsyncClient):
        await client.post("/zones/wreck-beach/unlock")
        await client.post("/zones/ams-nest/unlock")
        resp = await client.get("/zones/progress")
        assert resp.status_code == 200
        data = resp.json()
        zone_ids = [u["zone_id"] for u in data["unlocks"]]
        assert "wreck-beach" in zone_ids
        assert "ams-nest" in zone_ids
        assert data["total_points"] >= 100  # wreck-beach=60 + ams-nest=40

    async def test_get_progress_unauthenticated(self, unauthed_client: AsyncClient):
        resp = await unauthed_client.get("/zones/progress")
        assert resp.status_code in (401, 403, 422)
