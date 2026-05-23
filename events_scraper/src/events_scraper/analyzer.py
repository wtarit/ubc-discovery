import json
from functools import lru_cache

import boto3

from events_scraper.config import settings


@lru_cache
def _bedrock_client():
    return boto3.client("bedrock-runtime", region_name=settings.aws_region)


async def enrich_event(raw: dict) -> dict:
    """Use Bedrock Claude to extract structured event details from a scraped post."""
    prompt = (
        "You are an event data extractor for a university community app. "
        "Given this social media post from a UBC club, extract structured event info.\n\n"
        f"Club: {raw.get('club_name', 'unknown')}\n"
        f"Post text: {raw.get('description', '')}\n\n"
        "Return JSON with these fields (use null if not found):\n"
        "- title: concise event name\n"
        "- description: 1-2 sentence summary\n"
        "- vibes: list of tags from [social, academic, athletic, cultural, nature, food, music, networking]\n"
        "- location_name: venue or place mentioned\n"
        "- event_date: ISO 8601 datetime if mentioned, else null\n\n"
        "Return ONLY valid JSON, no markdown."
    )

    client = _bedrock_client()
    response = client.invoke_model(
        modelId=settings.bedrock_model_id,
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 512,
            "messages": [{"role": "user", "content": prompt}],
        }),
    )

    result = json.loads(response["body"].read())
    text = result["content"][0]["text"]

    try:
        enriched = json.loads(text)
    except json.JSONDecodeError:
        return raw

    for key in ("title", "description", "vibes", "location_name", "event_date"):
        if enriched.get(key) is not None:
            raw[key] = enriched[key]

    return raw
