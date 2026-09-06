"""
app/core/config.py
──────────────────
Application settings loaded from environment variables (or .env file).
Uses Pydantic v2 BaseSettings for type-safe, validated configuration.
"""

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    All configurable parameters for the LabelLens backend.
    Values are read from environment variables; the .env file is loaded
    automatically when running locally.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://labellens:labellens_dev@localhost:5432/labellens"

    # Synchronous URL used by Alembic (Alembic doesn't support asyncpg directly)
    @property
    def sync_database_url(self) -> str:
        """Return a psycopg2-compatible URL for Alembic migrations."""
        return self.database_url.replace(
            "postgresql+asyncpg://", "postgresql+psycopg://"
        )

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── Security ──────────────────────────────────────────────────────────────
    secret_key: str = "labellens-dev-secret-key-change-me-in-production"

    # ── App metadata ──────────────────────────────────────────────────────────
    environment: str = "development"
    app_version: str = "0.1.0"
    app_name: str = "LabelLens Compliance API"

    # ── CORS ──────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    # ── Rule engine ───────────────────────────────────────────────────────────
    # Path to lmpcRules.json relative to the app package root.
    # Keep in sync with src/data/lmpcRules.json in the frontend.
    lmpc_rules_path: str = "app/data/lmpcRules.json"

    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached singleton of Settings.
    Using lru_cache means the .env file is read only once per process,
    not on every request.
    """
    return Settings()
