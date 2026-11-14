"""Tests del feature `auth`: registro, login, sesión autenticada y roles.

Todo lo de auth vive en este archivo, dentro de la carpeta del feature, para
que los tests de cada feature no se mezclen.

No se necesita Postgres: `FakeSession` sustituye la sesión (solo commit/rollback)
y los tests de service/router reemplazan la capa `repository` con `monkeypatch`.

Contrato vigente del registro: `email`, `password` y `full_name`.
`role`, `specialty` y `license_number` NO se aceptan desde el cliente
(`extra="forbid"`); el rol lo pone la base de datos (`farmer` por defecto).
"""

import hashlib
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from pydantic import ValidationError

from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, UnauthorizedError
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.features.auth import repository, service
from app.features.auth.dependency import require_roles
from app.features.auth.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    User,
)

# Rutas actuales de `router.py`. El contrato de `docs/openapi.yaml` propone
# `/auth/register`, `/auth/login` y `/users/me`; si se alinean, se cambian aquí.
API = "/api/v1"
REGISTER_URL = f"{API}/register"
LOGIN_URL = f"{API}/login"
ME_URL = f"{API}/me"

REGISTER_BODY = {
    "email": "farmer@example.com",
    "password": "Secreta123",
    "full_name": "Agricultor Demo",
}
LOGIN_BODY = {"email": "farmer@example.com", "password": "Secreta123"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _register_payload(**overrides: object) -> RegisterRequest:
    return RegisterRequest(**{**REGISTER_BODY, **overrides})


def _login_payload(**overrides: object) -> LoginRequest:
    return LoginRequest(**{**LOGIN_BODY, **overrides})


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


@pytest.fixture
def sessions(monkeypatch):
    """Captura las sesiones (refresh tokens) que el service intenta registrar."""
    recorded: list[dict] = []

    def _add_refresh_token(db, *, user, token_hash, expires_at):
        recorded.append({"user": user, "token_hash": token_hash, "expires_at": expires_at})

    monkeypatch.setattr(repository, "add_refresh_token", _add_refresh_token)
    return recorded


# ---------------------------------------------------------------------------
# Schemas: lo que el cliente puede enviar y lo que recibe
# ---------------------------------------------------------------------------


def test_register_normalizes_email_to_lowercase_and_trimmed() -> None:
    payload = _register_payload(email="  Juan.Perez@Example.COM ")

    assert payload.email == "juan.perez@example.com"


def test_register_trims_full_name() -> None:
    assert _register_payload(full_name="  Juan Pérez  ").full_name == "Juan Pérez"


def test_register_rejects_invalid_email() -> None:
    with pytest.raises(ValidationError):
        _register_payload(email="no-es-un-correo")


@pytest.mark.parametrize("password", ["Ab1", "A" * 129])
def test_register_password_length_is_bounded(password: str) -> None:
    with pytest.raises(ValidationError):
        _register_payload(password=password)


@pytest.mark.parametrize(
    ("password", "fragment"),
    [
        ("secreta123", "mayúscula"),
        ("SECRETA123", "minúscula"),
        ("SecretaSinNumeros", "número"),
    ],
)
def test_register_password_policy_reports_each_missing_rule(password: str, fragment: str) -> None:
    with pytest.raises(ValidationError) as exc_info:
        _register_payload(password=password)

    assert fragment in str(exc_info.value)


def test_register_accepts_valid_password() -> None:
    assert _register_payload(password="OtraClave9").password == "OtraClave9"


@pytest.mark.parametrize(
    "extra",
    [
        {"role": "agronomist"},
        {"specialty": "Fitopatología"},
        {"license_number": "AGR-123"},
        {"is_admin": True},
    ],
)
def test_register_rejects_fields_outside_the_contract(extra: dict) -> None:
    """El cliente no elige rol ni datos de perfil al registrarse."""
    with pytest.raises(ValidationError):
        _register_payload(**extra)


def test_login_normalizes_email_but_not_password_policy() -> None:
    payload = _login_payload(email=" USER@Example.com ", password="x")

    assert payload.email == "user@example.com"
    assert payload.password == "x"


def test_login_rejects_empty_password() -> None:
    with pytest.raises(ValidationError):
        _login_payload(password="")


def test_auth_response_token_type_defaults_to_bearer(make_user) -> None:
    response = AuthResponse(
        access_token="access",
        refresh_token="refresh",
        user=User.model_validate(make_user()),
    )

    assert response.token_type == "Bearer"


def test_public_user_never_exposes_password_hash(make_user) -> None:
    user = make_user()

    dumped = User.model_validate(user).model_dump()
    schema_properties = User.model_json_schema()["properties"]

    assert "password_hash" not in dumped
    assert "password_hash" not in schema_properties
    assert dumped["email"] == user.email


# ---------------------------------------------------------------------------
# Seguridad: contraseñas y JWT
# ---------------------------------------------------------------------------


def test_hash_password_does_not_return_plaintext() -> None:
    hashed = hash_password("Secreta123")

    assert hashed != "Secreta123"
    assert "Secreta123" not in hashed


def test_hash_password_is_salted() -> None:
    assert hash_password("Secreta123") != hash_password("Secreta123")


def test_verify_password_accepts_correct_and_rejects_wrong() -> None:
    hashed = hash_password("Secreta123")

    assert verify_password("Secreta123", hashed) is True
    assert verify_password("Secreta124", hashed) is False


def test_access_token_contains_subject_role_and_type() -> None:
    payload = decode_token(create_access_token("user-id", role="farmer"))

    assert payload["sub"] == "user-id"
    assert payload["role"] == "farmer"
    assert payload["type"] == "access"


def test_access_token_without_role_omits_claim() -> None:
    assert "role" not in decode_token(create_access_token("user-id"))


def test_access_token_uses_configured_expiration() -> None:
    before = datetime.now(UTC)

    payload = decode_token(create_access_token("user-id"))

    expires_at = datetime.fromtimestamp(payload["exp"], UTC)
    expected = before + timedelta(minutes=settings.access_token_expire_minutes)
    assert abs((expires_at - expected).total_seconds()) < 5


def test_expired_token_cannot_be_decoded() -> None:
    token = create_access_token("user-id", expires_delta=timedelta(seconds=-1))

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_token(token)


def test_token_signed_with_another_secret_is_rejected() -> None:
    token = jwt.encode(
        {"sub": "user-id", "exp": datetime.now(UTC) + timedelta(minutes=5)},
        "otro-secreto",
        algorithm=settings.jwt_algorithm,
    )

    with pytest.raises(jwt.InvalidSignatureError):
        decode_token(token)


def test_tampered_token_is_rejected() -> None:
    token = create_access_token("user-id")
    header, payload, signature = token.split(".")
    tampered = ".".join([header, payload, f"{signature[:-2]}xx"])

    with pytest.raises(jwt.PyJWTError):
        decode_token(tampered)


# ---------------------------------------------------------------------------
# Service: casos de uso (repository reemplazado)
# ---------------------------------------------------------------------------


def test_hash_refresh_token_is_deterministic_sha256() -> None:
    token = "token-opaco"

    digest = service._hash_refresh_token(token)

    assert digest == hashlib.sha256(token.encode("utf-8")).hexdigest()
    assert digest == service._hash_refresh_token(token)
    assert len(digest) == 64


def test_register_creates_user_without_role_and_commits_once(
    monkeypatch, fake_db, make_user, sessions
) -> None:
    created_user = make_user(email="farmer@example.com", role="farmer")
    create_calls: dict = {}

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: None)

    def _create_user(db, **kwargs):
        create_calls.update(kwargs)
        return created_user

    monkeypatch.setattr(repository, "create_user", _create_user)

    response = service.register(fake_db, _register_payload())

    # El cliente solo aporta estos tres campos; el rol lo pone la base.
    assert set(create_calls) == {"email", "password_hash", "full_name"}
    assert create_calls["email"] == "farmer@example.com"
    assert verify_password("Secreta123", create_calls["password_hash"])
    assert fake_db.commits == 1

    token_payload = decode_token(response.access_token)
    assert token_payload["sub"] == str(created_user.id)
    assert token_payload["role"] == "farmer"
    assert token_payload["type"] == "access"

    assert response.refresh_token != sessions[0]["token_hash"]
    assert (
        sessions[0]["token_hash"]
        == hashlib.sha256(response.refresh_token.encode("utf-8")).hexdigest()
    )
    assert sessions[0]["user"] is created_user

    expected_expiry = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    assert abs((sessions[0]["expires_at"] - expected_expiry).total_seconds()) < 60

    assert response.user.role == "farmer"
    assert response.token_type == "Bearer"


