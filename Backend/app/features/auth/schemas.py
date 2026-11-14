"""Esquemas Pydantic del módulo auth — contrato HTTP de `docs/openapi.yaml`.

Cubre el registro de usuarios (`POST /auth/register`), el login y la
recuperación de contraseña (`POST /auth/password-reset/*`):
- RegisterRequest  → lo que ENVÍA el cliente.
- AuthResponse     → lo que RECIBE el cliente (tokens + usuario).
- User             → representación pública del usuario (sin password_hash).
- AgronomistProfile / AgronomistUser → perfil extendido y su combinación con User.
"""

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)

from . import validators

# Restringe un String a un conjunto fijo de valores
UserRole = Literal["farmer", "agronomist", "admin"]

# Roles que un administrador puede asignar al editar una cuenta
AssignableRole = Literal["agronomist", "admin"]

# Tipos reutilizables
NormalizedEmail = Annotated[EmailStr, BeforeValidator(validators.normalize_email)]
TrimmedStr = Annotated[str, BeforeValidator(validators.strip_text)]


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


class UpdateUserRoleRequest(BaseModel):
    """Body de PATCH para admins"""

    model_config = ConfigDict(extra="forbid")
    role: AssignableRole


class RegisterRequest(BaseModel):
    """Body de `POST /auth/register`."""

    model_config = ConfigDict(extra="forbid")

    email: NormalizedEmail
    password: str = Field(min_length=8, max_length=128)
    full_name: TrimmedStr = Field(min_length=1, max_length=255)

    @field_validator("password")
    @classmethod
    def _check_password(cls, value: str) -> str:
        return validators.validate_password_policy(value)


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: NormalizedEmail
    password: str = Field(min_length=1, max_length=128)


class PasswordResetRequest(BaseModel):
    """Body de `POST /auth/password-reset/request`."""

    model_config = ConfigDict(extra="forbid")

    email: NormalizedEmail


class PasswordResetVerifyRequest(BaseModel):
    """Body de `POST /auth/password-reset/verify`."""

    model_config = ConfigDict(extra="forbid")

    email: NormalizedEmail
    code: str = Field(min_length=1, max_length=64)


class PasswordResetConfirmRequest(BaseModel):
    """Body de `POST /auth/password-reset/confirm`."""

    model_config = ConfigDict(extra="forbid")

    reset_token: str = Field(min_length=1, max_length=512)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _check_password(cls, value: str) -> str:
        return validators.validate_password_policy(value)


class PasswordResetVerifyResponse(BaseModel):
    """Token de un solo uso para completar el cambio de contraseña."""

    reset_token: str
    expires_in: int


class MessageResponse(BaseModel):
    message: str


class AuthResponse(BaseModel):
    """Respuesta de `POST /auth/register` (y, más adelante, de `POST /auth/login`)."""

    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user: User
