# Infra Stack Lab

**On disk:** clone or `cd` into the folder **`stack-learning-lab/`** (this repo root).

Monorepo layout:

- `apps/frontend` — Vite + React + TypeScript
- `apps/backend` — FastAPI + SQLAlchemy + Postgres (application source only)
- `docker/backend` — Backend container build (`Dockerfile`, `startup.sh`)
- `docker-compose.yml` — Full stack (root)

## CI (GitHub Actions)

On every push and pull request to **`main`**, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs:

- **Backend:** `uv sync --frozen`, Ruff, pytest (`apps/backend`)
- **Frontend:** `npm ci`, ESLint, production build (`apps/frontend`)
- **Docker:** `docker build` for `docker/backend/Dockerfile` and `docker/frontend/Dockerfile` (image build verification; no push to a registry yet — that is Phase **F1**/registry work in the roadmap).

**Branch protection (Phase E2, manual in GitHub):** Settings → Branches → add a rule for `main` → require the **CI** workflow to pass before merge, and optionally require a pull request.

## Documentation

- **[CI/CD concepts](docs/CI-CD-CONCEPTS.md)** — CI vs CD, GitHub Actions vocabulary (workflow, job, runner), what `.github/workflows/ci.yml` does, branch protection, and how this connects to Docker and Kubernetes later.
- **[System + Docker Compose concepts](docs/SYSTEM-AND-DOCKER-CONCEPTS.md)** — roles of each service, CORS vs auth, `env_file` vs build args, volumes, healthchecks, and a senior checklist for reading this repo.
- **[Keycloak realm layout](docs/KEYCLOAK-LAYOUT.md)** — `master` confidential client vs application realm for users (your model vs what the repo imports).
- **[Codebase conventions](docs/CODEBASE-CONVENTIONS.md)** — folder layout and naming.

## Run everything with Docker Compose

From **this directory** (monorepo lab root). Devops defaults live in `docker/backend/default.env`:

```bash
docker compose --env-file docker/backend/default.env up --build
```

Then open:

- **Web UI:** http://localhost:5173 — sign in with **Keycloak** (Authorization Code + PKCE). After login, home shows **GET /api/me** with a validated JWT.
- **API health:** http://localhost:8000/health
- **Keycloak admin console:** http://localhost:8080 — master admin `admin` / `admin` (dev only).

### Phase C auth (realm import)

On first start, Keycloak imports `docker/keycloak/realm-learning.json` (`--import-realm`):

| Item | Value |
|------|--------|
| Realm | `learning` |
| Public SPA client | `learning-spa` (PKCE S256) |
| Sample user | `learner` / `learner` |
| Master confidential client (import file → Admin Console) | `backend-service` / secret `dev-master-backend-service-secret` (see `docker/keycloak/README.md` + `clients/README.md`) |
| Issuer (JWT `iss`, Vite authority) | `http://localhost:8080/realms/learning` |
| OIDC redirect | `http://localhost:5173/signin-callback` (must match client **Valid redirect URIs**) |

The API checks **JWKS** signature, `iss`, `exp`, and **`azp` = `learning-spa`**. In Compose, **`OIDC_JWKS_URL`** points at `http://keycloak:8080/...` so the backend container can reach Keycloak while JWT **`iss`** stays `http://localhost:8080/realms/learning` (what the browser sees). Tune `OIDC_*` in `docker/backend/default.env` if you rename the client or hostnames.

Realm **`learning`** (users + SPA) is **auto-imported**. The **admin / backend** confidential client is a **separate JSON** (`docker/keycloak/clients/master-backend-service.json`): **Import client** once into realm **`master`**, assign **service account roles**, then use the secret in the app (`KEYCLOAK_MASTER_CLIENT_*`). Details: **`docker/keycloak/README.md`** and **`docs/KEYCLOAK-LAYOUT.md`**.

Optional overrides:

```bash
cp docker/dev.env.sample docker/.env.local
docker compose --env-file docker/backend/default.env --env-file docker/.env.local up --build
```

**Keycloak `backend-service` client secret (realm `master`):** put it in **`docker/backend/.env.local`** as `KEYCLOAK_MASTER_CLIENT_SECRET=...` (file is gitignored). The **backend** service loads that file automatically when it exists (`docker-compose.yml` optional `env_file`). Do **not** commit real secrets into `docker/backend/default.env`.

### Notes

- The UI is built with `VITE_API_BASE_URL` pointing at **your host** (`http://localhost:8000`) so the browser can call the API from outside the containers.
- OIDC settings (`VITE_OIDC_*`, `VITE_AUTH_ENABLED`) are **baked in at image build time** for the nginx UI image; change `docker/backend/default.env` and rebuild the frontend service to change them.
- FastAPI CORS allows `http://localhost:5173` by default (override with `CORS_ORIGINS` in env).

### Stop

```bash
docker compose down
```

To reset the database volume (destructive):

```bash
docker compose down -v
```

The Postgres database name is **`stack_lab`**. If an older volume still had a **different** database name, remove the volume with the command above so Postgres can recreate `stack_lab`.
