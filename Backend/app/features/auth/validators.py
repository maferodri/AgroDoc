"""Reglas puras del módulo auth. Sin Pydantic, sin FastAPI, sin base de datos."""

import re

_PASSWORD_RULES: tuple[tuple[str, str], ...] = (
    (r"[A-Z]", "al menos una letra mayúscula"),
    (r"[a-z]", "al menos una letra minúscula"),
    (r"\d", "al menos un número"),
)


def normalize_email(value: object) -> object:
    """Minúsculas y sin espacios: `Juan@X.com ` y `juan@x.com` son la misma cuenta."""
    return value.strip().lower() if isinstance(value, str) else value


def strip_text(value: object) -> object:
    """Colapsa los extremos: `"  Juan  "` → `"Juan"`; `"   "` → `""`."""
    return value.strip() if isinstance(value, str) else value


def password_policy_errors(password: str) -> list[str]:
    """Reglas incumplidas. Lista vacía = contraseña válida."""
    return [hint for pattern, hint in _PASSWORD_RULES if not re.search(pattern, password)]
