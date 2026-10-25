"""Utilidades de contraseñas y JWT compartidas por el monolito.

Las usa el módulo `auth`; el resto de módulos solo necesita validar el token
con `decode_token` cuando proteja sus endpoints.
"""

from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _password_hash.verify(password, password_hash)


def create_access_token(
    subject: str,
    *,
    role: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload: dict[str, object] = {"sub": subject, "exp": expire, "type": "access"}
    if role is not None:
        payload["role"] = role
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """Decodifica y valida un JWT. Lanza `jwt.PyJWTError` si no es válido."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
