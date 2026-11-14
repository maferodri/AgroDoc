"""Casos de uso del módulo auth: registro, login, sesiones, roles y
recuperación de contraseña.

Reglas del slice:
- Solo este módulo lee y escribe las tablas de usuarios, perfiles y sesiones.
- Otros módulos obtienen datos de usuario llamando a funciones de este archivo,
  nunca importando sus modelos ni consultando sus tablas.

Convención de transacción: el `repository` hace `flush()`, este archivo hace el
`commit()`. Así el registro (usuario + sesión) es atómico: o entran las dos
filas o no entra ninguna.
"""

import hashlib
import hmac
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    InvalidPasswordResetCodeError,
    InvalidPasswordResetTokenError,
    NotFoundError,
    UnauthorizedError,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.features.auth import repository
from app.features.auth.models import User
from app.features.auth.schemas import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    PasswordResetVerifyRequest,
    PasswordResetVerifyResponse,
    RegisterRequest,
)
from app.features.auth.schemas import User as UserSchema
from app.shared.schemas import ModuleHealth

MODULE = "auth"

PASSWORD_RESET_REQUEST_MESSAGE = (
    "Si el correo está registrado, recibirás un código de recuperación."
)
PASSWORD_RESET_INVALID_CODE_MESSAGE = "Código inválido o expirado"
PASSWORD_RESET_INVALID_TOKEN_MESSAGE = "El token de recuperación es inválido o expiró"


@dataclass(frozen=True)
class PasswordResetEmail:
    """Datos que el router envía en background (nunca salen en la respuesta)."""

    to: str
    code: str

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


def _generate_password_reset_code() -> str:
    """Código de 6 dígitos con ceros a la izquierda."""
    return f"{secrets.randbelow(1_000_000):06d}"


