"""Acceso a datos del módulo auth.

Único archivo del slice que escribe SQL. No decide reglas de negocio, no lanza
errores HTTP y no conoce los schemas: recibe valores y devuelve objetos.

Contrato con el `service`:
- Se usa `flush()`, nunca `commit()`: la transacción la cierra el service.
- Buscar y no encontrar devuelve `None`, no una excepción: decidir qué
  responder (y no filtrar qué correos existen) es trabajo del service.
"""

import uuid
from datetime import datetime

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.features.auth.models import PasswordResetCode, RefreshToken, User

# Nombre real de la restricción UNIQUE en Postgres (naming_convention de la Base).
_EMAIL_UNIQUE_CONSTRAINT = "uq_users_email"


def _translate_integrity_error(exc: IntegrityError) -> ConflictError:
    """Traduce una violación de restricción de Postgres a un error de dominio.

    La carrera del registro (dos peticiones simultáneas con el mismo correo)
    solo la detecta la base. El service ya comprobó con `get_user_by_email`,
    pero entre la comprobación y el INSERT cabe otra petición.
    """
    # `diag` solo existe en psycopg; con otro driver queda `None`.
    constraint = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)
    if constraint == _EMAIL_UNIQUE_CONSTRAINT:
        return ConflictError("El correo ya está registrado.")
    return ConflictError("No se pudo crear el usuario por un conflicto de datos.")


def get_user_by_email(db: Session, email: str) -> User | None:
    """Usuario por correo exacto. `None` si no existe.

    El correo llega ya normalizado (minúsculas) desde el schema; aquí no se
    normaliza para no tener dos lugares donde se puede olvidar.
    """
    return db.scalar(select(User).where(User.email == email))


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    """Usuario por id (lo usa la dependencia `get_current_user`). `None` si no existe."""
    return db.get(User, user_id)


def create_user(
    db: Session,
    *,
    email: str,
    password_hash: str,
    full_name: str,
) -> User:
    """Inserta el usuario. Hace `flush`, no `commit`.

    El `flush` es necesario: el `id` y el `created_at` los genera Postgres, y
    hasta que sale el INSERT no existen en el objeto.
    """
    user = User(
        email=email,
        password_hash=password_hash,
        full_name=full_name,
    )

    db.add(user)
    try:
        db.flush()
    except IntegrityError as exc:
        # La sesión queda inutilizable tras un error de este tipo: hay que
        # limpiarla antes de que el handler devuelva la respuesta.
        db.rollback()
        raise _translate_integrity_error(exc) from exc
    return user


def update_user_role(db: Session, *, user: User, role: str) -> User:
    """Asigna un nuevo rol al usuario."""
    user.role = role
    db.flush()
    return user


def add_refresh_token(
    db: Session,
    *,
    user: User,
    token_hash: str,
    expires_at: datetime,
) -> RefreshToken:
    """Registra una sesión. Guarda el HASH del token, nunca el token en claro.

    `expires_at` lo calcula el service: el TTL es una regla de negocio
    (`settings.refresh_token_expire_days`), y este archivo no lee configuración.
    """
    token = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(token)
    db.flush()
    return token


def create_password_reset_code(
    db: Session,
    *,
    user_id: uuid.UUID,
    code_hash: str,
    expires_at: datetime,
) -> PasswordResetCode:
    """Registra un código de recuperación. Hace `flush`, no `commit`."""
    code = PasswordResetCode(
        user_id=user_id,
        code_hash=code_hash,
        expires_at=expires_at,
    )
    db.add(code)
    db.flush()
    return code


def count_password_reset_codes_since(
    db: Session,
    *,
    user_id: uuid.UUID,
    since: datetime,
) -> int:
    """Solicitudes de recuperación del usuario desde `since` (rate limit)."""
    return (
        db.scalar(
            select(func.count())
            .select_from(PasswordResetCode)
            .where(
                PasswordResetCode.user_id == user_id,
                PasswordResetCode.created_at >= since,
            )
        )
        or 0
    )


def invalidate_pending_password_reset_codes(
    db: Session,
    *,
    user_id: uuid.UUID,
    now: datetime,
) -> None:
    """Marca como usados los códigos pendientes anteriores del usuario."""
    db.execute(
        update(PasswordResetCode)
        .where(
            PasswordResetCode.user_id == user_id,
            PasswordResetCode.used_at.is_(None),
        )
        .values(used_at=now)
    )
    db.flush()


def get_latest_password_reset_code(
    db: Session,
    *,
    user_id: uuid.UUID,
) -> PasswordResetCode | None:
    """Código más reciente del usuario. `None` si nunca pidió uno."""
    return db.scalar(
        select(PasswordResetCode)
        .where(PasswordResetCode.user_id == user_id)
        .order_by(PasswordResetCode.created_at.desc())
        .limit(1)
    )


def get_password_reset_code_by_reset_token_hash(
    db: Session,
    *,
    reset_token_hash: str,
) -> PasswordResetCode | None:
    """Código asociado al hash del reset_token. `None` si no existe."""
    return db.scalar(
        select(PasswordResetCode).where(PasswordResetCode.reset_token_hash == reset_token_hash)
    )


def increment_password_reset_attempts(
    db: Session,
    *,
    code: PasswordResetCode,
    invalidated_at: datetime | None = None,
) -> PasswordResetCode:
    """Suma un intento fallido; opcionalmente invalida el código."""
    code.attempts += 1
    if invalidated_at is not None:
        code.used_at = invalidated_at
    db.flush()
    return code


def mark_password_reset_code_verified(
    db: Session,
    *,
    code: PasswordResetCode,
    reset_token_hash: str,
    reset_token_expires_at: datetime,
    verified_at: datetime,
) -> PasswordResetCode:
    """Guarda el hash del reset_token y la marca de verificación."""
    code.reset_token_hash = reset_token_hash
    code.reset_token_expires_at = reset_token_expires_at
    code.verified_at = verified_at
    db.flush()
    return code


def mark_password_reset_code_used(
    db: Session,
    *,
    code: PasswordResetCode,
    used_at: datetime,
) -> PasswordResetCode:
    """Consume el código y su reset_token."""
    code.used_at = used_at
    db.flush()
    return code


def update_user_password(
    db: Session,
    *,
    user: User,
    password_hash: str,
) -> User:
    """Reemplaza el hash de contraseña del usuario."""
    user.password_hash = password_hash
    db.flush()
    return user


def revoke_all_refresh_tokens(
    db: Session,
    *,
    user_id: uuid.UUID,
    revoked_at: datetime,
) -> None:
    """Revoca todas las sesiones activas del usuario."""
    db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        )
        .values(revoked_at=revoked_at)
    )
    db.flush()
