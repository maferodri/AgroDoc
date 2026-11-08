"""Casos de uso del módulo auth: registro, login, sesiones y roles.

Reglas del slice:
- Solo este módulo lee y escribe las tablas de usuarios, perfiles y sesiones.
- Otros módulos obtienen datos de usuario llamando a funciones de este archivo,
  nunca importando sus modelos ni consultando sus tablas.

Convención de transacción: el `repository` hace `flush()`, este archivo hace el
`commit()`. Así el registro (usuario + sesión) es atómico: o entran las dos
filas o no entra ninguna.
"""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.features.auth import repository
from app.features.auth.models import User
from app.features.auth.schemas import AuthResponse, LoginRequest, RegisterRequest
from app.features.auth.schemas import User as UserSchema
from app.shared.schemas import ModuleHealth

MODULE = "auth"

_DUMMY_PASSWORD_HASH = hash_password("dummy-password-for-timing-only")


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)


def _hash_refresh_token(token: str) -> str:
    """Hash del refresh token para guardarlo en la BD.

    SHA-256, no Argon2: el token ya tiene ~384 bits de entropía, así que no hay
    nada que proteger contra fuerza bruta, y se busca por `token_hash` en cada
    refresh. Argon2 aquí solo añadiría latencia en el camino caliente.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _issue_tokens(db: Session, user: User) -> AuthResponse:
    """Emite access (JWT) + refresh (opaco), registra la sesión y arma la respuesta.

    No hace commit: el llamador decide cuándo cerrar la transacción. Lo comparten
    registro y login para que ambos emitan exactamente lo mismo.
    """
    refresh_token = secrets.token_urlsafe(48)
    repository.add_refresh_token(
        db,
        user=user,
        token_hash=_hash_refresh_token(refresh_token),
        expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
    )
    return AuthResponse(
        # PyJWT exige `sub` como string (RFC 7519); el id es un UUID.
        access_token=create_access_token(str(user.id), role=user.role),
        refresh_token=refresh_token,
        user=UserSchema.model_validate(user),
    )


def register(db: Session, payload: RegisterRequest) -> AuthResponse:
    """Crea la cuenta y abre sesión. Lanza `ConflictError` si el correo ya existe."""
    # Antes de hashear: si el correo ya está, no gastamos 50-100 ms de CPU.
    if repository.get_user_by_email(db, payload.email) is not None:
        raise ConflictError("El correo ya está registrado.")

    user = repository.create_user(
        db,
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
    )

    response = _issue_tokens(db, user)
    db.commit()
    return response


def _authenticate(db: Session, email: str, password: str) -> User:
    user = repository.get_user_by_email(db, email)
    if user is None:
        verify_password(password, _DUMMY_PASSWORD_HASH)
        raise UnauthorizedError("Credenciales inválidas")
    if not verify_password(password, user.password_hash):
        raise UnauthorizedError("Credenciales inválidas")
    return user


def login(db: Session, payload: LoginRequest) -> AuthResponse:
    user = _authenticate(db, payload.email, payload.password)
    if not user.is_active:
        raise ForbiddenError("La cuenta está desactivada")
    response = _issue_tokens(db, user)
    db.commit()
    return response
