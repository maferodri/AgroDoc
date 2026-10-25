"""Endpoints HTTP del módulo auth.

Contrato: `docs/openapi.yaml` (`/auth/*`, `/users/*`, `/agronomists`).
Este archivo solo traduce HTTP ↔ casos de uso; la lógica vive en `service.py`.
"""

from fastapi import APIRouter

from app.features.auth import service
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["auth"])


@router.get("/auth/health", response_model=ModuleHealth, summary="Estado del módulo auth")
def module_health() -> ModuleHealth:
    return service.health()

# Próximos endpoints del slice (ver contrato):
#   POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
#   GET  /users/me, GET /agronomists
