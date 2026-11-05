"""Contrato HTTP del slice auth (`router.py` + `dependency.py`).

TestClient con la dependencia `get_db` sustituida por `FakeSession`; la capa
`repository` se reemplaza por dobles, así que no hace falta Postgres.
"""

import uuid
from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.core.config import settings
from app.core.exceptions import ForbiddenError
from app.core.security import create_access_token
from app.features.auth import repository
from app.features.auth.dependency import require_roles

API = "/api/v1"

REGISTER_BODY = {
    "email": "farmer@example.com",
    "password": "Secreta123",
    "full_name": "Agricultor Demo",
    "role": "farmer",
}


def _bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _patch_register(monkeypatch, user) -> None:
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: None)
    monkeypatch.setattr(repository, "create_user", lambda db, **kwargs: user)
    monkeypatch.setattr(repository, "add_refresh_token", lambda db, **kwargs: None)


def _patch_login(monkeypatch, user) -> None:
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)
    monkeypatch.setattr(repository, "add_refresh_token", lambda db, **kwargs: None)


def _patch_current_user(monkeypatch, user) -> None:
    monkeypatch.setattr(repository, "get_user_by_id", lambda db, user_id: user)


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------


def test_register_returns_201_and_public_user(client, fake_db, monkeypatch, make_user) -> None:
    user = make_user(email="farmer@example.com")
    _patch_register(monkeypatch, user)

    response = client.post(f"{API}/auth/register", json=REGISTER_BODY)

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "Bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["user"]["email"] == "farmer@example.com"
    assert body["user"]["role"] == "farmer"
    assert "password_hash" not in body["user"]
    assert fake_db.commits == 1


def test_register_duplicate_email_returns_409(client, monkeypatch, make_user) -> None:
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: make_user(email=email))

    response = client.post(f"{API}/auth/register", json=REGISTER_BODY)

    assert response.status_code == 409
    assert response.json() == {
        "error": {"code": "conflict", "message": "El correo ya está registrado."}
    }


def test_register_invalid_email_returns_400(client) -> None:
    response = client.post(f"{API}/auth/register", json={**REGISTER_BODY, "email": "no-es-correo"})

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "validation_error"
    assert body["field"] == "email"


