"""Envío de correos transaccionales.

El hosting de producción bloquea los puertos SMTP salientes (25, 465 y 587),
así que el único transporte real es la API HTTPS de Brevo (puerto 443).
`EMAIL_PROVIDER=brevo` selecciona Brevo; cualquier otro valor (o vacío) usa
`ConsoleEmailSender`, pensado para desarrollo local y pruebas.
"""

import logging
from abc import ABC, abstractmethod
from functools import lru_cache

import httpx

from app.core.config import Settings, settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
BREVO_TIMEOUT_SECONDS = 10.0

PASSWORD_RESET_SUBJECT = "Tu código de recuperación de AgroDoc"


class EmailSendError(Exception):
    """No se pudo enviar el correo. El mensaje es seguro para logs."""


def render_password_reset_email(
    code: str,
    *,
    ttl_minutes: int = 10,
) -> tuple[str, str, str]:
    """Devuelve (asunto, html, texto plano) del correo de recuperación."""
    text_content = (
        "Recibimos una solicitud para restablecer tu contraseña de AgroDoc.\n\n"
        f"Tu código de recuperación es: {code}\n\n"
        f"El código expira en {ttl_minutes} minutos y solo puede usarse una vez.\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje.\n"
    )

    html_content = f"""<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f9fafb;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:480px;margin:0 auto;padding:32px;background:#ffffff;border-radius:8px;">
      <h1 style="margin:0 0 16px;font-size:22px;color:#166534;">Recupera tu contraseña</h1>
      <p style="margin:0 0 16px;line-height:1.5;">
        Recibimos una solicitud para restablecer tu contraseña de AgroDoc.
      </p>
      <p style="margin:0 0 16px;padding:16px;background:#f0fdf4;border-radius:8px;
                font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;">
        {code}
      </p>
      <p style="margin:0 0 16px;line-height:1.5;">
        El código expira en {ttl_minutes} minutos y solo puede usarse una vez.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#6b7280;">
        Si no solicitaste este cambio, puedes ignorar este mensaje.
      </p>
    </div>
  </body>
</html>
"""
    return PASSWORD_RESET_SUBJECT, html_content, text_content


class EmailSender(ABC):
    """Interfaz de envío de correos."""

    @abstractmethod
    async def send(
        self,
        *,
        to: str,
        subject: str,
        html_content: str,
        text_content: str,
    ) -> None:
        """Envía un correo o lanza `EmailSendError`."""

    async def send_password_reset_code(self, *, to: str, code: str) -> None:
        subject, html_content, text_content = render_password_reset_email(
            code,
            ttl_minutes=settings.password_reset_code_ttl_minutes,
        )
        await self.send(
            to=to,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )


class ConsoleEmailSender(EmailSender):
    """Buzón simulado: imprime el correo en logs (solo desarrollo/tests)."""

    async def send(
        self,
        *,
        to: str,
        subject: str,
        html_content: str,
        text_content: str,
    ) -> None:
        logger.info(
            "Correo simulado para %s\nAsunto: %s\n%s",
            to,
            subject,
            text_content,
        )


class BrevoEmailSender(EmailSender):
    """Envía correos con la API HTTPS de Brevo."""

    def __init__(self, *, api_key: str, sender_email: str, sender_name: str) -> None:
        self._api_key = api_key
        self._sender_email = sender_email
        self._sender_name = sender_name

    async def send(
        self,
        *,
        to: str,
        subject: str,
        html_content: str,
        text_content: str,
    ) -> None:
        payload = {
            "sender": {"name": self._sender_name, "email": self._sender_email},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html_content,
            "textContent": text_content,
        }
        headers = {
            "api-key": self._api_key,
            "accept": "application/json",
            "content-type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=BREVO_TIMEOUT_SECONDS) as client:
                response = await client.post(BREVO_API_URL, headers=headers, json=payload)
        except httpx.HTTPError as exc:
            # No se registra la URL con cabeceras: la API key nunca entra al log.
            logger.error(
                "Error de red al enviar correo con Brevo: %s",
                type(exc).__name__,
            )
            raise EmailSendError("No se pudo enviar el correo") from exc

        if response.status_code >= 400:
            body = response.text[:1000]
            if self._api_key:
                body = body.replace(self._api_key, "***")
            logger.error(
                "Brevo rechazó el correo: status=%s body=%s",
                response.status_code,
                body,
            )
            raise EmailSendError("No se pudo enviar el correo")


class InMemoryEmailSender(EmailSender):
    """Buzón en memoria para tests; nunca se usa en producción."""

    def __init__(self) -> None:
        self.messages: list[dict[str, str]] = []
        self.last_code: str | None = None

    async def send(
        self,
        *,
        to: str,
        subject: str,
        html_content: str,
        text_content: str,
    ) -> None:
        self.messages.append(
            {
                "to": to,
                "subject": subject,
                "html_content": html_content,
                "text_content": text_content,
            }
        )

    async def send_password_reset_code(self, *, to: str, code: str) -> None:
        self.last_code = code
        await super().send_password_reset_code(to=to, code=code)


def build_email_sender(config: Settings | None = None) -> EmailSender:
    """Selecciona el transporte según `EMAIL_PROVIDER`."""
    current = config or settings
    if current.email_provider.strip().lower() == "brevo":
        return BrevoEmailSender(
            api_key=current.brevo_api_key,
            sender_email=current.email_from,
            sender_name=current.email_from_name,
        )
    return ConsoleEmailSender()


@lru_cache
def get_email_sender() -> EmailSender:
    """Dependencia de FastAPI; se puede sobrescribir en tests."""
    return build_email_sender()


async def send_password_reset_code_safely(
    sender: EmailSender,
    *,
    to: str,
    code: str,
) -> None:
    """Envía en background sin romper la respuesta genérica si algo falla."""
    try:
        await sender.send_password_reset_code(to=to, code=code)
    except Exception:
        # El detalle queda en el servidor. Nunca se propaga al cliente y no se
        # registran ni el código ni el token.
        logger.exception("No se pudo enviar el correo de recuperación de contraseña")
