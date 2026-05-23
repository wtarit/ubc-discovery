import httpx
from bs4 import BeautifulSoup

UBC_CLUB_INSTAGRAMS = [
    "ubcstudentunion",
    "ubccsss",
    "ubcbcs",
    "ubcengineers",
    "ubcrec",
    "ubcnss",
    "ubcisa",
    "ubcsailingclub",
    "ubchiking",
    "ubcphotoclub",
]


async def scrape_instagram_profile(username: str) -> list[dict]:
    url = f"https://www.instagram.com/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }

    events = []
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, headers=headers, timeout=10.0)
            if response.status_code != 200:
                return events

            soup = BeautifulSoup(response.text, "html.parser")
            meta_tags = soup.find_all("meta", attrs={"property": "og:description"})
            for meta in meta_tags:
                content = meta.get("content", "")
                if content:
                    events.append({
                        "title": f"Post from @{username}",
                        "description": content[:500],
                        "source": "instagram",
                        "source_label": "ams_club",
                        "source_url": url,
                        "external_cta_label": "View Instagram",
                        "club_name": username,
                        "vibes": ["social"],
                    })
    except httpx.HTTPError:
        pass

    return events
