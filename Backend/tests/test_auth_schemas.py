"""Contrato de validación HTTP del slice auth (`schemas.py`).

Aquí se comprueba lo que el cliente puede enviar y lo que recibe, sin tocar
FastAPI ni la base de datos.
"""

import pytest
from pydantic import ValidationError

from app.features.auth.schemas import AuthResponse, LoginRequest, RegisterRequest, User

VALID_REGISTER = {
    "email": "farmer@example.com",
    "password": "Secreta123",
    "full_name": "Agricultor Demo",
    "role": "farmer",
}


def _register(**overrides: object) -> RegisterRequest:
    return RegisterRequest(**{**VALID_REGISTER, **overrides})


def test_email_is_normalized_to_lowercase_and_trimmed() -> None:
    payload = _register(email="  Juan.Perez@Example.COM ")

    assert payload.email == "juan.perez@example.com"


def test_full_name_is_trimmed() -> None:
    payload = _register(full_name="  Juan Pérez  ")

    assert payload.full_name == "Juan Pérez"


def test_invalid_email_is_rejected() -> None:
    with pytest.raises(ValidationError):
        _register(email="no-es-un-correo")


@pytest.mark.parametrize("password", ["Ab1", "A" * 129])
def test_password_length_is_bounded(password: str) -> None:
    with pytest.raises(ValidationError):
        _register(password=password)


@pytest.mark.parametrize(
    ("password", "fragment"),
    [
        ("secreta123", "mayúscula"),
        ("SECRETA123", "minúscula"),
        ("SecretaSinNumeros", "número"),
    ],
)
def test_password_policy_reports_each_missing_rule(password: str, fragment: str) -> None:
    with pytest.raises(ValidationError) as exc_info:
        _register(password=password)

    assert fragment in str(exc_info.value)


def test_valid_password_passes_policy() -> None:
    assert _register(password="OtraClave9").password == "OtraClave9"


def test_register_rejects_admin_role() -> None:
    with pytest.raises(ValidationError):
        _register(role="admin")


@pytest.mark.parametrize(
    "overrides",
    [
        {"role": "farmer", "specialty": "Fitopatología"},
        {"role": "farmer", "license_number": "AGR-123"},
    ],
)
def test_agronomist_fields_are_rejected_for_farmers(overrides: dict) -> None:
    with pytest.raises(ValidationError) as exc_info:
        _register(**overrides)

    assert "solo aplican al rol 'agronomist'" in str(exc_info.value)


def test_agronomist_can_send_profile_fields() -> None:
    payload = _register(
        role="agronomist",
        specialty="Fitopatología",
        license_number="AGR-123",
    )

    assert payload.role == "agronomist"
    assert payload.specialty == "Fitopatología"
    assert payload.license_number == "AGR-123"


def test_unknown_fields_are_rejected() -> None:
    with pytest.raises(ValidationError):
        _register(is_admin=True)


def test_login_normalizes_email_but_not_password_policy() -> None:
    payload = LoginRequest(email=" USER@Example.com ", password="x")

    assert payload.email == "user@example.com"
    assert payload.password == "x"


def test_login_rejects_empty_password() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(email="user@example.com", password="")


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
