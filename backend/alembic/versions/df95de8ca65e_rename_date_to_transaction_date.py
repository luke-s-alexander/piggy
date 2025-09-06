"""rename_date_to_transaction_date

Revision ID: df95de8ca65e
Revises: 001
Create Date: 2025-09-06 14:51:51.753109

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'df95de8ca65e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename the column from 'date' to 'transaction_date'
    op.alter_column('transactions', 'date', new_column_name='transaction_date')


def downgrade() -> None:
    # Rename the column back from 'transaction_date' to 'date'
    op.alter_column('transactions', 'transaction_date', new_column_name='date')