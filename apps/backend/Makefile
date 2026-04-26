.PHONY: venv install db-up db-down db-logs db-init db-seed run test lint

venv:
	python3 -m venv .venv

install:
	source .venv/bin/activate && pip install -e ".[dev]"

ROOT := $(abspath $(CURDIR)/../..)

db-up:
	cd $(ROOT) && docker compose up -d postgres

db-down:
	cd $(ROOT) && docker compose down

db-logs:
	cd $(ROOT) && docker compose logs -f postgres

db-init:
	source .venv/bin/activate && python scripts/init_db.py

db-seed:
	source .venv/bin/activate && python scripts/seed_db.py

run:
	source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	source .venv/bin/activate && python -m pytest -q

lint:
	source .venv/bin/activate && python -m ruff check .
