"""Entorno de Alembic para el monolito.

Hay una sola historia de migraciones en `Backend/alembic/versions/`. Para que
`--autogenerate` vea todas las tablas, aquí se importan los modelos de cada
slice; ningún módulo importa modelos de otro módulo.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.core.database import Base

# Registro de modelos por slice (importar tiene efecto secundario).
from app.features.auth import models as auth_models  # noqa: F401
from app.features.consultations import models as consultations_models  # noqa: F401
from app.features.crops import models as crops_models  # noqa: F401
from app.features.diagnosis import models as diagnosis_models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.database_url.replace("%", "%%"))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()


