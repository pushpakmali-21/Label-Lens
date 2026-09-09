from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LabelLens API"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/labellens"
    
    class Config:
        env_file = ".env"

settings = Settings()
