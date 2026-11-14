"""Tests del flujo de recuperación de contraseña.

Siguen el patrón del feature: `FakeSession` + `repository` monkeypatcheado, sin
Postgres. El correo se captura con `InMemoryEmailSender`, nunca se llama a
Brevo. El código se obtiene del buzón falso (el API jamás lo devuelve).
"""

import hashlib
import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.core.config import Settings, settings
from app.core.email_service import (
    BrevoEmailSender,
    ConsoleEmailSender,
    EmailSender,
    EmailSendError,
    InMemoryEmailSender,
    build_email_sender,
    get_email_sender,
    render_password_reset_email,
)
from app.core.security import verify_password
from app.features.auth import repository
from app.features.auth.models import PasswordResetCode
from app.main import app

API = "/api/v1"
REQUEST_URL = f"{API}/auth/password-reset/request"
VERIFY_URL = f"{API}/auth/password-reset/verify"
CONFIRM_URL = f"{API}/auth/password-reset/confirm"
LOGIN_URL = f"{API}/auth/login"

NEW_PASSWORD = "NuevaClave9"
OLD_PASSWORD = "Secreta123"


@pytest.fixture
def email_sender():
    """Sustituye el envío real por un buzón en memoria."""
    sender = InMemoryEmailSender()
    app.dependency_overrides[get_email_sender] = lambda: sender
    yield sender
    app.dependency_overrides.pop(get_email_sender, None)


@pytest.fixture
def reset_store(monkeypatch, make_user):
    """Repositorio en memoria con la misma interfaz que `repository`."""
    user = make_user(password=OLD_PASSWORD)
    state = SimpleNamespace(
        user=user,
        codes=[],
        revoked_user_ids=[],
        refresh_tokens=0,
    )

    def get_user_by_email(db, email):
        if state.user is not None and state.user.email == email:
            return state.user
        return None

    def get_user_by_id(db, user_id):
        if state.user is not None and state.user.id == user_id:
            return state.user
        return None

    def create_password_reset_code(db, *, user_id, code_hash, expires_at):
        code = PasswordResetCode(
            id=uuid.uuid4(),
            user_id=user_id,
            code_hash=code_hash,
            expires_at=expires_at,
            attempts=0,
            created_at=datetime.now(UTC),
        )
        state.codes.append(code)
        return code

    def count_password_reset_codes_since(db, *, user_id, since):
        return sum(
            1 for code in state.codes if code.user_id == user_id and code.created_at >= since
        )

    def invalidate_pending_password_reset_codes(db, *, user_id, now):
        for code in state.codes:
            if code.user_id == user_id and code.used_at is None:
                code.used_at = now

    def get_latest_password_reset_code(db, *, user_id):
        for code in reversed(state.codes):
            if code.user_id == user_id:
                return code
        return None

    def get_password_reset_code_by_reset_token_hash(db, *, reset_token_hash):
        for code in state.codes:
            if code.reset_token_hash == reset_token_hash:
                return code
        return None

    def increment_password_reset_attempts(db, *, code, invalidated_at=None):
        code.attempts += 1
        if invalidated_at is not None:
            code.used_at = invalidated_at
        return code

    def mark_password_reset_code_verified(
        db,
        *,
        code,
        reset_token_hash,
        reset_token_expires_at,
        verified_at,
    ):
        code.reset_token_hash = reset_token_hash
        code.reset_token_expires_at = reset_token_expires_at
        code.verified_at = verified_at
        return code

    def mark_password_reset_code_used(db, *, code, used_at):
        code.used_at = used_at
        return code

    def update_user_password(db, *, user, password_hash):
        user.password_hash = password_hash
        return user

    def revoke_all_refresh_tokens(db, *, user_id, revoked_at):
        state.revoked_user_ids.append(user_id)
        return 1

    def add_refresh_token(db, *, user, token_hash, expires_at):
        state.refresh_tokens += 1

    monkeypatch.setattr(repository, "get_user_by_email", get_user_by_email)
    monkeypatch.setattr(repository, "get_user_by_id", get_user_by_id)
    monkeypatch.setattr(repository, "create_password_reset_code", create_password_reset_code)
    monkeypatch.setattr(
        repository,
        "count_password_reset_codes_since",
        count_password_reset_codes_since,
    )
    monkeypatch.setattr(
        repository,
        "invalidate_pending_password_reset_codes",
        invalidate_pending_password_reset_codes,
    )
    monkeypatch.setattr(
        repository,
        "get_latest_password_reset_code",
        get_latest_password_reset_code,
    )
    monkeypatch.setattr(
        repository,
        "get_password_reset_code_by_reset_token_hash",
        get_password_reset_code_by_reset_token_hash,
    )
    monkeypatch.setattr(
        repository,
        "increment_password_reset_attempts",
        increment_password_reset_attempts,
    )
    monkeypatch.setattr(
        repository,
        "mark_password_reset_code_verified",
        mark_password_reset_code_verified,
    )
    monkeypatch.setattr(
        repository,
        "mark_password_reset_code_used",
        mark_password_reset_code_used,
    )
    monkeypatch.setattr(repository, "update_user_password", update_user_password)
    monkeypatch.setattr(repository, "revoke_all_refresh_tokens", revoke_all_refresh_tokens)
    monkeypatch.setattr(repository, "add_refresh_token", add_refresh_token)

    return state


