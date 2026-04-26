# Docker — backend image

- `Dockerfile` — builds the FastAPI image (build context: **lab root**).
- `startup.sh` — waits for Postgres, runs DB init + seed, starts **uvicorn**.
- `default.env` — committed defaults for Compose and devops-related variables (DB, CORS, Keycloak placeholders, etc.).
- `dev.env.sample` — template for **local overrides** (copy to a private file, never commit secrets).

Run the full stack from the **lab root**:

```bash
docker compose --env-file docker/backend/default.env up --build
```