def test_register_existing_email_conflicts_without_hashing(
    monkeypatch, fake_db, make_user, sessions
) -> None:
    existing = make_user(email="farmer@example.com")

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: existing)

    def _fail(*args, **kwargs):
        raise AssertionError("no debería hashear ni insertar si el correo ya existe")

    monkeypatch.setattr(service, "hash_password", _fail)
    monkeypatch.setattr(repository, "create_user", _fail)

    with pytest.raises(ConflictError, match="ya está registrado"):
        service.register(fake_db, _register_payload())

    assert fake_db.commits == 0
    assert sessions == []


def test_register_does_not_commit_when_repository_fails(monkeypatch, fake_db, sessions) -> None:
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: None)

    def _conflict(db, **kwargs):
        # Así llega la carrera de dos registros simultáneos desde repository.
        raise ConflictError("El correo ya está registrado.")

    monkeypatch.setattr(repository, "create_user", _conflict)

    with pytest.raises(ConflictError):
        service.register(fake_db, _register_payload())

    assert fake_db.commits == 0
    assert sessions == []


def test_login_issues_new_session_and_commits(monkeypatch, fake_db, make_user, sessions) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123")

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)

    response = service.login(fake_db, _login_payload())

    assert fake_db.commits == 1
    assert len(sessions) == 1
    assert sessions[0]["user"] is user
    assert decode_token(response.access_token)["sub"] == str(user.id)
    assert response.user.id == user.id


