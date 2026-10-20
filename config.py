from functools import lru_cache
import os
import secrets

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_name = "Konoha — personnages de Naruto"
    database_url = os.getenv("DATABASE_URL", "sqlite:///./naruto_showcase.db")
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        if os.getenv("APP_ENV", "development").lower() == "production":
            raise RuntimeError("SECRET_KEY must be configured in production.")
        # Local-only fallback: tokens expire when this process restarts.
        secret_key = secrets.token_urlsafe(48)
    elif len(secret_key.encode("utf-8")) < 32 or secret_key.startswith("replace-with-"):
        raise RuntimeError("SECRET_KEY must be a unique secret of at least 32 bytes.")
    access_token_minutes = int(os.getenv("ACCESS_TOKEN_MINUTES", "30"))
    bootstrap_admin_email = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "").strip().lower()
    bootstrap_admin_password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()
