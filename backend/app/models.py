from __future__ import annotations

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


COLUMN_TYPES = ("structure", "number", "text")


class Project(Base):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    reports: Mapped[list[Report]] = relationship(back_populates="project")


class Report(Base):
    __tablename__ = "report"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    project: Mapped[Project] = relationship(back_populates="reports")
    rows: Mapped[list[ReportRow]] = relationship(back_populates="report")
    columns: Mapped[list[ColumnDef]] = relationship(back_populates="report")


class Compound(Base):
    __tablename__ = "compound"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    smiles_canonical: Mapped[str] = mapped_column(Text, nullable=False)
    inchikey: Mapped[str] = mapped_column(String(27), nullable=False, unique=True)
    molblock: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    rows: Mapped[list[ReportRow]] = relationship(back_populates="compound")


class ReportRow(Base):
    __tablename__ = "report_row"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("report.id"), nullable=False)
    compound_id: Mapped[int] = mapped_column(ForeignKey("compound.id"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    report: Mapped[Report] = relationship(back_populates="rows")
    compound: Mapped[Compound] = relationship(back_populates="rows")
    cells: Mapped[list[CellValue]] = relationship(back_populates="row")


class ColumnDef(Base):
    __tablename__ = "column_def"
    __table_args__ = (
        CheckConstraint("type in ('structure', 'number', 'text')", name="ck_column_def_type"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("report.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(16), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    report: Mapped[Report] = relationship(back_populates="columns")
    cells: Mapped[list[CellValue]] = relationship(back_populates="column")


class CellValue(Base):
    __tablename__ = "cell_value"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    row_id: Mapped[int] = mapped_column(ForeignKey("report_row.id"), nullable=False)
    column_id: Mapped[int] = mapped_column(ForeignKey("column_def.id"), nullable=False)
    value_num: Mapped[float | None] = mapped_column(Float)
    value_text: Mapped[str | None] = mapped_column(Text)

    row: Mapped[ReportRow] = relationship(back_populates="cells")
    column: Mapped[ColumnDef] = relationship(back_populates="cells")
