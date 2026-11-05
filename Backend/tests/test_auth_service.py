"""Casos de uso del slice auth (`service.py`).

Se sustituye la capa `repository` (la única que habla SQL) por dobles, así que
estos tests verifican la lógica de negocio: hashing, emisión de tokens,
transacciones y traducción de errores.
"""

import hashlib
from datetime import UTC, datetime, timedelta

import pytest

from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, UnauthorizedError
from app.core.security import decode_token, verify_password
from app.features.auth import repository, service
from app.features.auth.schemas import LoginRequest, RegisterRequest

REGISTER_DATA = {
    "email": "farmer@example.com",
    "password": "Secreta123",
    "full_name": "Agricultor Demo",
    "role": "farmer",
}


def _register_payload(**overrides: object) -> RegisterRequest:
    return RegisterRequest(**{**REGISTER_DATA, **overrides})


def _login_payload(**overrides: object) -> LoginRequest:
    return LoginRequest(**{"email": "farmer@example.com", "password": "Secreta123", **overrides})


@pytest.fixture
def sessions(monkeypatch):
    """Captura las sesiones (refresh tokens) que el service intenta registrar."""
    recorded: list[dict] = []

    def _add_refresh_token(db, *, user, token_hash, expires_at):
        recorded.append({"user": user, "token_hash": token_hash, "expires_at": expires_at})

    monkeypatch.setattr(repository, "add_refresh_token", _add_refresh_token)
    return recorded


def test_hash_refresh_token_is_deterministic_sha256() -> None:
    token = "token-opaco"

    digest = service._hash_refresh_token(token)

    assert digest == hashlib.sha256(token.encode("utf-8")).hexdigest()
    assert digest == service._hash_refresh_token(token)
    assert len(digest) == 64


def test_register_creates_user_issues_tokens_and_commits_once(
    monkeypatch, fake_db, make_user, sessions
) -> None:
    created_user = make_user(email="farmer@example.com")
    create_calls: dict = {}

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: None)

    def _create_user(db, **kwargs):
        create_calls.update(kwargs)
        return created_user

    monkeypatch.setattr(repository, "create_user", _create_user)

    response = service.register(fake_db, _register_payload())

    # El correo se busca antes de crear y la transacción se cierra una sola vez.
    assert create_calls["email"] == "farmer@example.com"
    assert fake_db.commits == 1

    # Se guarda un hash, nunca la contraseña en claro.
    stored_hash = create_calls["password_hash"]
    assert stored_hash != "Secreta123"
    assert verify_password("Secreta123", stored_hash)

    # Access token: JWT con el id del usuario como `sub`.
    payload = decode_token(response.access_token)
    assert payload["sub"] == str(created_user.id)
    assert payload["role"] == "farmer"
    assert payload["type"] == "access"

    # Refresh token: opaco para el cliente, hasheado en la BD.
    assert response.refresh_token != sessions[0]["token_hash"]
    assert (
        sessions[0]["token_hash"]
        == hashlib.sha256(response.refresh_token.encode("utf-8")).hexdigest()
    )
    assert sessions[0]["user"] is created_user

    # La sesión caduca según la configuración.
    expected_expiry = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    assert abs((sessions[0]["expires_at"] - expected_expiry).total_seconds()) < 60

    assert response.user.email == "farmer@example.com"
    assert response.token_type == "Bearer"


def test_register_forwards_agronomist_profile_fields(
    monkeypatch, fake_db, make_user, sessions
) -> None:
    created_user = make_user(email="agro@example.com", role="agronomist")
    create_calls: dict = {}

    monkeypatch.setattr(repository, "get_user_by_email", lambda db, email: None)

    def _create_user(db, **kwargs):
        create_calls.update(kwargs)
        return created_user

    monkeypatch.setattr(repository, "create_user", _create_user)

    service.register(
        fake_db,
        _register_payload(
            email="agro@example.com",
            role="agronomist",
            specialty="Fitopatología",
            license_number="AGR-123",
        ),
    )

    assert create_calls["role"] == "agronomist"
    assert create_calls["specialty"] == "Fitopatología"
    assert create_calls["license_number"] == "AGR-123"


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
    """No debe filtrarse qué correos existen, y el tiempo de respuesta debe ser similar."""
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


def test_dummy_hash_is_a_valid_argon2_hash() -> None:
    """El hash señuelo debe poder verificarse para no revelar cuentas inexistentes."""
    assert verify_password("cualquier-cosa", service._DUMMY_PASSWORD_HASH) is False
