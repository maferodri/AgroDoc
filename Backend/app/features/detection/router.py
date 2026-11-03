
"""Endpoints HTTP del módulo detection.

La inferencia se consume desde el módulo `diagnosis`, no desde el frontend,
así que el contrato público (`docs/openapi.yaml`) no expone rutas aquí.
"""

from fastapi import APIRouter

from app.features.detection import service
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["detection"])


@router.get(
    "/detection/health",
    response_model=ModuleHealth,
    summary="Estado del módulo detection",
)
def module_health() -> ModuleHealth:
    return service.health()