def test_login_with_wrong_password_is_unauthorized(
    monkeypatch, fake_db, make_user, sessions
) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123")

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)

    with pytest.raises(UnauthorizedError, match="Credenciales inválidas"):
        service.login(fake_db, _login_payload(password="OtraClave9"))

    assert fake_db.commits == 0
    assert sessions == []


def test_login_with_unknown_email_verifies_dummy_hash(monkeypatch, fake_db, sessions) -> None:
    """No debe filtrarse qué correos existen y el tiempo debe ser similar."""
    verify_calls: list[tuple[str, str]] = []

    def _verify(password: str, password_hash: str) -> bool:
        verify_calls.append((password, password_hash))
        return False

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: None)
    monkeypatch.setattr(service, "verify_password", _verify)

    with pytest.raises(UnauthorizedError, match="Credenciales inválidas"):
        service.login(fake_db, _login_payload(email="nadie@example.com"))

    assert verify_calls == [("Secreta123", service._DUMMY_PASSWORD_HASH)]
    assert fake_db.commits == 0
    assert sessions == []


def test_login_inactive_user_is_forbidden(monkeypatch, fake_db, make_user, sessions) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123", is_active=False)

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)

    with pytest.raises(ForbiddenError, match="desactivada"):
        service.login(fake_db, _login_payload())

    assert fake_db.commits == 0
    assert sessions == []


def test_two_logins_produce_different_refresh_tokens(
    monkeypatch, fake_db, make_user, sessions
) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123")
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)

    first = service.login(fake_db, _login_payload())
    second = service.login(fake_db, _login_payload())

    assert first.refresh_token != second.refresh_token
    assert sessions[0]["token_hash"] != sessions[1]["token_hash"]


def test_dummy_hash_is_verifiable_and_rejects_any_password() -> None:
    assert verify_password("cualquier-cosa", service._DUMMY_PASSWORD_HASH) is False


# ---------------------------------------------------------------------------
# Router: contrato HTTP
# ---------------------------------------------------------------------------


def test_register_returns_201_and_public_user(client, fake_db, monkeypatch, make_user) -> None:
    user = make_user(email="farmer@example.com", role="farmer")
    _patch_register(monkeypatch, user)

    response = client.post(REGISTER_URL, json=REGISTER_BODY)

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "Bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["user"]["email"] == "farmer@example.com"
    assert body["user"]["role"] == "farmer"
    assert "password_hash" not in body["user"]
    assert fake_db.commits == 1


@pytest.mark.parametrize(
    "extra",
    [
        {"role": "farmer"},
        {"role": "agronomist"},
        {"specialty": "Fitopatología"},
        {"license_number": "AGR-123"},
    ],
)
def test_register_returns_400_for_fields_outside_the_contract(client, extra: dict) -> None:
    response = client.post(REGISTER_URL, json={**REGISTER_BODY, **extra})

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "validation_error"
    assert body["field"] in extra


def test_register_duplicate_email_returns_409(client, monkeypatch, make_user) -> None:
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: make_user(email=email))

    response = client.post(REGISTER_URL, json=REGISTER_BODY)

    assert response.status_code == 409
    assert response.json() == {
        "error": {"code": "conflict", "message": "El correo ya está registrado."}
    }


def test_register_invalid_email_returns_400(client) -> None:
    response = client.post(REGISTER_URL, json={**REGISTER_BODY, "email": "no-es-correo"})

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "validation_error"
    assert body["field"] == "email"


