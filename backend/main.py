import json
import logging
from contextlib import asynccontextmanager

import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, ensure_event_discovery_columns
from app.routers import auth, users, events, connections, matching, zones, og

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    cred = credentials.Certificate(json.loads(settings.firebase_credentials_json))
    firebase_admin.initialize_app(cred)
    logger.info("Firebase Admin SDK initialized")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_event_discovery_columns(conn)
    yield
    await engine.dispose()


app = FastAPI(
    title="UBC Newcomers API",
    description="Backend API for UBC Newcomers community app — connecting new UBC students",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(events.router)
app.include_router(connections.router)
app.include_router(matching.router)
app.include_router(zones.router)
app.include_router(og.router)


@app.get("/", tags=["Health"])
async def health():
    return {"status": "ok", "app": "UBC Newcomers API"}
