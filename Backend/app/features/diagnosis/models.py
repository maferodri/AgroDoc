"""Modelos SQLAlchemy del módulo diagnosis.

Tablas del slice: `pests`, `pest_crops`, `treatments`, `diagnoses`.
Se importan desde `alembic/env.py` para que `--autogenerate` las detecte.
"""

from app.core.database import Base  # noqa: F401
