"""Esquemas de salida del módulo diagnosis.

No hay esquemas de entrada todavía: el `POST /diagnoses` (imagen + crop_id) y
el resto de endpoints se implementarán aparte. Aquí solo se define la forma de
la respuesta del detalle de diagnóstico con sus tratamientos ya ordenados.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TreatmentResponse(BaseModel):
    """Tratamiento tal como se expone al frontend."""

    id: UUID
    treatment_type: str
    title: str
    description: str | None = None
    recommendation: str
    dose: str | None = None
    priority: str


class DiagnosisResponse(BaseModel):
    """Detalle de un diagnóstico, incluidos sus tratamientos ordenados por prioridad."""

    id: UUID
    user_id: UUID
    crop_id: UUID | None = None
    image_path: str
    model_version: str
    predicted_label: str
    pest_id: int | None = None
    confidence: float
    threshold_used: float
    low_confidence: bool
    top_k: list[dict] | None = None
    consultation_id: UUID | None = None
    created_at: datetime
    treatments: list[TreatmentResponse]
