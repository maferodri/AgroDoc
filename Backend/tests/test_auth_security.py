"""Utilidades compartidas de contraseñas y JWT (`app/core/security.py`)."""

from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_password_does_not_return_plaintext() -> None:
    password = "Secreta123"

    hashed = hash_password(password)

    assert hashed != password
    assert password not in hashed


def test_hash_password_is_salted() -> None:
    # Dos hashes de la misma contraseña deben diferir (salt aleatorio).
    assert hash_password("Secreta123") != hash_password("Secreta123")


def test_verify_password_accepts_correct_and_rejects_wrong() -> None:
    hashed = hash_password("Secreta123")

    assert verify_password("Secreta123", hashed) is True
    assert verify_password("Secreta124", hashed) is False


def test_access_token_contains_subject_role_and_type() -> None:
    token = create_access_token("user-id", role="farmer")

    payload = decode_token(token)

    assert payload["sub"] == "user-id"
    assert payload["role"] == "farmer"
    assert payload["type"] == "access"


def test_access_token_without_role_omits_claim() -> None:
    payload = decode_token(create_access_token("user-id"))

    assert "role" not in payload


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
    tampered = ".".join([header, payload, signature[:-2] + "xx"])

    with pytest.raises(jwt.PyJWTError):
        decode_token(tampered)
