# UBC Discovery

Campus discovery app for the UBC community to find events, explore places, and connect with people.

## Architecture

- **Backend**: Python FastAPI in `backend/` — async SQLAlchemy + asyncpg
- **Frontend**: React web app in `web/` — React Router 7 + React 19 + Tailwind CSS
- **Mobile**: React Native app in `mobile/` — Expo SDK 55 + Expo Router + Zustand
- **Database**: PostgreSQL 17.4 on AWS RDS
- **AI**: AWS Bedrock (Claude Sonnet 4.6) for user/event matching

## Product Focus

- Build the web frontend first. Mobile exists in `mobile/`, but it is not the current implementation priority and will be developed later.
- In project conversations and tasks, "frontend" means the web app in `web/` unless mobile is explicitly mentioned.

## AWS Resources (us-west-2)

All resource IDs (RDS host, Cognito pool/client, S3 bucket, ALB, etc.) are in `backend/.env`. Mobile env is in `mobile/.env`. See respective `.env.example` files for the full list.

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

### Mobile
```bash
cd mobile
npm install
npx expo start
```

Mobile runs on iOS/Android with Expo and will be developed after the web frontend.

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
│   ├── models/          # SQLAlchemy ORM: User, Event, Connection, ZoneUnlock
│   ├── schemas/         # Pydantic request/response models (auto Swagger docs)
│   ├── routers/         # auth, users, events, connections, matching, zones
│   └── services/        # cognito, s3, bedrock, sns, scraper
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

mobile/
├── app/                         # Expo Router app routes
├── components/                  # Native UI/icons
├── constants/                   # Colors, zones, mock users
├── services/                    # Mobile API/Firebase clients
└── stores/                      # Zustand stores
```

## Key Patterns

### Backend
- All Pydantic models use `model_config = {"from_attributes": True}` for ORM compatibility
- AWS clients use `@lru_cache` lazy init (not module-level) to avoid import-time credential issues
- Auth: public discovery (events, places, zones) requires no login; social features are member-only
- UBC email not required for membership — optional verification for trust badge (code still enforces `*.ubc.ca`, needs updating)
- Profile pictures and event images: S3 presigned URLs (upload + download), key stored in DB (`profile_picture_key`, `event_picture_key`)
- Location: lat/lng floats with haversine distance calc (no PostGIS dependency)
- Matching: Bedrock Claude Sonnet 4.6 scores users/events and returns JSON

### Frontend (Web)
- `web/` is the default frontend target for new feature work and UI fixes.
- React Router 7 routes live in `web/app/routes/`; shared web UI lives in `web/app/components/`.
- Use PascalCase for shared component filenames and exported component identifiers in `web/app/components/` (for example, `EventCard.tsx` exports `EventCard`). Keep route module filenames in `web/app/routes/` lowercase/kebab-case.
- Use pnpm for web dependencies and scripts (`pnpm install`, `pnpm run dev`, `pnpm run typecheck`).
- Tailwind CSS is available through the React Router/Vite setup.
- API helpers live in `web/app/lib/api.ts`.

### Mobile
- Mobile work lives in `mobile/` and is lower priority until the web frontend is further along.
- Expo Router file-based routing with typed routes enabled
- Zustand for state management (no Redux)
- Platform-specific components via `.native.tsx` / `.tsx` suffixes
- Design system: Plus Jakarta Sans (headings), DM Sans (body), Fira Code (monospace)
- Color theme: Calm Blue (`#007AFF` accent) on white, minimal shadows
- API client in `services/api.ts` — typed fetch wrapper with auto token refresh
- Auth store (`stores/useAuthStore.ts`) wraps Cognito login/signup/refresh via backend
- `EXPO_PUBLIC_API_URL` env var points to the ALB (defaults to production)
- Zone categories: nature, academic, social, culture, athletics (color-coded)
- Gamification: zone unlock points, exploration progress tracking
- Icons: import app icons from `components/icons.ts`, not directly from `lucide-react-native`. Metro does not tree-shake lucide's root barrel, so root imports pull the whole icon catalog. `components/icons.ts` deep-imports only used icon modules via relative `../node_modules/lucide-react-native/dist/esm/icons/*.mjs` paths to keep bundles small and avoid Metro package-exports warnings.

## Testing

```bash
cd backend
uv run pytest tests/ -v
```


## Deployment

CI/CD pipeline (TBD).

## DB Credentials

All in `.env` (not committed).