def _request_code(client, email_sender, email: str) -> tuple[dict, str]:
    response = client.post(REQUEST_URL, json={"email": email})
    assert response.status_code == 200
    assert email_sender.last_code is not None
    return response.json(), email_sender.last_code


def _verify(client, email: str, code: str):
    return client.post(VERIFY_URL, json={"email": email, "code": code})


def _wrong_code(code: str) -> str:
    return "000000" if code != "000000" else "000001"


def _verify_ok(client, email: str, code: str) -> str:
    response = _verify(client, email, code)
    assert response.status_code == 200
    return response.json()["reset_token"]


def _confirm(client, token: str, new_password: str = NEW_PASSWORD):
    return client.post(
        CONFIRM_URL,
        json={"reset_token": token, "new_password": new_password},
    )


def _error_code(response) -> str:
    return response.json()["error"]["code"]


# ---------------------------------------------------------------------------
# POST /request
# ---------------------------------------------------------------------------


def test_request_returns_the_same_response_for_existing_and_unknown_email(
    client, email_sender, reset_store
):
    existing, code = _request_code(client, email_sender, reset_store.user.email)

    assert code not in str(existing)

    reset_store.user = None
    unknown = client.post(REQUEST_URL, json={"email": "nadie@example.com"})

    assert unknown.status_code == 200
    assert unknown.json() == existing
    assert len(email_sender.messages) == 1
    assert len(reset_store.codes) == 1


def test_request_stays_generic_when_email_delivery_fails(client, reset_store):
    class FailingEmailSender(EmailSender):
        async def send(
            self,
            *,
            to: str,
            subject: str,
            html_content: str,
            text_content: str,
        ) -> None:
            raise EmailSendError("fallo simulado")

    app.dependency_overrides[get_email_sender] = lambda: FailingEmailSender()

    response = client.post(REQUEST_URL, json={"email": reset_store.user.email})

    assert response.status_code == 200
    assert response.json()["message"] == (
        "Si el correo está registrado, recibirás un código de recuperación."
    )
    assert len(reset_store.codes) == 1


def test_request_rate_limit_is_three_per_window(client, email_sender, reset_store):
    for _ in range(settings.password_reset_max_requests_per_window):
        _request_code(client, email_sender, reset_store.user.email)

    assert len(email_sender.messages) == 3

    blocked = client.post(REQUEST_URL, json={"email": reset_store.user.email})

    assert blocked.status_code == 200
    assert len(email_sender.messages) == 3
    assert len(reset_store.codes) == 3
    assert reset_store.codes[0].used_at is not None
    assert reset_store.codes[1].used_at is not None
    assert reset_store.codes[2].used_at is None


# ---------------------------------------------------------------------------
# POST /verify
# ---------------------------------------------------------------------------


def test_verify_correct_code_returns_a_hashed_single_use_token(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)

    response = _verify(client, reset_store.user.email, code)

    assert response.status_code == 200
    token = response.json()["reset_token"]
    row = reset_store.codes[-1]
    assert row.verified_at is not None
    assert row.reset_token_hash == hashlib.sha256(token.encode()).hexdigest()
    assert row.reset_token_hash != token
    assert response.json()["expires_in"] == settings.password_reset_token_ttl_minutes * 60


def test_verify_code_cannot_be_used_twice(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)

    _verify_ok(client, reset_store.user.email, code)
    second = _verify(client, reset_store.user.email, code)

    assert second.status_code == 400
    assert _error_code(second) == "invalid_reset_code"


def test_verify_wrong_code_increments_attempts(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)

    response = _verify(client, reset_store.user.email, _wrong_code(code))

    assert response.status_code == 400
    assert _error_code(response) == "invalid_reset_code"
    assert reset_store.codes[-1].attempts == 1
    assert reset_store.codes[-1].used_at is None


