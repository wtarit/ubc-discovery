import json
import logging

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

_app = None


def _get_app():
    global _app
    if _app is not None:
        return _app
    try:
        cred = credentials.Certificate(
                json.loads(settings.firebase_credentials_json)
            )
        _app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error("Firebase Admin SDK initialization failed: %s", e)
        raise
    return _app


def verify_id_token(id_token: str) -> dict:
    _get_app()
    try:
        decoded = auth.verify_id_token(id_token)
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
            "email_verified": decoded.get("email_verified", False),
        }
    except auth.InvalidIdTokenError as e:
        logger.warning("Invalid ID token: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except auth.ExpiredIdTokenError as e:
        logger.warning("Expired ID token: %s", e)
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        logger.error("Token verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Token verification failed")


def get_or_create_firebase_user(email: str) -> str:
    _get_app()
    try:
        user = auth.get_user_by_email(email)
        auth.update_user(user.uid, email_verified=True)
        return user.uid
    except auth.UserNotFoundError:
        user = auth.create_user(email=email, email_verified=True)
        return user.uid


def create_custom_token(uid: str) -> str:
    _get_app()
    token = auth.create_custom_token(uid)
    return token.decode("utf-8") if isinstance(token, bytes) else token
