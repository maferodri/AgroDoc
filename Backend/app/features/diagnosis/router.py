"""Endpoints HTTP del módulo diagnosis.

Contrato: `docs/openapi.yaml` (`/diagnoses/*`, `/pests/*`).
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.diagnosis import service
from app.features.diagnosis.schemas import DiagnosisResponse
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["diagnosis"])


@router.get(
    "/diagnoses/health",
    response_model=ModuleHealth,
    summary="Estado del módulo diagnosis",
)
def module_health() -> ModuleHealth:
    return service.health()


@router.get(
    "/diagnoses/{id}",
    response_model=DiagnosisResponse,
    summary="Obtener un diagnóstico por ID",
)
def get_diagnosis_by_id(
    id: uuid.UUID,
    db: Session = Depends(get_db),
) -> DiagnosisResponse:
    # TODO(pruebas): restaurar autenticación (Depends(get_current_user)) y volver
    # a llamar a `service.get_diagnosis(db, user_id=current_user.id, diagnosis_id=id)`.
    return service.get_diagnosis_by_id(db, diagnosis_id=id)


# Próximos endpoints del slice (ver contrato):
#   POST /diagnoses, GET /diagnoses
#   GET /pests, GET /pests/{id}
