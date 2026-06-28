"""Initial schema.

Revision ID: 20260628_0001
Revises:
Create Date: 2026-06-28
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260628_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "project",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
    )
    op.create_table(
        "compound",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("smiles_canonical", sa.Text(), nullable=False),
        sa.Column("inchikey", sa.String(length=27), nullable=False),
        sa.Column("molblock", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("inchikey", name="uq_compound_inchikey"),
    )
    op.create_table(
        "report",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"]),
    )
    op.create_table(
        "column_def",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=16), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.CheckConstraint("type in ('structure', 'number', 'text')", name="ck_column_def_type"),
        sa.ForeignKeyConstraint(["report_id"], ["report.id"]),
    )
    op.create_table(
        "report_row",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("compound_id", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["compound_id"], ["compound.id"]),
        sa.ForeignKeyConstraint(["report_id"], ["report.id"]),
    )
    op.create_table(
        "cell_value",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("row_id", sa.Integer(), nullable=False),
        sa.Column("column_id", sa.Integer(), nullable=False),
        sa.Column("value_num", sa.Float(), nullable=True),
        sa.Column("value_text", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["column_id"], ["column_def.id"]),
        sa.ForeignKeyConstraint(["row_id"], ["report_row.id"]),
    )


def downgrade() -> None:
    op.drop_table("cell_value")
    op.drop_table("report_row")
    op.drop_table("column_def")
    op.drop_table("report")
    op.drop_table("compound")
    op.drop_table("project")
