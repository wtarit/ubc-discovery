# Event-First, Web-First Pivot for V1

## Status

Accepted (2026-05-25)

## Context

The original Discover surface was map-first — users explored campus spatially, tapping pins to find events and places. This design assumed users choose events by *where* they are. Zones and Exploration Progress (gamification around campus areas) reinforced a "UBC exploration tracker" identity.

After research and reflection, the premise changed:

1. **Users choose events by what they're about, not where they are.** Pin-by-pin browsing adds friction to content-based decisions.
2. **UBC landmarks are already well-documented elsewhere** — no differentiation in being another campus map.
3. **An event platform has broader adoption potential** than an exploration tracker. Inside Higher Ed's Student Voice survey (2023, 3,000 students, 170 institutions) found campus events calendar is the #1 desired app feature (6 in 10 students).
4. **The gap at UBC is student-curated, vibe-filtered event aggregation on web.** Official calendars are institutional; club events are scattered across Instagram pages.
5. **Installing a native app adds friction.** Web-first distribution (shareable links, no download) aligns with an event platform where shareability is core.

## Decision

1. **Discover becomes event-list-first** — filterable by vibe, source, date. Map is a secondary location-context view, not the primary surface.
2. **Cut from v1**: Zones, Zone Unlocks, Exploration Progress, Map as primary surface, Meet/Nearby, native app (Expo).
3. **Frontend rewrite**: React Router 7 (framework mode with SSR) replacing Expo. Deployed on ECS Fargate behind ALB (same as backend). SSR enables OpenGraph meta tags for link previews.
4. **Content pipeline**: Instagram scrape → LLM extraction into structured Event Listings → auto-publish high confidence / admin review queue for low confidence.
5. **V1 scope**: Event discovery, Save/bookmark, Event Ratings (framed as recommendation input, not public reviews), Personalized Event Feed.
6. **Backend**: Unchanged. Unused endpoints (zones, connections, meet) remain but are not called from the new frontend.
7. **Feature roadmap**: V1 Events → V2 Exploration Progress → V3 Meet (when user density supports it).

## Consequences

- Full frontend rewrite. Existing Expo/React Native code is abandoned (git history preserves it).
- Zones and gamification code in the backend becomes dead weight until V2. Acceptable cost vs. rewriting the backend now.
- Reviews/ratings data collected in v1 has compounding value for recurring events (nwHacks, BizTech, Blueprint) — but only becomes publicly visible in a future version.
- Cold start problem solved by Instagram scraping rather than requiring clubs to post on the platform.
- Web-first means no native push notifications in v1; retention relies on feed freshness, saves, and potentially email digests.
