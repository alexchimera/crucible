from sqlalchemy import select

from .database import SessionLocal
from .models import Project, Report


DEFAULT_PROJECT_NAME = "Default Project"
DEFAULT_REPORT_NAME = "Empty Report"


def seed_default_data() -> None:
    with SessionLocal() as session:
        project = session.scalar(
            select(Project).where(Project.name == DEFAULT_PROJECT_NAME).limit(1)
        )
        if project is None:
            project = Project(name=DEFAULT_PROJECT_NAME)
            session.add(project)
            session.flush()

        report = session.scalar(
            select(Report)
            .where(
                Report.project_id == project.id,
                Report.name == DEFAULT_REPORT_NAME,
            )
            .limit(1)
        )
        if report is None:
            session.add(Report(project_id=project.id, name=DEFAULT_REPORT_NAME))

        session.commit()
