# Back-end (Phase B)

FastAPI service for the learning lab.

## 1) Setup

```bash
cd apps/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

## 2) Start local Postgres (Docker)

Postgres is defined in the **repo root** `docker-compose.yml` (not under `apps/backend/`).

From the **lab root**:

```bash
docker compose up -d postgres
```

Check health:

```bash
docker compose ps
```

## 3) Initialize and seed DB

```bash
source .venv/bin/activate
python scripts/init_db.py
python scripts/seed_db.py
```

## 4) Run API

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 5) Verify persistence

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/users

curl -X POST http://localhost:8000/api/users   -H 'Content-Type: application/json'   -d '{"email":"john@example.com","full_name":"John Doe"}'

curl http://localhost:8000/api/users
```

If the second `GET /api/users` includes `john@example.com`, persistence is working.

## Optional Make targets

```bash
make db-up
make db-init
make db-seed
make run
```

## Full stack (API + UI + Postgres + Keycloak)

See the lab root `README.md` (`docker compose up --build`).
