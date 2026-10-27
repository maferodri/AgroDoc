"""Modelos SQLAlchemy del módulo consultations.

Tablas del slice: `consultations`, `consultation_messages`.
Se importan desde `alembic/env.py` para que `--autogenerate` las detecte.

Reglas del slice:
- Solo este módulo lee y escribe estas tablas.
- `diagnosis_id`, `requester_id`, `agronomist_id` y `author_id` son **refs
  lógicas** a `users` (auth) y `diagnoses` (diagnosis): se guardan como UUID
  SIN FOREIGN KEY para no acoplar los esquemas (ver docs/base-de-datos.md §2).
- La única FK real es `consultation_messages.consultation_id → consultations.id`
  (mismo módulo).
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

CONSULTATION_STATUSES = ("open", "assigned", "answered", "closed", "cancelled")
MESSAGE_AUTHOR_ROLES = ("farmer", "agronomist")


class Consultation(Base):
    __tablename__ = "consultations"
    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'assigned', 'answered', 'closed', 'cancelled')",
            name="status_valid",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    # Ref lógica a diagnoses.id (módulo diagnosis). Sin FK.
    diagnosis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, unique=True
    )
    # Ref lógica a users.id (módulo auth). Sin FK.
    requester_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    # Ref lógica a users.id (módulo auth). Nullable: el caso nace sin agrónomo.
    agronomist_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="open", server_default="open"
    )

    # Copia del diagnóstico (para que el agrónomo vea el caso sin tocar diagnosis).
    image_path: Mapped[str] = mapped_column(Text, nullable=False)
    model_label: Mapped[str] = mapped_column(String(255), nullable=False)
    model_confidence: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)

    # Respuesta del agrónomo (nullable: solo existe cuando ya respondió).
    verified_label: Mapped[str | None] = mapped_column(String(255))
    model_was_correct: Mapped[bool | None] = mapped_column(Boolean)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    messages: Mapped[list["ConsultationMessage"]] = relationship(
        back_populates="consultation",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ConsultationMessage.created_at",
    )


class ConsultationMessage(Base):
    __tablename__ = "consultation_messages"
    __table_args__ = (
        CheckConstraint(
            "author_role IN ('farmer', 'agronomist')",
            name="author_role_valid",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    # FK real: misma tabla del módulo (consultations).
    consultation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Ref lógica a users.id (módulo auth). Sin FK.
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    author_role: Mapped[str] = mapped_column(String(20), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    consultation: Mapped["Consultation"] = relationship(back_populates="messages")