def _hash_password_reset_code(code: str) -> str:
    """HMAC-SHA256 del código con una clave del servidor.

    6 dígitos tienen muy poca entropía: un SHA-256 simple sería reversible con
    una tabla de un millón de filas. La clave del servidor evita ese ataque si
    la tabla se filtra.
    """
    return hmac.new(
        settings.jwt_secret.encode("utf-8"),
        code.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _hash_reset_token(token: str) -> str:
    """SHA-256 del reset_token (tiene ~384 bits de entropía)."""
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


def request_password_reset(
    db: Session,
    payload: PasswordResetRequest,
) -> PasswordResetEmail | None:
    """Genera un código y devuelve lo necesario para enviarlo por correo.

    Devuelve `None` tanto si el correo no existe como si se superó el rate
    limit. El router responde siempre lo mismo, así que la respuesta no revela
    qué cuentas están registradas.
    """
    now = datetime.now(UTC)
    user = repository.get_user_by_email(db, payload.email)

    if user is None or not user.is_active:
        # Mantiene un camino con trabajo de hash y de BD para no delatar por
        # tiempo si el correo existe o no.
        _hash_password_reset_code(_generate_password_reset_code())
        repository.count_password_reset_codes_since(
            db,
            user_id=uuid.uuid4(),
            since=now - timedelta(minutes=settings.password_reset_rate_limit_window_minutes),
        )
        db.commit()
        return None

    window_start = now - timedelta(minutes=settings.password_reset_rate_limit_window_minutes)
    recent_requests = repository.count_password_reset_codes_since(
        db,
        user_id=user.id,
        since=window_start,
    )
    if recent_requests >= settings.password_reset_max_requests_per_window:
        return None

    repository.invalidate_pending_password_reset_codes(db, user_id=user.id, now=now)

    code = _generate_password_reset_code()
    repository.create_password_reset_code(
        db,
        user_id=user.id,
        code_hash=_hash_password_reset_code(code),
        expires_at=now + timedelta(minutes=settings.password_reset_code_ttl_minutes),
    )
    db.commit()

    return PasswordResetEmail(to=user.email, code=code)


def verify_password_reset_code(
    db: Session,
    payload: PasswordResetVerifyRequest,
) -> PasswordResetVerifyResponse:
    """Valida el código y emite un reset_token de un solo uso."""
    now = datetime.now(UTC)
    user = repository.get_user_by_email(db, payload.email)

    if user is None or not user.is_active:
        hmac.compare_digest(
            _hash_password_reset_code(payload.code),
            _hash_password_reset_code(_generate_password_reset_code()),
        )
        raise InvalidPasswordResetCodeError(PASSWORD_RESET_INVALID_CODE_MESSAGE)

    latest = repository.get_latest_password_reset_code(db, user_id=user.id)
    if (
        latest is None
        or latest.used_at is not None
        or latest.verified_at is not None
        or latest.attempts >= settings.password_reset_max_attempts
    ):
        raise InvalidPasswordResetCodeError(PASSWORD_RESET_INVALID_CODE_MESSAGE)

    if latest.expires_at <= now:
        raise InvalidPasswordResetCodeError(PASSWORD_RESET_INVALID_CODE_MESSAGE)

    candidate_hash = _hash_password_reset_code(payload.code)
    if not hmac.compare_digest(candidate_hash, latest.code_hash):
        attempts = latest.attempts + 1
        repository.increment_password_reset_attempts(
            db,
            code=latest,
            invalidated_at=now if attempts >= settings.password_reset_max_attempts else None,
        )
        db.commit()
        raise InvalidPasswordResetCodeError(PASSWORD_RESET_INVALID_CODE_MESSAGE)

    reset_token = secrets.token_urlsafe(48)
    ttl_minutes = settings.password_reset_token_ttl_minutes
    repository.mark_password_reset_code_verified(
        db,
        code=latest,
        reset_token_hash=_hash_reset_token(reset_token),
        reset_token_expires_at=now + timedelta(minutes=ttl_minutes),
        verified_at=now,
    )
    db.commit()

    return PasswordResetVerifyResponse(
        reset_token=reset_token,
        expires_in=ttl_minutes * 60,
    )


def confirm_password_reset(
    db: Session,
    payload: PasswordResetConfirmRequest,
) -> MessageResponse:
    """Cambia la contraseña y revoca todas las sesiones del usuario."""
    now = datetime.now(UTC)
    code = repository.get_password_reset_code_by_reset_token_hash(
        db,
        reset_token_hash=_hash_reset_token(payload.reset_token),
    )

    if code is None:
        raise InvalidPasswordResetTokenError(PASSWORD_RESET_INVALID_TOKEN_MESSAGE)

    if (
        code.verified_at is None
        or code.used_at is not None
        or code.reset_token_expires_at is None
        or code.reset_token_expires_at <= now
    ):
        raise InvalidPasswordResetTokenError(PASSWORD_RESET_INVALID_TOKEN_MESSAGE)

    user = repository.get_user_by_id(db, code.user_id)
    if user is None or not user.is_active:
        raise InvalidPasswordResetTokenError(PASSWORD_RESET_INVALID_TOKEN_MESSAGE)

    repository.update_user_password(
        db,
        user=user,
        password_hash=hash_password(payload.new_password),
    )
    repository.mark_password_reset_code_used(db, code=code, used_at=now)
    repository.revoke_all_refresh_tokens(db, user_id=user.id, revoked_at=now)
    db.commit()

    return MessageResponse(message="Contraseña actualizada correctamente.")


def update_user_role(
    db: Session,
    *,
    actor: User,
    target_id: uuid.UUID,
    new_role: str,
) -> User:
    if actor.role != "admin":
        raise ForbiddenError("No tienes permisos para realizar esta acción")

    target = repository.get_user_by_id(db, target_id)

    if target is None:
        raise NotFoundError("Usuario no encontrado")

    updated = repository.update_user_role(db, user=target, role=new_role)
    db.commit()
    return updated
