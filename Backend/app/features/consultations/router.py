"""Endpoints HTTP del módulo consultations.

Contrato: `docs/openapi.yaml` (`/consultations/*`).
"""

from fastapi import APIRouter

from app.features.consultations import service
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["consultations"])


@router.get(
    "/consultations/health",
    response_model=ModuleHealth,
    summary="Estado del módulo consultations",
)
def module_health() -> ModuleHealth:
    return service.health()

# Próximos endpoints del slice (ver contrato):
#   GET/POST /consultations, GET/PATCH /consultations/{id}
#   GET/POST /consultations/{id}/messages
