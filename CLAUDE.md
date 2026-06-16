# UBC Discovery

Campus discovery app for the UBC community to find events, explore places, and connect with people.

## Architecture

- **Backend**: Python FastAPI in `backend/` — async SQLAlchemy + asyncpg
- **Frontend**: React web app in `web/` — React Router 7 + React 19 + Tailwind CSS
- **Database**: PostgreSQL 18.4 on AWS RDS
- **AI**: AWS Bedrock (Claude Sonnet 4.6) for user/event matching, Titan Embeddings for content-based event recommendations

## AWS Resources (us-west-2)

All resource IDs (RDS host, S3 bucket, etc.) are in `backend/.env`. See respective `.env.example` files for the full list.

## Dev Setup

### Backend
```bash
cd backend
uv sync
cp .env.example .env  # fill in values
uv run fastapi dev main.py
```

Swagger docs: http://localhost:8000/docs

### Frontend (Web)
```bash
cd web
pnpm install
pnpm run dev
```

Runs the web frontend at http://localhost:5173.

## Project Structure

```
backend/
├── main.py              # FastAPI app, lifespan, CORS, router wiring
├── Dockerfile           # ECS Fargate deployment
├── app/
│   ├── config.py        # Pydantic settings from .env
│   ├── database.py      # Async SQLAlchemy engine + session
│   ├── dependencies.py  # get_current_user (Cognito token → User)
│   ├── seed.py          # UBC event seed data
│   ├── models/          # SQLAlchemy ORM: User, Event, SavedEvent, Connection, ZoneUnlock
│   ├── schemas/         # Pydantic request/response models (auto Swagger docs)
│   ├── routers/         # auth, users, events, connections, matching, ratings, recommendations, saved_events, zones
│   └── services/        # bedrock, cognito, email, recommender, s3, scraper
└── tests/               # pytest async test suite

web/
├── app/
│   ├── root.tsx                 # React Router root shell
│   ├── routes.ts                # Route config
│   ├── routes/                  # Discover, event detail, organizers, profile, saved, auth/onboarding
│   ├── components/              # Web UI components
│   └── lib/                     # API client, constants, date utilities
├── package.json
└── vite.config.ts
```

## Key Patterns

### Backend
- All Pydantic models use `model_config = {"from_attributes": True}` for ORM compatibility
- AWS clients use `@lru_cache` lazy init (not module-level) to avoid import-time credential issues
- Auth: public discovery (events, places, zones) requires no login; social features are member-only
- UBC email is not required for membership; `*.ubc.ca` is only used to set/confirm the optional `ubc_verified` trust badge
- Profile pictures and event images: S3 presigned URLs (upload + download), key stored in DB (`profile_picture_key`, `event_picture_key`)
- Location: lat/lng floats with haversine distance calc (no PostGIS dependency)
- Matching: Bedrock Claude Sonnet 4.6 scores users/events and returns JSON. Legacy system, will be replaced with Recommender for speed and cost reduction
- Recommender: Content-based event similarity using Bedrock Titan embeddings + vibe Jaccard weighted blend. Embeddings pre-computed at event creation and stored as JSON. Same pattern as bedrock.py for the Bedrock Client.

### Frontend (Web)
- React Router 7 routes live in `web/app/routes/`; shared web UI lives in `web/app/components/`.
- Use PascalCase for shared component filenames and exported component identifiers in `web/app/components/` (for example, `EventCard.tsx` exports `EventCard`). Keep route module filenames in `web/app/routes/` lowercase/kebab-case.
- Use pnpm for web dependencies and scripts (`pnpm install`, `pnpm run dev`, `pnpm run typecheck`).
- Tailwind CSS is available through the React Router/Vite setup.
- API helpers live in `web/app/lib/api.ts`.

## Testing

```bash
cd backend
uv run pytest tests/ -v
```


## Deployment

CI/CD pipeline (TBD).

## DB Credentials

All in `.env` (not committed).
