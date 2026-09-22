from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration centrale de l'application, chargee depuis les variables
    d'environnement / le fichier .env."""

    PROJECT_NAME: str = "ImmoAssist API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./immoassist.db"

    SECRET_KEY: str = "insecure_dev_secret_key_change_me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    FIRST_ADMIN_EMAIL: str = "admin@immoassist.ma"
    FIRST_ADMIN_PASSWORD: str = "Admin123!"
    FIRST_ADMIN_NAME: str = "Administrateur ImmoAssist"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
