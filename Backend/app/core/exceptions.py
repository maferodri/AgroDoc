"""Errores de dominio comunes y su traducción a respuestas HTTP."""

from typing import cast

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.types import ExceptionHandler


class DomainError(Exception):
    """Error de negocio que se traduce a una respuesta HTTP homogénea."""

    status_code = status.HTTP_400_BAD_REQUEST
    code = "domain_error"

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(DomainError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class ConflictError(DomainError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"


class UnauthorizedError(DomainError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"


class ForbiddenError(DomainError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"

async def _request_validation_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    message, field = _validation_message(exc)
    return JSONResponse(
        status_code=400,
        content={"error": "validation_error", "message": message, "field": field},
    )

def _validation_message(exc: RequestValidationError) -> tuple[str, str | None]:
    errors = exc.errors()
    if not errors:
        return "Datos inválidos", None
    first = errors[0]
    # Pydantic v2 prefija los errores de validadores custom con "Value error, "
    message = str(first.get("msg", "Datos inválidos")).removeprefix("Value error, ")
    # loc = ("body", "password") -> "password"; se descarta "body"
    field = ".".join(str(part) for part in first.get("loc", ())[1:]) or None
    return message, field

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message}},
        )
    app.add_exception_handler(
        RequestValidationError,
        # El handler es específico de `RequestValidationError`; Starlette tipa
        # `ExceptionHandler` para cualquier `Exception`, de ahí el cast.
        cast(ExceptionHandler, _request_validation_handler),
    )
