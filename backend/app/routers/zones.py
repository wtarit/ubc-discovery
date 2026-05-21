from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.zone_unlock import ZoneUnlock
from app.schemas.zone_unlock import ZoneUnlockResponse, ZoneProgressResponse

router = APIRouter(prefix="/zones", tags=["Zones"])

ZONE_POINTS: dict[str, int] = {
    "nitobe-garden": 50,
    "rose-garden": 40,
    "wreck-beach": 60,
    "bookstore": 30,
    "koerner-library": 35,
    "ikb-library": 35,
    "museum-of-anthropology": 60,
    "ams-nest": 40,
    "aquatic-centre": 45,
    "pacific-spirit-park": 70,
    "beaty-museum": 45,
    "chan-centre": 45,
}


@router.post("/{zone_id}/unlock", response_model=ZoneUnlockResponse)
async def unlock_zone(
    zone_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if zone_id not in ZONE_POINTS:
        raise HTTPException(status_code=404, detail="Unknown zone")

    existing = await db.scalar(
        select(ZoneUnlock).where(
            ZoneUnlock.user_id == current_user.id,
            ZoneUnlock.zone_id == zone_id,
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="Zone already unlocked")

    unlock = ZoneUnlock(user_id=current_user.id, zone_id=zone_id)
    db.add(unlock)
    await db.commit()
    await db.refresh(unlock)
    return unlock


@router.get("/progress", response_model=ZoneProgressResponse)
async def get_zone_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.scalars(
        select(ZoneUnlock)
        .where(ZoneUnlock.user_id == current_user.id)
        .order_by(ZoneUnlock.unlocked_at)
    )
    unlocks = list(result.all())
    total_points = sum(ZONE_POINTS.get(u.zone_id, 0) for u in unlocks)
    return ZoneProgressResponse(unlocks=unlocks, total_points=total_points)
