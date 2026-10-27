"""auth: users updated_at trigger

Revision ID: 1feb0ddd1042
Revises: bb6a041e7292
Create Date: 2026-10-26 23:17:15.800121

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1feb0ddd1042'
down_revision: str | None = 'bb6a041e7292'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Función genérica: la reutilizarán otras tablas (crop_events, consultations...)
    op.execute(
        """
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS trigger AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    # Trigger específico de users
    op.execute(
        """
        CREATE TRIGGER trg_users_set_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;")
    op.execute("DROP FUNCTION IF EXISTS set_updated_at();")