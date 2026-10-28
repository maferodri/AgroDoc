"""Esquemas Pydantic del módulo auth — contrato HTTP de `docs/openapi.yaml`.

Cubre el registro de usuarios (`POST /auth/register`):
- RegisterRequest  → lo que ENVÍA el cliente.
- AuthResponse     → lo que RECIBE el cliente (tokens + usuario).
- User             → representación pública del usuario (sin password_hash).
- AgronomistProfile / AgronomistUser → perfil extendido y su combinación con User.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

#Restringe un String a un conjunto fijo de valores 
UserRole = Literal["farmer", "agronomist", "admin"]
RegisterableRole = Literal["farmer", "agronomist"]


class User(BaseModel):
    """Representación pública del usuario. Nunca incluye `password_hash`."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class AgronomistProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    specialty: str | None = None
    license_number: str | None = None
    is_available: bool


class AgronomistUser(User):
    """User + su perfil de agrónomo (para `GET /agronomists`)."""

    profile: AgronomistProfile | None = Field(
        default=None,
        validation_alias="agronomist_profile",
    )


class RegisterRequest(BaseModel):
    """Body de `POST /auth/register`."""

    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    role: RegisterableRole
    specialty: str | None = Field(default=None, max_length=255)
    license_number: str | None = Field(default=None, max_length=100)

    @model_validator(mode="after")
    def _check_agronomist_fields(self) -> "RegisterRequest":
        if self.role != "agronomist" and (self.specialty or self.license_number):
            raise ValueError(
                "specialty y license_number solo aplican al rol 'agronomist'"
            )
        return self


class AuthResponse(BaseModel):
    """Respuesta de `POST /auth/register` (y, más adelante, de `POST /auth/login`)."""

    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user: User