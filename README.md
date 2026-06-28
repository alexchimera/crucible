# Crucible

Crucible is an open-source, self-hostable web app for small-molecule design-data management.

## Prerequisites

- Docker Desktop or another Docker Engine with Compose v2
- Bun 1.3+ if you want to run the frontend outside Docker
- Python 3.12+ if you want to run the API outside Docker

## Quick Start

```sh
cp .env.example .env
docker compose up --build
```

The app will be available at:

- Web: http://localhost:5173
- API healthcheck: http://localhost:8000/health
- Postgres: localhost:5432

The Compose stack starts:

- `db`: PostgreSQL with the RDKit cartridge image and `CREATE EXTENSION rdkit` run during first initialization
- `api`: FastAPI served by Uvicorn with hot reload
- `web`: Vite React served by Bun with hot reload

## Development

Both application services mount source from your checkout:

- Edit files in `backend/app/`; Uvicorn reloads the API.
- Edit files in `frontend/src/`; Vite reloads the browser.

The frontend package manager, runtime, and task runner is Bun:

```sh
cd frontend
bun install
bun run dev
```

The committed `frontend/bun.lock` is Bun's text lockfile so dependency changes stay reviewable.

To run the API locally without Docker:

```sh
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS or Linux:

```sh
source .venv/bin/activate
```

Then install and run:

```sh
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment

Copy `.env.example` to `.env` and adjust values as needed. The defaults are suitable for local development.

`VITE_API_BASE_URL` must be browser-reachable, so the Docker default is `http://localhost:8000`.

## Production Web Image

The frontend Dockerfile includes a production target:

```sh
docker build --target prod -t crucible-web ./frontend
docker run --rm -p 4173:4173 crucible-web
```

That image installs with Bun, builds with Vite, and serves the static `dist/` output with Bun.
