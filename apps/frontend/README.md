# Front-end (Phase A)

## Setup

```bash
cd apps/frontend
cp .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Docker (full stack)

From the monorepo **lab root** (folder that contains `docker-compose.yml`):

```bash
docker compose --env-file docker/backend/default.env up --build
```

UI is served on **http://localhost:5173** (nginx inside the container maps to host port 5173). Docker assets live under `docker/frontend/` (see `docker/frontend/README.md`).

## Current env vars

- `VITE_APP_NAME` - UI branding text.
- `VITE_STAGE` - stage label in shell (`local`, `test`, `live`).
- `VITE_API_BASE_URL` - FastAPI base URL (`http://localhost:8000` in Phase B).
- `VITE_ENABLE_APP_ROUTE` - toggle `/app` placeholder route.
- `VITE_AUTH_ENABLED` - reserved for Phase C Keycloak toggle.

## Scripts

- `npm run dev` - dev server
- `npm run build` - typecheck + production build
- `npm run lint` - eslint
- `npm run typecheck` - typescript check only
