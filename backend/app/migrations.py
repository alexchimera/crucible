from pathlib import Path

from alembic import command
from alembic.config import Config

from .database import get_database_url


BACKEND_DIR = Path(__file__).resolve().parents[1]


def run_migrations() -> None:
    alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", get_database_url())
    command.upgrade(alembic_cfg, "head")
