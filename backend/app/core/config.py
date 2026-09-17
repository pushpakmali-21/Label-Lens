from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "LabelLens API"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/labellens"
    
    # Allow extra fields from .env to be ignored if not explicitly defined
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
