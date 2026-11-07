"""Modelos SQLAlchemy del módulo crops.

Tablas del slice: `crop_types`, `farms`, `crops`, `crop_events`.
Se importan desde `alembic/env.py` para que `--autogenerate` las detecte.

Reglas del slice:
- Solo este módulo lee y escribe estas tablas.
- `owner_id` es una **ref lógica** a `users` (auth): se guarda como UUID SIN
  FOREIGN KEY para no acoplar los esquemas (ver docs/base-de-datos.md §2).
- Las FK reales son solo dentro del módulo: `crops.farm_id`,
  `crops.crop_type_id` y `crop_events.crop_id`.
- `crop_types` es un catálogo pequeño: `smallserial` + `code` estable.
- `updated_at` de `farms` y `crops` se actualiza por trigger
  (`set_updated_at()`, creada en la migración de auth).
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

CROP_STATUSES = ("active", "harvested", "discarded")


class CropType(Base):
    """Catálogo de cultivos. `code` es la clave estable que usan otros módulos."""

    __tablename__ = "crop_types"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name_es: Mapped[str] = mapped_column(String(100), nullable=False)
    scientific_name: Mapped[str | None] = mapped_column(String(150))

    crops: Mapped[list["Crop"]] = relationship(back_populates="crop_type")


class Farm(Base):
    """Finca del usuario. `owner_id` es ref lógica a users (auth)."""

    __tablename__ = "farms"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    # Ref lógica a users.id (módulo auth). Sin FK.
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str | None] = mapped_column(String(100))
    municipality: Mapped[str | None] = mapped_column(String(100))
    area_hectares: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    crops: Mapped[list["Crop"]] = relationship(
        back_populates="farm",
        passive_deletes=True,
    )


class Crop(Base):
    """Cultivo guardado. Puede o no estar asociado a una finca."""

    __tablename__ = "crops"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'harvested', 'discarded')",
            name="status_valid",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    # Ref lógica a users.id (módulo auth). Sin FK.
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    # FK real: farms es del mismo módulo. Si se borra la finca, el cultivo queda.
    farm_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("farms.id", ondelete="SET NULL"),
        index=True,
    )
    # FK real: catálogo del mismo módulo.
    crop_type_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("crop_types.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    planted_on: Mapped[date | None] = mapped_column(Date)
    growth_stage: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active", server_default="active"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    farm: Mapped["Farm | None"] = relationship(back_populates="crops")
    crop_type: Mapped["CropType"] = relationship(back_populates="crops")
    events: Mapped[list["CropEvent"]] = relationship(
        back_populates="crop",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="CropEvent.occurred_at",
    )


class CropEvent(Base):
    """Bitácora del cultivo (siembra, riego, fertilización, cosecha...)."""

    __tablename__ = "crop_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    # FK real: crops es del mismo módulo.
    crop_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("crops.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    crop: Mapped["Crop"] = relationship(back_populates="events")