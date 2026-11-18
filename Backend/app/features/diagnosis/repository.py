"""Acceso a datos del módulo diagnosis.

Único archivo del slice que escribe SQL. No decide reglas de negocio, no lanza
errores HTTP y no conoce los schemas: recibe valores y devuelve objetos.

Contrato con el `service`:
- Buscar y no encontrar devuelve `None`, no una excepción: decidir qué
  responder es trabajo del service.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.features.diagnosis.models import Diagnosis, Pest


def get_diagnosis_for_user(
    db: Session,
    *,
    diagnosis_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Diagnosis | None:
    """Diagnóstico del usuario, con su plaga y tratamientos precargados.

    Se filtra por `user_id` para que cada usuario solo vea sus propios
    diagnósticos. `selectinload` evita consultas N+1 al leer los tratamientos.
    Devuelve `None` si no existe o no pertenece al usuario.
    """
    return db.scalar(
        select(Diagnosis)
        .options(selectinload(Diagnosis.pest).selectinload(Pest.treatments))
        .where(Diagnosis.id == diagnosis_id, Diagnosis.user_id == user_id)
    )


def get_diagnosis_by_id(db: Session, *, diagnosis_id: uuid.UUID) -> Diagnosis | None:
    """Diagnóstico por id, sin filtro de dueño.

    # TODO(pruebas): eliminar cuando se restaure la autenticación del endpoint.
    """
    return db.scalar(
        select(Diagnosis)
        .options(selectinload(Diagnosis.pest).selectinload(Pest.treatments))
        .where(Diagnosis.id == diagnosis_id)
    )
