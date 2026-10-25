"""Modelos SQLAlchemy del módulo auth.

Tablas del slice: `users`, `agronomist_profiles`, `refresh_tokens`.
Se importan desde `alembic/env.py` para que `--autogenerate` las detecte.
"""

from app.core.database import Base  # noqa: F401
