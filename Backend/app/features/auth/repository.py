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

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.features.auth.models import AgronomistProfile, RefreshToken, User

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
    role: str,
    specialty: str | None = None,
    license_number: str | None = None,
) -> User:
    """Inserta el usuario (y su perfil si es agrónomo). Hace `flush`, no `commit`.

    El `flush` es necesario: el `id` y el `created_at` los genera Postgres, y
    hasta que sale el INSERT no existen en el objeto.
    """
    user = User(
        email=email,
        password_hash=password_hash,
        full_name=full_name,
        role=role,
    )

    if role == "agronomist":
        # Se asigna por la relación: SQLAlchemy toma el `user_id` del padre, así
        # que no hace falta conocer el UUID antes del flush. `cascade` lo incluye
        # en la misma transacción.
        user.agronomist_profile = AgronomistProfile(
            specialty=specialty,
            license_number=license_number,
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