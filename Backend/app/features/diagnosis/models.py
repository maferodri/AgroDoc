"""Modelos SQLAlchemy del módulo diagnosis.

Tablas del slice: `pests`, `pest_crops`, `treatments`, `diagnoses`.
Se importan desde `alembic/env.py` para que `--autogenerate` las detecte.

Reglas del slice:
- Solo este módulo lee y escribe estas tablas.
- `user_id`, `crop_id`, `consultation_id` y `pest_crops.crop_type_code` son
  **refs lógicas** a `users` (auth), `crops` (crops), `consultations`
  (consultations) y `crop_types.code` (crops): UUID/texto SIN FOREIGN KEY para
  no acoplar los esquemas (ver docs/base-de-datos.md §2).
- Las FK reales son solo dentro del módulo: `pest_crops.pest_id`,
  `treatments.pest_id` y `diagnoses.pest_id`.
- `low_confidence` es una columna **generada** (`confidence < threshold_used`)
  para que nunca se contradiga con la confianza guardada (§9).
- `pests.model_label` es la clase exacta que devuelve el modelo y debe
  coincidir con la lista de clases del entrenamiento (`ml/`).
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Computed,
    DateTime,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Pest(Base):
    """Catálogo de plagas. `model_label` es la clase que devuelve el modelo."""

    __tablename__ = "pests"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    model_label: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    common_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100))
    symptoms: Mapped[str | None] = mapped_column(Text)

    pest_crops: Mapped[list["PestCrop"]] = relationship(
        back_populates="pest",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    treatments: Mapped[list["Treatment"]] = relationship(
        back_populates="pest",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Treatment.title",
    )
    diagnoses: Mapped[list["Diagnosis"]] = relationship(
        back_populates="pest",
        passive_deletes=True,
    )


class PestCrop(Base):
    """Qué plaga afecta a qué cultivo (N:M del catálogo).

    `crop_type_code` es una **ref lógica** a `crop_types.code` (módulo crops):
    texto sin FK para no acoplar los esquemas.
    """

    __tablename__ = "pest_crops"

    pest_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("pests.id", ondelete="CASCADE"),
        primary_key=True,
    )
    crop_type_code: Mapped[str] = mapped_column(String(50), primary_key=True)

    pest: Mapped["Pest"] = relationship(back_populates="pest_crops")


class Treatment(Base):
    """Recomendación de tratamiento para una plaga."""

    __tablename__ = "treatments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    pest_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("pests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    treatment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    pest: Mapped["Pest"] = relationship(back_populates="treatments")


class Diagnosis(Base):
    """Resultado de una inferencia sobre la imagen de un cultivo."""

    __tablename__ = "diagnoses"
    __table_args__ = (
        CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="confidence_range",
        ),
        CheckConstraint(
            "threshold_used >= 0 AND threshold_used <= 1",
            name="threshold_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    # Ref lógica a users.id (módulo auth). Sin FK.
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    # Ref lógica a crops.id (módulo crops). Nullable: se puede diagnosticar
    # una foto sin tener un cultivo guardado.
    crop_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)

    image_path: Mapped[str] = mapped_column(Text, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    # Etiqueta cruda del modelo; puede no existir todavía en el catálogo.
    predicted_label: Mapped[str] = mapped_column(String(255), nullable=False)
    # FK real al catálogo del mismo módulo. Nullable: el modelo pudo devolver
    # una clase que aún no está en `pests`.
    pest_id: Mapped[int | None] = mapped_column(
        SmallInteger,
        ForeignKey("pests.id", ondelete="SET NULL"),
        index=True,
    )

    confidence: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    # Umbral con el que se decidió, para auditar diagnósticos antiguos.
    threshold_used: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    # Columna generada: nunca se desincroniza con confidence/threshold_used.
    low_confidence: Mapped[bool] = mapped_column(
        Computed("confidence < threshold_used", persisted=True),
        nullable=False,
    )
    # Predicciones alternativas: [{"label": "...", "confidence": 0.12}]
    top_k: Mapped[list[dict] | None] = mapped_column(JSONB)

    # Ref lógica a consultations.id (módulo consultations). Se llena cuando
    # el caso se escala a un agrónomo.
    consultation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), unique=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    pest: Mapped["Pest | None"] = relationship(back_populates="diagnoses")