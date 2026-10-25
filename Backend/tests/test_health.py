import pytest

MODULE_ENDPOINTS = (
    ("auth", "/api/v1/auth/health"),
    ("crops", "/api/v1/crops/health"),
    ("detection", "/api/v1/detection/health"),
    ("diagnosis", "/api/v1/diagnoses/health"),
    ("consultations", "/api/v1/consultations/health"),
)


def test_global_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "agrodoc-api", "version": "2.0.0"}


@pytest.mark.parametrize(("module", "path"), MODULE_ENDPOINTS)
def test_module_health(client, module, path):
    response = client.get(path)

    assert response.status_code == 200
    assert response.json() == {"module": module, "status": "ok"}


def test_openapi_lists_every_module(client):
    paths = client.get("/api/v1/openapi.json").json()["paths"]

    for _, path in MODULE_ENDPOINTS:
        assert path in paths
