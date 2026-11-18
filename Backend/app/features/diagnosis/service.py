"""Casos de uso del módulo diagnosis.

Orquesta el flujo: valida el cultivo con `crops.service`, pide la inferencia a
`detection.service`, guarda el diagnóstico y, si la confianza es baja, delega
la escalación a `consultations.service` (todo en proceso).

Reglas del slice:
- Solo este módulo lee y escribe `diagnoses`, `pests`, `pest_crops` y
  `treatments`.
- No importa modelos de otros módulos: usa sus funciones de servicio.
"""

import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.features.diagnosis import repository
from app.features.diagnosis.models import Diagnosis, Treatment
from app.features.diagnosis.schemas import DiagnosisResponse, TreatmentResponse
from app.shared.schemas import ModuleHealth

MODULE = "diagnosis"

# Orden de aplicación de un tratamiento: el número menor se lista primero.
TREATMENT_PRIORITY_ORDER = {"alta": 0, "media": 1, "baja": 2}


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)


def _sorted_treatments(treatments: list[Treatment]) -> list[Treatment]:
    """Ordena por prioridad (alta → media → baja) y desempata por título."""
    return sorted(
        treatments,
        key=lambda treatment: (
            TREATMENT_PRIORITY_ORDER.get(treatment.priority, 99),
            treatment.title.lower(),
        ),
    )


def _to_treatment_response(treatment: Treatment) -> TreatmentResponse:
    return TreatmentResponse(
        id=treatment.id,
        treatment_type=treatment.treatment_type,
        title=treatment.title,
        description=treatment.description,
        recommendation=treatment.recommendation,
        dose=treatment.dose,
        priority=treatment.priority,
    )


def _to_diagnosis_response(diagnosis: Diagnosis) -> DiagnosisResponse:
    """Convierte un `Diagnosis` ORM (con su plaga y tratamientos) en la respuesta."""
    treatments = (
        [_to_treatment_response(t) for t in _sorted_treatments(diagnosis.pest.treatments)]
        if diagnosis.pest
        else []
    )

    return DiagnosisResponse(
        id=diagnosis.id,
        user_id=diagnosis.user_id,
        crop_id=diagnosis.crop_id,
        image_path=diagnosis.image_path,
        model_version=diagnosis.model_version,
        predicted_label=diagnosis.predicted_label,
        pest_id=diagnosis.pest_id,
        confidence=float(diagnosis.confidence),
        threshold_used=float(diagnosis.threshold_used),
        low_confidence=diagnosis.low_confidence,
        top_k=diagnosis.top_k,
        consultation_id=diagnosis.consultation_id,
        created_at=diagnosis.created_at,
        treatments=treatments,
    )


def get_diagnosis(db: Session, *, user_id: uuid.UUID, diagnosis_id: uuid.UUID) -> DiagnosisResponse:
    """Detalle de un diagnóstico del usuario, con sus tratamientos ordenados.

    Lanza `NotFoundError` si no existe o no pertenece al usuario (sin distinguir
    entre ambos casos para no filtrar qué diagnósticos existen).
    """
    diagnosis = repository.get_diagnosis_for_user(
        db,
        diagnosis_id=diagnosis_id,
        user_id=user_id,
    )
    if diagnosis is None:
        raise NotFoundError("Diagnóstico no encontrado.")
    return _to_diagnosis_response(diagnosis)


def get_diagnosis_by_id(db: Session, *, diagnosis_id: uuid.UUID) -> DiagnosisResponse:
    """Detalle por id, sin filtro de dueño.

    # TODO(pruebas): eliminar esta función y restaurar `get_current_user` en el
    # router. Solo existe para poder probar el endpoint sin autenticación.
    """
    diagnosis = repository.get_diagnosis_by_id(db, diagnosis_id=diagnosis_id)
    if diagnosis is None:
        raise NotFoundError("Diagnóstico no encontrado.")
    return _to_diagnosis_response(diagnosis)
