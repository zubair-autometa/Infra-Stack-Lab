#!/bin/sh
set -e
cd /app

# Wait for Postgres (TCP) when running under Compose.
python <<'PY'
import os
import socket
import time

host = os.environ.get("PG_WAIT_HOST", "postgres")
port = int(os.environ.get("PG_WAIT_PORT", "5432"))
deadline = time.time() + 60
while time.time() < deadline:
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"Postgres is reachable at {host}:{port}")
            raise SystemExit(0)
    except OSError:
        time.sleep(1)
print("Timed out waiting for Postgres")
raise SystemExit(1)
PY

python scripts/init_db.py
python scripts/seed_db.py

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