def test_register_weak_password_returns_400_with_field(client) -> None:
    response = client.post(REGISTER_URL, json={**REGISTER_BODY, "password": "secreta123"})

    assert response.status_code == 400
    body = response.json()
    assert body["error"] == "validation_error"
    assert body["field"] == "password"
    assert "mayúscula" in body["message"]


def test_login_returns_tokens(client, fake_db, monkeypatch, make_user) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123")
    _patch_login(monkeypatch, user)

    response = client.post(LOGIN_URL, json=LOGIN_BODY)

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
    unknown = client.post(LOGIN_URL, json=LOGIN_BODY)

    user = make_user(email="farmer@example.com", password="Secreta123")
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)
    wrong_password = client.post(LOGIN_URL, json={**LOGIN_BODY, "password": "OtraClave9"})

    assert unknown.status_code == wrong_password.status_code == 401
    assert (
        unknown.json()
        == wrong_password.json()
        == {"error": {"code": "unauthorized", "message": "Credenciales inválidas"}}
    )


def test_login_inactive_user_returns_403(client, monkeypatch, make_user) -> None:
    user = make_user(email="farmer@example.com", password="Secreta123", is_active=False)
    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: user)

    response = client.post(LOGIN_URL, json=LOGIN_BODY)

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "forbidden"


def test_login_empty_password_returns_400(client) -> None:
    response = client.post(LOGIN_URL, json={**LOGIN_BODY, "password": ""})

    assert response.status_code == 400
    assert response.json()["field"] == "password"


def test_me_requires_bearer_token(client) -> None:
    response = client.get(ME_URL)

    assert response.status_code == 401
    assert response.json() == {"error": {"code": "unauthorized", "message": "No autenticado"}}


@pytest.mark.parametrize("token", ["esto-no-es-un-jwt", "aaa.bbb.ccc"])
def test_me_rejects_malformed_tokens_with_401(client, token: str) -> None:
    response = client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_me_rejects_expired_token(client, make_user) -> None:
    user = make_user()
    token = create_access_token(str(user.id), expires_delta=timedelta(minutes=-1))

    response = client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_token_signed_with_another_secret(client, make_user) -> None:
    user = make_user()
    token = jwt.encode(
        {"sub": str(user.id), "exp": datetime.now(UTC) + timedelta(minutes=5)},
        "otro-secreto",
        algorithm=settings.jwt_algorithm,
    )

    response = client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_token_without_sub(client) -> None:
    token = jwt.encode(
        {"exp": datetime.now(UTC) + timedelta(minutes=5)},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    response = client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_sub_that_is_not_a_uuid(client) -> None:
    token = create_access_token("no-es-un-uuid")

    response = client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401


def test_me_rejects_unknown_user(client, make_user, monkeypatch) -> None:
    user = make_user()
    monkeypatch.setattr(repository, "get_user_by_id", lambda db, user_id: None)

    response = client.get(ME_URL, headers=_bearer(create_access_token(str(user.id))))

    assert response.status_code == 401


def test_me_rejects_inactive_user(client, make_user, monkeypatch) -> None:
    user = make_user(is_active=False)
    _patch_current_user(monkeypatch, user)

    response = client.get(ME_URL, headers=_bearer(create_access_token(str(user.id))))

    assert response.status_code == 401


def test_me_returns_authenticated_user(client, make_user, monkeypatch) -> None:
    user = make_user(email="farmer@example.com", role="farmer")
    _patch_current_user(monkeypatch, user)

    response = client.get(
        ME_URL, headers=_bearer(create_access_token(str(user.id), role=user.role))
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
    requested_ids: list = []

    def _get_user_by_id(db, user_id):
        requested_ids.append(user_id)
        return user

    monkeypatch.setattr(repository, "get_user_by_id", _get_user_by_id)

    client.get(ME_URL, headers=_bearer(create_access_token(str(user.id))))

    assert requested_ids == [user.id]


# ---------------------------------------------------------------------------
# Autorización por roles
# ---------------------------------------------------------------------------


def test_require_roles_allows_matching_role(make_user) -> None:
    admin = make_user(role="admin")
    dependency = require_roles("admin", "agronomist")

    assert dependency(current_user=admin) is admin


def test_require_roles_rejects_other_role(make_user) -> None:
    farmer = make_user(role="farmer")

    with pytest.raises(ForbiddenError, match="permisos"):
        require_roles("admin")(current_user=farmer)
