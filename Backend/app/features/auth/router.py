"""Endpoints HTTP del módulo auth.

Contrato: `docs/openapi.yaml` (`/auth/*`, `/users/*`, `/agronomists`).
Este archivo solo traduce HTTP ↔ casos de uso; la lógica vive en `service.py`.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.auth import service
from app.shared.schemas import ModuleHealth
from app.features.auth.schemas import AuthResponse, RegisterRequest

router = APIRouter(tags=["auth"])


@router.get("/auth/health", response_model=ModuleHealth, summary="Estado del módulo auth")
def module_health() -> ModuleHealth:
    return service.health()

#Post Registrar usuario
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    return service.register(db, payload)

# Próximos endpoints del slice (ver contrato):
#   POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
#   GET  /users/me, GET /agronomists
