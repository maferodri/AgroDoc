"""diagnosis: tratamientos con recomendación, dosis y prioridad

Revision ID: c3d2e1f0a9b8
Revises: 7b3f9c2e1a54
Create Date: 2026-11-17 10:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c3d2e1f0a9b8'
down_revision: str | None = '7b3f9c2e1a54'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # La tabla aún no tiene filas (el seed llega en la revisión siguiente),
    # por lo que las columnas NOT NULL se pueden añadir sin server_default.
    op.add_column('treatments', sa.Column('recommendation', sa.Text(), nullable=False))
    op.add_column('treatments', sa.Column('dose', sa.Text(), nullable=True))
    op.add_column('treatments', sa.Column('priority', sa.String(length=10), nullable=False))
    op.create_check_constraint(
        'ck_treatments_priority_valid',
        'treatments',
        "priority IN ('alta', 'media', 'baja')",
    )


def downgrade() -> None:
    op.drop_constraint('ck_treatments_priority_valid', 'treatments', type_='check')
    op.drop_column('treatments', 'priority')
    op.drop_column('treatments', 'dose')
    op.drop_column('treatments', 'recommendation')
