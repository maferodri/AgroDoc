"""Tests del slice `diagnosis`.

No requieren Postgres: se sustituyen `repository`, `get_current_user` y `get_db`
por dobles para verificar el orden por prioridad de los tratamientos y la
respuesta del endpoint `GET /diagnoses/{id}`.
"""

import uuid
from datetime import UTC, datetime
from decimal import Decimal
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.features.diagnosis import service
from app.features.diagnosis.models import Treatment
from app.features.diagnosis.router import router
from app.features.diagnosis.schemas import DiagnosisResponse, TreatmentResponse


def make_treatment(priority: str, title: str) -> Treatment:
    """Objeto ORM de tratamiento sin persistir (sin pest_id: no se usa en estos tests)."""
    return Treatment(
        id=uuid.uuid4(),
        pest_id=1,
        treatment_type="Químico",
        title=title,
        description=None,
        recommendation=f"Recomendación de {title}",
        dose="2 g por litro de agua",
        priority=priority,
    )


def fake_diagnosis() -> SimpleNamespace:
    """Diagnóstico en memoria con plaga y tratamientos desordenados a propósito."""
    pest = SimpleNamespace(
        treatments=[
            make_treatment("baja", "Zeta"),
            make_treatment("media", "Alfa"),
            make_treatment("alta", "Alfa"),
            make_treatment("alta", "Beta"),
        ]
    )
    return SimpleNamespace(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        crop_id=None,
        image_path="/img.jpg",
        model_version="v1.0.0",
        predicted_label="cafe_roya",
        pest_id=1,
        confidence=Decimal("0.8734"),
        threshold_used=Decimal("0.70"),
        low_confidence=False,
        top_k=None,
        consultation_id=None,
        created_at=datetime.now(UTC),
        pest=pest,
    )


def test_sorted_treatments_by_priority_then_title():
    treatments = [
        make_treatment("baja", "Zeta"),
        make_treatment("media", "Alfa"),
        make_treatment("alta", "Alfa"),
        make_treatment("alta", "Beta"),
    ]

    ordered = service._sorted_treatments(treatments)

    assert [(t.priority, t.title) for t in ordered] == [
        ("alta", "Alfa"),
        ("alta", "Beta"),
        ("media", "Alfa"),
        ("baja", "Zeta"),
    ]


def test_get_diagnosis_returns_ordered_treatments(monkeypatch):
    diagnosis = fake_diagnosis()
    monkeypatch.setattr(
        service.repository,
        "get_diagnosis_for_user",
        lambda db, *, diagnosis_id, user_id: diagnosis,
    )

    result = service.get_diagnosis(None, user_id=diagnosis.user_id, diagnosis_id=diagnosis.id)

    assert result.predicted_label == "cafe_roya"
    assert result.confidence == 0.8734
    assert [t.priority for t in result.treatments] == ["alta", "alta", "media", "baja"]
    assert [t.title for t in result.treatments] == ["Alfa", "Beta", "Alfa", "Zeta"]


def test_get_diagnosis_by_id_without_owner(monkeypatch):
    diagnosis = fake_diagnosis()
    monkeypatch.setattr(
        service.repository,
        "get_diagnosis_by_id",
        lambda db, *, diagnosis_id: diagnosis,
    )

    result = service.get_diagnosis_by_id(None, diagnosis_id=diagnosis.id)

    assert result.predicted_label == "cafe_roya"
    assert [t.priority for t in result.treatments] == ["alta", "alta", "media", "baja"]


def test_get_diagnosis_not_found(monkeypatch):
    monkeypatch.setattr(
        service.repository,
        "get_diagnosis_for_user",
        lambda db, *, diagnosis_id, user_id: None,
    )

    with pytest.raises(service.NotFoundError):
        service.get_diagnosis(None, user_id=uuid.uuid4(), diagnosis_id=uuid.uuid4())


@pytest.fixture
def client(monkeypatch):
    api = FastAPI()
    api.include_router(router, prefix="/api/v1")
    api.dependency_overrides[get_db] = lambda: None

    response = DiagnosisResponse(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        crop_id=None,
        image_path="/img.jpg",
        model_version="v1.0.0",
        predicted_label="cafe_roya",
        pest_id=1,
        confidence=0.8734,
        threshold_used=0.70,
        low_confidence=False,
        top_k=None,
        consultation_id=None,
        created_at=datetime.now(UTC),
        treatments=[
            TreatmentResponse(
                id=uuid.uuid4(),
                treatment_type="Químico",
                title="Fungicida cúprico",
                recommendation="Aplique fungicida cúprico preventivo.",
                dose="2 g por litro de agua",
                priority="alta",
            ),
            TreatmentResponse(
                id=uuid.uuid4(),
                treatment_type="Cultural",
                title="Control cultural",
                recommendation="Retire las hojas afectadas.",
                dose=None,
                priority="media",
            ),
        ],
    )
    monkeypatch.setattr(service, "get_diagnosis_by_id", lambda db, *, diagnosis_id: response)

    with TestClient(api) as test_client:
        yield test_client


def test_get_diagnosis_endpoint_returns_treatments(client):
    response = client.get(f"/api/v1/diagnoses/{uuid.uuid4()}")

    assert response.status_code == 200
    body = response.json()
    assert body["predicted_label"] == "cafe_roya"
    assert body["confidence"] == 0.8734
    assert [t["priority"] for t in body["treatments"]] == ["alta", "media"]
    assert body["treatments"][0]["dose"] == "2 g por litro de agua"
