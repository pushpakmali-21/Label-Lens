from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    PROJECT_NAME: str = "LabelLens API"
    # SQLite fallback keeps the prototype running without Postgres
    DATABASE_URL: str = "sqlite:///./labellens.db"
    # Gemini API key — set this in backend/.env before running scans.
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-1.5-flash-8b"
    GEMINI_TIMEOUT_SECONDS: int = 30

    # Allow extra fields from .env to be ignored if not explicitly defined
    # Resolve relative to backend, not process working directory. This makes
    # `uvicorn app.main:app` work when launched from repository root or backend.
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

settings = Settings()