def test_verify_malformed_code_uses_the_generic_error(client, email_sender, reset_store):
    _request_code(client, email_sender, reset_store.user.email)

    response = _verify(client, reset_store.user.email, "no-es-un-codigo")

    assert response.status_code == 400
    assert _error_code(response) == "invalid_reset_code"
    assert reset_store.codes[-1].attempts == 1


def test_verify_exhausted_attempts_invalidates_the_code(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)
    wrong = _wrong_code(code)

    for _ in range(settings.password_reset_max_attempts):
        assert _verify(client, reset_store.user.email, wrong).status_code == 400

    row = reset_store.codes[-1]
    assert row.attempts == settings.password_reset_max_attempts
    assert row.used_at is not None

    response = _verify(client, reset_store.user.email, code)
    assert response.status_code == 400


def test_verify_expired_code_is_rejected(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)
    reset_store.codes[-1].expires_at = datetime.now(UTC) - timedelta(seconds=1)

    response = _verify(client, reset_store.user.email, code)

    assert response.status_code == 400
    assert _error_code(response) == "invalid_reset_code"


# ---------------------------------------------------------------------------
# POST /confirm
# ---------------------------------------------------------------------------


def test_confirm_changes_password_and_revokes_sessions(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)
    token = _verify_ok(client, reset_store.user.email, code)
    old_hash = reset_store.user.password_hash

    response = _confirm(client, token)

    assert response.status_code == 200
    assert reset_store.user.password_hash != old_hash
    assert verify_password(NEW_PASSWORD, reset_store.user.password_hash)
    assert reset_store.codes[-1].used_at is not None
    assert reset_store.revoked_user_ids == [reset_store.user.id]


def test_login_after_confirm_uses_the_new_password(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)
    token = _verify_ok(client, reset_store.user.email, code)
    assert _confirm(client, token).status_code == 200

    new_login = client.post(
        LOGIN_URL,
        json={"email": reset_store.user.email, "password": NEW_PASSWORD},
    )
    old_login = client.post(
        LOGIN_URL,
        json={"email": reset_store.user.email, "password": OLD_PASSWORD},
    )

    assert new_login.status_code == 200
    assert old_login.status_code == 401


def test_confirm_rejects_unknown_token(client, reset_store):
    response = _confirm(client, "token-que-no-existe")

    assert response.status_code == 400
    assert _error_code(response) == "invalid_reset_token"


def test_confirm_rejects_expired_token(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)
    token = _verify_ok(client, reset_store.user.email, code)
    reset_store.codes[-1].reset_token_expires_at = datetime.now(UTC) - timedelta(seconds=1)

    response = _confirm(client, token)

    assert response.status_code == 400
    assert _error_code(response) == "invalid_reset_token"


def test_confirm_rejects_reused_token(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)
    token = _verify_ok(client, reset_store.user.email, code)

    assert _confirm(client, token).status_code == 200
    reused = _confirm(client, token, "OtraClave9")

    assert reused.status_code == 400
    assert _error_code(reused) == "invalid_reset_token"


def test_confirm_reuses_the_registration_password_policy(client, email_sender, reset_store):
    _, code = _request_code(client, email_sender, reset_store.user.email)
    token = _verify_ok(client, reset_store.user.email, code)

    response = _confirm(client, token, "sinmayusculas1")

    assert response.status_code == 400
    assert response.json()["field"] == "new_password"


# ---------------------------------------------------------------------------
# Servicio de correo y configuración
# ---------------------------------------------------------------------------


def test_password_reset_template_contains_code_and_expiry() -> None:
    subject, html_content, text_content = render_password_reset_email("123456")

    assert subject == "Tu código de recuperación de AgroDoc"
    assert "123456" in html_content
    assert "123456" in text_content
    assert "10 minutos" in text_content
    assert "ignorar" in text_content


def test_email_provider_uses_brevo_when_configured() -> None:
    sender = build_email_sender(
        Settings(
            email_provider="brevo",
            brevo_api_key="test-key",
            email_from="no-reply@agro.test",
        )
    )

    assert isinstance(sender, BrevoEmailSender)


def test_email_provider_falls_back_to_console() -> None:
    sender = build_email_sender(Settings(email_provider=""))

    assert isinstance(sender, ConsoleEmailSender)


def test_production_brevo_requires_credentials() -> None:
    with pytest.raises(ValidationError):
        Settings(
            environment="production",
            email_provider="brevo",
            brevo_api_key="",
            email_from="",
        )