def test_register_weak_password_returns_400_with_field(client) -> None:
    response = client.post(
        f"{API}/auth/register",
        json={**REGISTER_BODY, "password": "secreta123"},
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "validation_error"
    assert body["field"] == "password"
    assert "mayúscula" in body["message"]


def test_register_admin_role_returns_400(client) -> None:
    response = client.post(f"{API}/auth/register", json={**REGISTER_BODY, "role": "admin"})

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "validation_error"
    assert body["field"] == "role"


def test_register_extra_field_returns_400(client) -> None:
    response = client.post(f"{API}/auth/register", json={**REGISTER_BODY, "is_admin": True})

    assert response.status_code == 400
    assert response.json()["field"] == "is_admin"


def test_register_specialty_for_farmer_returns_400(client) -> None:
    response = client.post(
        f"{API}/auth/register",
        json={**REGISTER_BODY, "specialty": "Fitopatología"},
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "validation_error"
    assert "solo aplican al rol 'agronomist'" in body["message"]


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------


def test_login_returns_tokens(client, fake_db, monkeypatch, make_user) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123")
    _patch_login(monkeypatch, user)

    response = client.post(
        f"{API}/auth/login",
        json={"email": "farmer@example.com", "password": "Secreta123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["id"] == str(user.id)
    assert body["access_token"]
    assert body["refresh_token"]
    assert fake_db.commits == 1


def test_login_unknown_email_and_wrong_password_look_the_same(
    client, monkeypatch, make_user
) -> None:
    """El cliente no debe poder distinguir si el correo existe."""
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: None)
    unknown = client.post(
        f"{API}/auth/login",
        json={"email": "nadie@example.com", "password": "Secreta123"},
    )

    user = make_user(email="farmer@example.com", password="Secreta123")
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)
    wrong_password = client.post(
        f"{API}/auth/login",
        json={"email": "farmer@example.com", "password": "OtraClave9"},
    )

    assert unknown.status_code == wrong_password.status_code == 401
    assert (
        unknown.json()
        == wrong_password.json()
        == {"error": {"code": "unauthorized", "message": "Credenciales inválidas"}}
    )


def test_login_inactive_user_returns_403(client, monkeypatch, make_user) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123", is_active=False)
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)

    response = client.post(
        f"{API}/auth/login",
        json={"email": "farmer@example.com", "password": "Secreta123"},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "forbidden"


def test_login_empty_password_returns_400(client) -> None:
    response = client.post(
        f"{API}/auth/login",
        json={"email": "farmer@example.com", "password": ""},
    )

    assert response.status_code == 400
    assert response.json()["field"] == "password"


# ---------------------------------------------------------------------------
# GET /users/me
# ---------------------------------------------------------------------------


def test_me_requires_bearer_token(client) -> None:
    response = client.get(f"{API}/users/me")

    assert response.status_code == 401
    assert response.json() == {"error": {"code": "unauthorized", "message": "No autenticado"}}


@pytest.mark.parametrize(
    "token",
    [
        "esto-no-es-un-jwt",
        "aaa.bbb.ccc",
    ],
)
def test_me_rejects_malformed_tokens_with_401(client, token: str) -> None:
    response = client.get(f"{API}/users/me", headers=_bearer(token))

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_me_rejects_expired_token(client, make_user) -> None:
    user = make_user()
    token = create_access_token(str(user.id), expires_delta=timedelta(minutes=-1))

    response = client.get(f"{API}/users/me", headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_token_signed_with_another_secret(client, make_user) -> None:
    user = make_user()
    token = jwt.encode(
        {"sub": str(user.id), "exp": datetime.now(UTC) + timedelta(minutes=5)},
        "otro-secreto",
        algorithm=settings.jwt_algorithm,
    )

    response = client.get(f"{API}/users/me", headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_token_without_sub(client, make_user) -> None:
    token = jwt.encode(
        {"exp": datetime.now(UTC) + timedelta(minutes=5)},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    response = client.get(f"{API}/users/me", headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_sub_that_is_not_a_uuid(client) -> None:
    token = create_access_token("no-es-un-uuid")

    response = client.get(f"{API}/users/me", headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_unknown_user(client, make_user, monkeypatch) -> None:
    user = make_user()
    monkeypatch.setattr(repository, "get_user_by_id", lambda db, user_id: None)

    response = client.get(f"{API}/users/me", headers=_bearer(create_access_token(str(user.id))))

    assert response.status_code == 401


def test_me_rejects_inactive_user(client, make_user, monkeypatch) -> None:
    user = make_user(is_active=False)
    _patch_current_user(monkeypatch, user)

    response = client.get(f"{API}/users/me", headers=_bearer(create_access_token(str(user.id))))

    assert response.status_code == 401


def test_me_returns_authenticated_user(client, make_user, monkeypatch) -> None:
    user = make_user(email="farmer@example.com", role="farmer")
    _patch_current_user(monkeypatch, user)

    response = client.get(
        f"{API}/users/me", headers=_bearer(create_access_token(str(user.id), role=user.role))
    )

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "id": str(user.id),
        "email": "farmer@example.com",
        "full_name": user.full_name,
        "role": "farmer",
        "is_active": True,
        "created_at": body["created_at"],
    }
    assert "password_hash" not in body


def test_me_looks_up_the_user_from_the_token_subject(client, make_user, monkeypatch) -> None:
    user = make_user()
    requested_ids: list[uuid.UUID] = []

    def _get_user_by_id(db, user_id):
        requested_ids.append(user_id)
        return user

    monkeypatch.setattr(repository, "get_user_by_id", _get_user_by_id)

    client.get(f"{API}/users/me", headers=_bearer(create_access_token(str(user.id))))

    assert requested_ids == [user.id]


# ---------------------------------------------------------------------------
# Contrato y autorización por roles
# ---------------------------------------------------------------------------


def test_routes_match_the_documented_contract(client) -> None:
    paths = client.get(f"{API}/openapi.json").json()["paths"]

    assert f"{API}/auth/register" in paths
    assert f"{API}/auth/login" in paths
    assert f"{API}/users/me" in paths


def test_require_roles_allows_matching_role(make_user) -> None:
    admin = make_user(role="admin")
    dependency = require_roles("admin", "agronomist")

    assert dependency(current_user=admin) is admin


def test_require_roles_rejects_other_role(make_user) -> None:
    farmer = make_user(role="farmer")

    with pytest.raises(ForbiddenError, match="permisos"):
        require_roles("admin")(current_user=farmer)
