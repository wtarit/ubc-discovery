import asyncio
import logging

from events_scraper.analyzer import enrich_event
from events_scraper.db import async_session, engine
from events_scraper.loader import load_events
from events_scraper.scraper import UBC_CLUB_INSTAGRAMS, scrape_instagram_profile

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


async def run() -> None:
    log.info("Starting pipeline for %d clubs", len(UBC_CLUB_INSTAGRAMS))

    all_events: list[dict] = []
    for username in UBC_CLUB_INSTAGRAMS:
        log.info("Scraping @%s", username)
        posts = await scrape_instagram_profile(username)
        log.info("  got %d posts", len(posts))
        for post in posts:
            enriched = await enrich_event(post)
            all_events.append(enriched)

    log.info("Scraped %d total events, loading into DB", len(all_events))

    async with async_session() as db:
        count = await load_events(db, all_events)

    await engine.dispose()
    log.info("Done — loaded %d events", count)


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
