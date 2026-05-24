import html

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.event import Event
from app.services import s3

router = APIRouter(prefix="/og", tags=["OpenGraph"])


@router.get("/events/{event_id}", response_class=HTMLResponse)
async def og_event(event_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    title = html.escape(event.title)
    description = html.escape(event.description)
    image_url = s3.public_url(event.event_picture_key) if event.event_picture_key else None
    url = html.escape(f"{settings.frontend_url}/events/{event.id}")

    image_tags = ""
    if image_url:
        escaped_image = html.escape(image_url)
        image_tags = f"""<meta property="og:image" content="{escaped_image}">
<meta name="twitter:image" content="{escaped_image}">"""

    twitter_card = "summary_large_image" if image_url else "summary"

    return HTMLResponse(
        f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title} — UBC Discovery</title>
<meta property="og:type" content="article">
<meta property="og:site_name" content="UBC Discovery">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
{image_tags}<meta property="og:url" content="{url}">
<meta name="twitter:card" content="{twitter_card}">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
</head>
</html>"""
    )
