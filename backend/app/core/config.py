from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "LabelLens API"
    # SQLite fallback keeps the prototype running without Postgres
    DATABASE_URL: str = "sqlite:///./labellens.db"
    # Gemini API key — fill in backend/.env before running scans
    GEMINI_API_KEY: str = ""

    # Allow extra fields from .env to be ignored if not explicitly defined
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
