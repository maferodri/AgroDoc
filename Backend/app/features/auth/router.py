"""Endpoints HTTP del módulo auth.

Contrato: `docs/openapi.yaml` (`/auth/*`, `/users/*`, `/agronomists`).
Este archivo solo traduce HTTP ↔ casos de uso; la lógica vive en `service.py`.
"""

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.email_service import (
    EmailSender,
    get_email_sender,
    send_password_reset_code_safely,
)
from app.features.auth import service
from app.features.auth.dependency import get_current_user, require_admin
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
    UpdateUserRoleRequest,
)
from app.features.auth.schemas import User as UserSchema
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["auth"])


@router.get("/auth/health", response_model=ModuleHealth, summary="Estado del módulo auth")
def module_health() -> ModuleHealth:
    return service.health()


# Post Registrar usuario
@router.post(
    "/auth/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    return service.register(db, payload)


@router.post("/auth/login", response_model=AuthResponse, summary="Iniciar sesión")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return service.login(db, payload)


@router.post(
    "/auth/password-reset/request",
    response_model=MessageResponse,
    summary="Solicitar código de recuperación de contraseña",
)
def request_password_reset(
    payload: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    email_sender: EmailSender = Depends(get_email_sender),
) -> MessageResponse:
    dispatch = service.request_password_reset(db, payload)
    if dispatch is not None:
        background_tasks.add_task(
            send_password_reset_code_safely,
            email_sender,
            to=dispatch.to,
            code=dispatch.code,
        )
    return MessageResponse(message=service.PASSWORD_RESET_REQUEST_MESSAGE)


@router.post(
    "/auth/password-reset/verify",
    response_model=PasswordResetVerifyResponse,
    summary="Validar código de recuperación",
)
def verify_password_reset_code(
    payload: PasswordResetVerifyRequest,
    db: Session = Depends(get_db),
) -> PasswordResetVerifyResponse:
    return service.verify_password_reset_code(db, payload)


@router.post(
    "/auth/password-reset/confirm",
    response_model=MessageResponse,
    summary="Definir nueva contraseña",
)
def confirm_password_reset(
    payload: PasswordResetConfirmRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    return service.confirm_password_reset(db, payload)


@router.get("/users/me", response_model=UserSchema, summary="Usuario autenticado")
def me(current_user: User = Depends(get_current_user)) -> UserSchema:
    return UserSchema.model_validate(current_user)


@router.patch(
    "/users/{user_id}/role",
    response_model=UserSchema,
    summary="Cambiar rol de un usuario (solo administradores)",
)
def update_user_role(
    user_id: uuid.UUID,
    payload: UpdateUserRoleRequest,
    actor: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserSchema:
    updated = service.update_user_role(db, actor=actor, target_id=user_id, new_role=payload.role)
    return UserSchema.model_validate(updated)
