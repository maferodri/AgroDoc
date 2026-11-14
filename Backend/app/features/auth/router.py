"""Endpoints HTTP del módulo auth.

Contrato: `docs/openapi.yaml` (`/auth/*`, `/users/*`, `/agronomists`).
Este archivo solo traduce HTTP ↔ casos de uso; la lógica vive en `service.py`.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.auth import service
from app.features.auth.dependency import get_current_user
from app.features.auth.models import User
from app.features.auth.schemas import AuthResponse, LoginRequest, RegisterRequest
from app.features.auth.schemas import User as UserSchema
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["auth"])


@router.get("/auth/health", response_model=ModuleHealth, summary="Estado del módulo auth")
def module_health() -> ModuleHealth:
    return service.health()


# Post Registrar usuario
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    return service.register(db, payload)


@router.post("/login", response_model=AuthResponse, summary="Iniciar sesión")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return service.login(db, payload)


@router.get("/me", response_model=UserSchema, summary="Usuario autenticado")
def me(current_user: User = Depends(get_current_user)) -> UserSchema:
    return UserSchema.model_validate(current_user)


# Próximos endpoints del slice (ver contrato):
#   POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
#   GET  /users/me, GET /agronomists
