import uuid

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.features.auth import repository
from app.features.auth.models import User

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise UnauthorizedError("No autenticado")

    try:
        payload = decode_token(credentials.credentials)
    except jwt.PyJWTError:
        # `decode_token` lanza `ExpiredSignatureError`, `InvalidSignatureError`, etc.
        # Si se dejan escapar, FastAPI responde 500 en vez de 401.
        raise UnauthorizedError("Token inválido o expirado") from None

    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError("Token inválido o expirado")

    try:
        user_id = uuid.UUID(subject)
    except ValueError:
        raise UnauthorizedError("Token inválido o expirado") from None

    user = repository.get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("Token inválido o expirado")

    return user


def require_roles(*roles: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise ForbiddenError("No tienes permisos para realizar esta acción")
        return current_user

    return dependency
