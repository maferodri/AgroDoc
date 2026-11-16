"""Tests del slice `detection`.

No requieren ONNX ni Postgres: se reemplazan `_config`, `_session` y
`_preprocess` por dobles para verificar el porcentaje redondeado y su
serialización en el endpoint.
"""

import numpy as np
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.features.detection import service
from app.features.detection.router import router

LABELS = ["hoja_sana", "cafe_roya", "mancha_foliar"]
# Probabilidades que suman 1.0; la clase ganadora es `cafe_roya` con 0.8734.
PROBABILITIES = [0.05, 0.8734, 0.0766]


class FakeInput:
    name = "imagen"


class FakeSession:
    """Sesión ONNX falsa que siempre devuelve las mismas probabilidades."""

    def get_inputs(self) -> list[FakeInput]:
        return [FakeInput()]

    def run(self, output_names, feed_dict) -> list[np.ndarray]:
        return [np.asarray([PROBABILITIES], dtype=np.float32)]


@pytest.fixture
def client():
    """App mínima con solo este slice: el test no depende del resto del monolito."""
    api = FastAPI()
    api.include_router(router, prefix="/api/v1")
    with TestClient(api) as test_client:
        yield test_client


@pytest.fixture
def fake_model(monkeypatch):
    """Sustituye la carga del modelo por un doble determinista."""
    config = {
        "labels": LABELS,
        "input_size": (224, 224),
        "mean": np.zeros(3, dtype=np.float32),
        "std": np.ones(3, dtype=np.float32),
        "output_type": "probabilities",
        "resize_mode": "resize",
        "resize_size": 224,
        "version": "v1.0.0",
    }
    monkeypatch.setattr(service, "_config", lambda: config)
    monkeypatch.setattr(service, "_session", lambda: FakeSession())
    monkeypatch.setattr(service, "_preprocess", lambda image_bytes: np.zeros((1, 3, 224, 224)))
    return config


@pytest.mark.parametrize(
    ("confidence", "expected"),
    [
        (0.8734, 87),
        (0.005, 0),
        (0.999, 100),
        (0.0, 0),
        (1.0, 100),
        # Ruido de coma flotante fuera de [0, 1]: se acota antes de redondear.
        (-0.2, 0),
        (1.0000001, 100),
    ],
)
def test_confidence_percent_rounds_to_integer(confidence, expected):
    assert service._confidence_percent(confidence) == expected


def test_predict_includes_rounded_percentage(fake_model):
    prediction = service.predict(b"imagen")

    assert prediction.label == "cafe_roya"
    assert prediction.confidence == pytest.approx(0.8734, rel=1e-4)
    assert prediction.confidence_percent == 87


def test_predict_endpoint_returns_name_and_percentage(fake_model, client):
    response = client.post(
        "/api/v1/detection/predict",
        files={"file": ("hoja.jpg", b"imagen", "image/jpeg")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["label"] == "cafe_roya"
    assert body["confidence_percent"] == 87
    assert isinstance(body["confidence_percent"], int)
