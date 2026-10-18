from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "MessPulse"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "messpulse-development-secret-key-change-in-production-random-token"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database (Default: SQLite for zero-setup local dev/test; overridden by PostgreSQL in Docker/Prod)
    DATABASE_URL: str = "sqlite:///./messpulse.db"
    
    # Mess configuration
    DEFAULT_MESS_ID: str = "mess_ashoka_01"
    DEFAULT_MESS_NAME: str = "Ashoka Hall of Residence Mess"
    DEFAULT_TIMEZONE: str = "Asia/Kolkata"
    DEFAULT_CUTOFF_MINUTES: int = 60
    MINIMUM_RATING_SAMPLE_SIZE: int = 5
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8000"
    
    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
