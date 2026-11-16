"""Configuración del monolito, leída de variables de entorno."""

from functools import lru_cache

from pydantic import model_validator
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

    # Recuperación de contraseña: código de 6 dígitos de un solo uso.
    password_reset_code_ttl_minutes: int = 10
    password_reset_token_ttl_minutes: int = 10
    password_reset_max_attempts: int = 5
    password_reset_max_requests_per_window: int = 3
    password_reset_rate_limit_window_minutes: int = 15

    # Correo transaccional. El hosting de producción bloquea SMTP, así que el
    # transporte real es la API HTTPS de Brevo.
    email_provider: str = "console"
    brevo_api_key: str = ""
    email_from: str = ""
    email_from_name: str = "AgroDoc"

    # Orígenes permitidos para el frontend (separados por coma).
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Inferencia (la usa el módulo detection).
    model_path: str = "/models/model.onnx"
    confidence_threshold: float = 0.70

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @model_validator(mode="after")
    def _validate_email_configuration(self) -> "Settings":
        """Falla al arrancar si producción usa Brevo sin credenciales."""
        if self.environment.strip().lower() != "production":
            return self
        if self.email_provider.strip().lower() != "brevo":
            return self

        missing = [
            name
            for name, value in (
                ("BREVO_API_KEY", self.brevo_api_key),
                ("EMAIL_FROM", self.email_from),
            )
            if not value.strip()
        ]
        if missing:
            raise ValueError(
                "Faltan variables de entorno para enviar correo con Brevo: " + ", ".join(missing)
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
