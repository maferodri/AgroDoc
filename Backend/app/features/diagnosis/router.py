"""Endpoints HTTP del módulo diagnosis.

Contrato: `docs/openapi.yaml` (`/diagnoses/*`, `/pests/*`).
"""

from fastapi import APIRouter

from app.features.diagnosis import service
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["diagnosis"])


@router.get(
    "/diagnoses/health",
    response_model=ModuleHealth,
    summary="Estado del módulo diagnosis",
)
def module_health() -> ModuleHealth:
    return service.health()

# Próximos endpoints del slice (ver contrato):
#   POST /diagnoses, GET /diagnoses, GET /diagnoses/{id}
#   GET /pests, GET /pests/{id}
