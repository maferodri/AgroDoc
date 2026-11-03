"""Configuración del monolito, leída de variables de entorno."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Valores de configuración con defaults seguros para desarrollo."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=(),
    )

    app_name: str = "AgroDoc API"
    version: str = "2.0.0"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    # Una sola base de datos; cada módulo es dueño de sus tablas.
    database_url: str = "postgresql+psycopg://agrodoc:cambiame@localhost:5432/agrodoc_db"

    # Autenticación (la usa el módulo auth).
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # Orígenes permitidos para el frontend (separados por coma).
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Inferencia (la usa el módulo detection).
    model_path: str = "/models/model.onnx"
    confidence_threshold: float = 0.70

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
