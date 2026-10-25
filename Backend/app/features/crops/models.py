"""Modelos SQLAlchemy del módulo crops.

Tablas del slice: `crop_types`, `farms`, `crops`, `crop_events`.
Se importan desde `alembic/env.py` para que `--autogenerate` las detecte.
"""

from app.core.database import Base  # noqa: F401
