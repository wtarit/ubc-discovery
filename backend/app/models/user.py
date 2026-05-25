import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    preferred_name: Mapped[str] = mapped_column(String(255))

    major: Mapped[str | None] = mapped_column(String(255))
    year_standing: Mapped[int | None] = mapped_column(Integer)
    faculty: Mapped[str | None] = mapped_column(String(255))
    interests: Mapped[dict | None] = mapped_column(JSONB)
    bio: Mapped[str | None] = mapped_column(Text)
    profile_picture_key: Mapped[str | None] = mapped_column(String(512))

    is_available_to_meet: Mapped[bool] = mapped_column(Boolean, default=False)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    connections_count: Mapped[int] = mapped_column(Integer, default=0)

    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    ubc_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
