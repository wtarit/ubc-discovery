"""Seed UBC events into the database."""

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.models.event import Event

UBC_EVENTS = [
    {
        "title": "SEEDS Sustainability Symposium",
        "description": "A showcase of student-led research that uses the UBC campus as a 'living lab.' Innovative projects on urban biodiversity, waste reduction, and climate resilience.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://sustain.ubc.ca/",
        "external_cta_label": "View organizer page",
        "vibes": ["academic", "volunteering", "wellness"],
        "club_name": "SEEDS Sustainability",
        "latitude": 49.2625,
        "longitude": -123.2531,
        "location_name": "CIRS (2260 West Mall)",
        "event_date": "2026-05-07T09:00:00Z",
    },
    {
        "title": "Science Rendezvous",
        "description": "Part of a national science festival, legendary for hands-on experiments like 'Liquid Nitrogen Ice Cream' and 'Mysterious Minerals'.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://science.ubc.ca/",
        "external_cta_label": "View organizer page",
        "vibes": ["academic", "social"],
        "club_name": "Science Rendezvous",
        "latitude": 49.2631,
        "longitude": -123.2513,
        "location_name": "Beaty Biodiversity Museum (2212 Main Mall)",
        "event_date": "2026-05-09T10:00:00Z",
    },
    {
        "title": "Morning Bird Walk",
        "description": "Led by expert birders, focusing on identifying spring migrating species. Explore diverse habitats from forest floor to canopy.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://botanicalgarden.ubc.ca/",
        "external_cta_label": "View organizer page",
        "vibes": ["outdoors", "wellness"],
        "event_picture_key": "event-pictures/wHh80G7Z.jpg",
        "club_name": "Botanical Garden",
        "latitude": 49.2530,
        "longitude": -123.2520,
        "location_name": "UBC Botanical Garden (6804 SW Marine Dr)",
        "event_date": "2026-05-09T09:00:00Z",
    },
    {
        "title": "Summer Session Residence Move-In",
        "description": "Primary move-in day for students enrolled in the Summer Term. The campus will be busy with new arrivals.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://vancouver.housing.ubc.ca/",
        "external_cta_label": "View details",
        "vibes": ["social"],
        "club_name": "UBC Housing",
        "latitude": 49.2611,
        "longitude": -123.2581,
        "location_name": "Various Student Residences (Marine Drive Hub)",
        "event_date": "2026-05-10T09:00:00Z",
    },
    {
        "title": "Summer Session Term 1 Official Start",
        "description": "The first day of the 2026 Summer Session. Fast-paced accelerated courses begin campus-wide.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://students.ubc.ca/enrolment/courses/summer-session",
        "external_cta_label": "View academic dates",
        "vibes": ["academic"],
        "club_name": "UBC Academic",
        "latitude": 49.2668,
        "longitude": -123.2499,
        "location_name": "Campus-wide (AMS Nest)",
        "event_date": "2026-05-11T08:00:00Z",
    },
    {
        "title": "Chung | Lind Gallery Drop-In Tour",
        "description": "Archivists lead this tour through rare maps, photographs, and artifacts focused on the history of the Gold Rush and Chinese immigration.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://about.library.ubc.ca/",
        "external_cta_label": "View organizer page",
        "vibes": ["culture", "arts", "academic"],
        "club_name": "IKB Gallery",
        "latitude": 49.2677,
        "longitude": -123.2527,
        "location_name": "IKB Learning Centre (1961 East Mall)",
        "event_date": "2026-05-13T13:30:00Z",
    },
    {
        "title": "T-Birds in Tech & Sauder Rooftop BBQ",
        "description": "High-profile networking event with tech leaders, local alumni, and students for informal networking and BBQ.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://www.sauder.ubc.ca/",
        "external_cta_label": "View organizer page",
        "vibes": ["career", "food", "social"],
        "club_name": "UBC Sauder",
        "latitude": 49.2651,
        "longitude": -123.2539,
        "location_name": "UBC Sauder (2053 Main Mall)",
        "event_date": "2026-05-13T17:00:00Z",
    },
    {
        "title": "Biodiversity Farm Tour",
        "description": "A guided walk through the 24-hectare working farm. Highlights agroecology and organic crop production.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://ubcfarm.ubc.ca/",
        "external_cta_label": "View organizer page",
        "vibes": ["outdoors", "wellness", "volunteering"],
        "club_name": "UBC Farm",
        "latitude": 49.2534,
        "longitude": -123.2381,
        "location_name": "UBC Farm (3461 Ross Drive)",
        "event_date": "2026-05-13T12:00:00Z",
    },
    {
        "title": "MOA Exhibition: 'I Use My Haida Eyes'",
        "description": "World premiere of history robes by Haida artist Jut-ke-Nay Hazel Wilson. Opening night documents Haida perspectives.",
        "source": "manual",
        "source_label": "ubc_official",
        "source_url": "https://moa.ubc.ca/",
        "external_cta_label": "View exhibition",
        "vibes": ["arts", "culture"],
        "club_name": "MOA",
        "latitude": 49.2695,
        "longitude": -123.2594,
        "location_name": "Museum of Anthropology (6393 NW Marine Dr)",
        "event_date": "2026-05-14T18:00:00Z",
    },
]


async def seed_events(db: AsyncSession) -> int:
    # Clear existing events
    await db.execute(delete(Event))
    
    count = 0
    for data in UBC_EVENTS:
        event_data = data.copy()
        event_data["event_date"] = datetime.fromisoformat(data["event_date"].replace("Z", "+00:00"))
        db.add(Event(**event_data))
        count += 1

    await db.commit()
    return count
