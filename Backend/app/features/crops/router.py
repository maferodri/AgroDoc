"""Endpoints HTTP del módulo crops.

Contrato: `docs/openapi.yaml` (`/crops/*`, `/crop-types`, `/farms`).
"""

from fastapi import APIRouter

from app.features.crops import service
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["crops"])


@router.get("/crops/health", response_model=ModuleHealth, summary="Estado del módulo crops")
def module_health() -> ModuleHealth:
    return service.health()

# Próximos endpoints del slice (ver contrato):
#   GET/POST /crops, GET/PATCH/DELETE /crops/{id}, GET/POST /crops/{id}/events
#   GET /crop-types, GET/POST /farms
