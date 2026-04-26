# System architecture and Docker Compose — concepts

This document captures the **learning-lab stack** (Postgres, FastAPI backend, Vite frontend, Keycloak) and how **`docker-compose.yml`** wires them. Each topic uses two voices:

- **In plain terms** — intuition-first, how you described it.
- **Professional language** — names senior engineers use in reviews, design docs, and incident postmortems.

Use it when you read **`docker-compose.yml`**, **`docker/backend/default.env`**, Dockerfiles, and app code: the same ideas appear everywhere with different spelling.

---

## Table of contents

1. [What this file is for](#1-what-this-file-is-for)
2. [The four applications and what they own](#2-the-four-applications-and-what-they-own)
3. [How the browser, API, DB, and IdP relate](#3-how-the-browser-api-db-and-idp-relate)
4. [CORS, middleware, and “real” security](#4-cors-middleware-and-real-security)
5. [Docker Compose and YAML](#5-docker-compose-and-yaml)
6. [Postgres service (compose lines 11–29)](#6-postgres-service-compose-lines-1129)
7. [Backend service (compose lines 31–44)](#7-backend-service-compose-lines-3144)
8. [Frontend service (compose lines 45–60)](#8-frontend-service-compose-lines-4560)
9. [Keycloak service (compose lines 62–75)](#9-keycloak-service-compose-lines-6275)
10. [Top-level `volumes` (compose lines 77–78)](#10-top-level-volumes-compose-lines-7778)
11. [What else Compose can define (beyond services + volumes)](#11-what-else-compose-can-define-beyond-services--volumes)
12. [Configuration: three different “env” mechanisms](#12-configuration-three-different-env-mechanisms)
13. [Networking mental model](#13-networking-mental-model)
14. [Senior checklist when reading this repo](#14-senior-checklist-when-reading-this-repo)

---

## 1. What this file is for

**In plain terms:**  
`docker-compose.yml` at the **lab root** is the **one place** that says “start Postgres, then API, then web, then Keycloak,” with ports and env so everything can talk.

**Professional language:**  
It is the **local orchestration manifest** for a **multi-container application**: declarative desired state, not a shell script of `docker run` commands. Same role as a slim **Helm chart** or **Kubernetes Deployment + Service** bundle, but for Docker Desktop / Compose.

**How to run (matches comments in the file):**

```bash
cd <lab-root>
docker compose --env-file docker/backend/default.env up --build
```

---

## 2. The four applications and what they own

| Piece | In plain terms | Professional language |
|--------|----------------|------------------------|
| **Frontend** | What the user sees and clicks; runs in the browser after the server sends HTML/JS/CSS. | **Presentation tier**, **SPA** (single-page app), **static asset delivery** (often nginx). |
| **Backend** | All business rules, validation, talking to the database, issuing JSON. The UI calls it over HTTP. | **Application / API tier**, **stateless** service (good practice: no sticky session files on disk). |
| **Postgres** | Where durable data lives (users, orders, etc.). | **System of record**, **OLTP** database, **ACID** transactions. |
| **Keycloak** | Login screens, tokens, “who is this user?” — an extra layer so not everyone can use the API/UI. | **Identity Provider (IdP)**, **OAuth 2.0 / OpenID Connect (OIDC)** authorization server, **JWT** issuer. |

**In plain terms:**  
The UI does not connect to Postgres directly. Only the backend does. That keeps secrets and SQL out of the browser.

**Professional language:**  
**Layered architecture** and **least privilege**: the browser is an untrusted client; the API is the **trust boundary** for data access.

---

## 3. How the browser, API, DB, and IdP relate

**In plain terms:**

- Your **browser** loads the frontend from something like `http://localhost:5173`.
- JavaScript in the browser calls the **backend** at `http://localhost:8000` (or whatever `VITE_API_BASE_URL` was at **build** time).
- The **backend** opens a TCP connection to **Postgres** using a connection string (host `postgres`, port `5432` inside Docker).
- **Keycloak** is another HTTP service; later phases wire the SPA to log in via OIDC and send **access tokens** to the API.

**Professional language:**

- **North–south traffic**: client → edge (browser → published ports on the host).
- **East–west traffic**: service → service inside the Docker network (e.g. `backend` → `postgres:5432`).
- **Service discovery**: Compose gives each service a **DNS name** equal to the **service key** (`postgres`, `backend`, …).

---

## 4. CORS, middleware, and “real” security

### CORS

**In plain terms:**  
The browser **blocks** some cross-origin responses unless the **API** sends headers that say “this frontend origin is allowed.” That is CORS. It is **not** a password.

**Professional language:**  
**Cross-Origin Resource Sharing** is a **browser-enforced** policy. It prevents **one website’s JavaScript** from reading another site’s responses. It does **not** authenticate callers; a `curl` script ignores CORS entirely.

### Middleware

**In plain terms:**  
“Middleware” is code that runs **around** your route handlers: add CORS headers, log requests, parse JWTs, reject bad input.

**Professional language:**  
**Middleware / filters / interceptors** — the **request pipeline**. Order matters (e.g. auth before business logic).

### Authentication (Keycloak / JWT)

**In plain terms:**  
Only **logged-in** users get a token; the backend checks the token before doing sensitive work.

**Professional language:**  
**Authentication** (who are you?) vs **authorization** (what may you do?). Tokens are **proof of authentication**; **scopes/roles** encode authorization. **OIDC** for login; **JWT** as a compact, signed bearer token (verify signature / expiry / audience).

---

## 5. Docker Compose and YAML

**In plain terms:**  
Compose reads a **YAML** file (indentation matters). You list **services** (containers you want) and **volumes** (disk that survives restarts).

**Professional language:**  
**Declarative IaC** for dev/stage stacks. The Compose Specification defines **`services`**, **`volumes`**, **`networks`**, **`configs`**, **`secrets`**, **`x-` extensions**, etc.

---

## 6. Postgres service (compose lines 11–29)

Reference: `docker-compose.yml` `postgres:` block.

### `image: postgres:15-alpine`

**In plain terms:**  
Download a ready-made Postgres from the internet (Docker Hub is one **store** for images).

**Professional language:**  
Pull an **OCI image** from a **container registry**. Pinning **15** avoids accidental major upgrades that break on-disk data directories.

### `container_name`

**In plain terms:**  
A fixed human-friendly name in `docker ps` and logs.

**Professional language:**  
Stable **operational identity**; in prod orchestrators you often prefer generated names + labels instead.

### `restart: unless-stopped`

**In plain terms:**  
**Not** the command that starts Postgres. It means: if the container exits or the machine reboots, Docker **starts it again**, unless you manually stopped it.

**Professional language:**  
**Restart policy**: `unless-stopped` vs `always` vs `on-failure` — controls **resilience** and **noise** during deploys.

### `env_file` + `environment`

**In plain terms:**  
Variables the **Postgres program** reads (database name, user, password). They can come from a file **and** from the explicit `environment:` map.

**Professional language:**  
**Configuration injection** via process environment. The `environment:` entries use `${VAR}` — those are filled by **Compose variable substitution** from the **shell environment of the `docker compose` process** (including values loaded via `docker compose --env-file ...`).

### `ports: "${POSTGRES_PORT:-5432}:5432"`

**In plain terms:**  
**Left** = port on your **Mac/PC**. **Right** = port **inside** the container (Postgres listens on 5432). If `POSTGRES_PORT` is unset, use 5432.

**Professional language:**  
**Host port publishing** / **NAT mapping**. Default syntax `${VAR:-default}` is **parameter expansion**.

### `volumes: postgres_data:/var/lib/postgresql/data`

**In plain terms:**  
Database files must **survive** when you delete and recreate the container. This attaches a **named disk** Docker manages.

**Professional language:**  
**Named volume** for **stateful** workload persistence. Unlike anonymous volumes, it has a stable name in the Compose project. Data lives in Docker’s volume store, not “inside” the ephemeral container layer.

**Why only Postgres (in this file)?**  
Only Postgres has **precious on-disk state** we declare here. Backend/frontend images are mostly **stateless**; losing their container filesystem is OK. You *could* add volumes for uploads, SQLite, etc.

### `healthcheck` + `pg_isready`

**In plain terms:**  
Compose can ask “is Postgres actually accepting connections?” not just “did the container start?”

**Professional language:**  
**Liveness/readiness-style probe** (Compose only models health as one check). `$$POSTGRES_USER` escapes `$` so Compose does not eat it — the shell inside the container sees `$POSTGRES_USER`.

### `depends_on` (on other services)

**In plain terms:**  
Backend waits until Postgres is **healthy** before starting (see backend block).

**Professional language:**  
**Startup ordering with readiness gating** — reduces **connection refused** races during boot.

---

## 7. Backend service (compose lines 31–44)

### `build: context` + `dockerfile`

**In plain terms:**  
We **build** our API from source because it is not a public image. `context: .` means “send the **whole lab folder** to Docker when building,” so paths in the Dockerfile match the repo.

**Professional language:**  
**Build context** is the directory sent to the daemon; **multi-stage** builds and **.dockerignore** control size and cache. **Immutable image** is the artifact; **container** is a running instance.

### Why `environment:` is optional here

**In plain terms:**  
`env_file: docker/backend/default.env` already puts `DATABASE_URL`, CORS settings, etc. into the container. The FastAPI app reads **environment variables** — it does not care whether they came from `env_file` or `environment:`.

**Professional language:**  
Explicit `environment:` is useful for **overrides**, **minimal surface area**, or **secrets from a vault**; `env_file` is convenient for **dev parity**. Avoid duplicating the same keys in two places unless you have a reason.

### `ports: "8000:8000"`

**In plain terms:**  
You reach the API from the browser at `localhost:8000`. Between containers, you would use hostname **`backend`** and port **8000** (same internal port).

**Professional language:**  
Published **Service** port vs **ClusterIP**-style internal DNS name (Compose’s embedded DNS).

### `depends_on: postgres: condition: service_healthy`

**In plain terms:**  
Wait for Postgres to be ready, not just “container exists.”

**Professional language:**  
**Orchestration dependency** with **health-based scheduling** (Compose subset; Kubernetes splits **liveness** vs **readiness** more formally).

---

## 8. Frontend service (compose lines 45–60)

### `build.args` and missing `env_file`

**In plain terms:**  
Vite **bakes** `VITE_*` values into the JavaScript at **`npm run build`** time. Changing env **after** the image is built does not change old JS. So Compose passes those values as **build arguments** during `docker build`.

**Professional language:**  
**Build-time configuration** vs **runtime configuration**. The artifact is **immutable static assets**. Runtime `env_file` on nginx would not rewrite the bundle (you’d need **server-side injection** or a **runtime config JSON** pattern to change API URL without rebuild).

### `ports: "5173:80"`

**In plain terms:**  
Inside the container, nginx listens on **80**; on your laptop you open **5173** so it does not fight other apps.

**Professional language:**  
**Non-standard host mapping** for developer ergonomics.

### `depends_on: backend`

**In plain terms:**  
Start the frontend container after the backend container starts (weak guarantee — no health condition here).

**Professional language:**  
**Best-effort startup order**; not a substitute for **retries** or **readiness** in the client.

---

## 9. Keycloak service (compose lines 62–75)

**In plain terms:**  
Another downloaded image. Admin user/password from env. `start-dev` is for **local development**, not production hardening.

**Professional language:**  
**Vendor image**, **bootstrap credentials**, **dev mode** vs **production mode** (TLS, hostname strictness, external DB, realm import, HA).

### `depends_on: postgres: healthy`

**In plain terms:**  
We only start Keycloak after Postgres is up. (Exact storage backend depends on Keycloak config; the important lesson is **declared dependencies**.)

---

## 10. Top-level `volumes` (compose lines 77–78)

**In plain terms:**  
The line `postgres_data:` **creates** the named volume the Postgres service mounts.

**Professional language:**  
**Named volume declaration** in the Compose **volume graph**; enables **`docker volume ls`** / backup stories.

**Not “the data of the whole system”:**  
Only what you mount there (here: Postgres data). Logs, uploads, metrics each need their own design.

---

## 11. What else Compose can define (beyond services + volumes)

**In plain terms:**  
For you today: **services** + **volumes** are enough. Later you may add **custom networks**, **secrets**, **configs**.

**Professional language:**  
Compose supports **`networks`** (isolation, aliases), **`secrets`** (Swarm / compatible flows), **`configs`**, **`profiles`**, **`extends`**, **`x-` anchors** for YAML reuse. Production often moves to **Kubernetes** with similar concepts under different names.

---

## 12. Configuration: three different “env” mechanisms

Confusion is normal — three layers:

| Mechanism | Who reads it | Typical use |
|-----------|----------------|---------------|
| **`docker compose --env-file path`** | **Compose CLI** | Substitute `${VAR}` in the YAML **before** containers run. |
| **`env_file:` on a service** | **Container process** | Inject many keys into **runtime** env inside that service. |
| **`build.args`** | **`docker build`** | Build-time only; used by Dockerfile `ARG` / frontend bundlers. |

**In plain terms:**  
Same word “env,” three different moments: **Compose parsing**, **container running**, **image building**.

**Professional language:**  
Separate **composition-time**, **build-time**, and **runtime** configuration planes; align with **12-factor app** where runtime config is env-based.

---

## 13. Networking mental model

**In plain terms:**

- **Browser** uses `localhost` + **published** ports (5173, 8000, 8080).
- **Container A → container B** uses **service names** (`postgres`, `backend`) and **internal** ports.

**Professional language:**

- **Loopback / localhost** is the host, not “inside” another container.
- **Bridge network** + **embedded DNS** for service names.
- **TLS termination** often happens at an **ingress** or **reverse proxy** in production.

---

## 14. Senior checklist when reading this repo

When you open a file, ask:

1. **Trust boundary** — Is this code running in the browser (untrusted) or server (trusted)?
2. **Config plane** — Compose-time, build-time, or runtime?
3. **State** — Stateless container vs volume-backed state?
4. **Failure mode** — What if Postgres is slow? (healthchecks, retries, backoff)
5. **Security** — CORS vs auth vs network policy vs secrets handling
6. **Observability** — Logs, metrics, trace IDs (future phases)
7. **Idempotency** — Can I run `up` twice safely? Migrations? seed scripts?
8. **Portability** — Will this break on another OS or only in CI? (paths, `localhost` vs `127.0.0.1`)

**File reading order for this lab:**

1. `docker-compose.yml` — topology and ports  
2. `docker/backend/default.env` — single source for local stack vars  
3. `docker/backend/Dockerfile` + `docker/backend/startup.sh` — how the API image boots  
4. `docker/frontend/Dockerfile` — how `VITE_*` enters the build  
5. `apps/backend/` — FastAPI routes, settings, DB session  
6. `apps/frontend/src/shared/config/env.ts` — browser-visible config  

---

## Related docs

- `CODEBASE-CONVENTIONS.md` — folder layout and naming when reading code  
- `LEARNING-ROADMAP.md` — ordered phases (Phase C Keycloak + JWKS wired in repo)  
- `README.md` — how to run the lab  
- `KEYCLOAK-LAYOUT.md` — `master` confidential client vs application realm for users  

---

## Glossary (one line each)

| Term | Meaning |
|------|--------|
| **Image** | Immutable template for a filesystem + default process. |
| **Container** | Running instance of an image. |
| **Volume** | Persistent storage managed by Docker (or bind-mount to host path). |
| **Registry** | Server hosting images (Docker Hub, Quay, ECR, …). |
| **Compose service** | Logical name + spec for one kind of container (may scale to replicas in Swarm; locally often one). |
| **OIDC** | Identity layer on OAuth2 — login + ID token claims. |
| **JWT** | Signed JSON token; verify issuer, audience, expiry, signature. |
| **CORS** | Browser policy for cross-origin **response visibility** to JS. |
| **Middleware** | Request pipeline hooks around handlers. |
| **Healthcheck** | Automated probe to decide if traffic/dependents should proceed. |
| **IdP** | Identity Provider — issues tokens, manages users/sessions. |

### Phase C (implemented in this lab)

**In plain terms:** Keycloak ships a **realm** file; Docker starts Keycloak and imports it. You log in on the Keycloak page; the React app gets tokens; the API checks the access token using Keycloak’s **public keys** (JWKS) so fake tokens fail.

**Professional language:**

- **Realm** `learning` + **public client** `learning-spa` (PKCE, `…/signin-callback`), auto-imported; **master** confidential **`backend-service`** via separate JSON + **Import client** (Admin API / user management — see `docker/keycloak/clients/README.md`).
- **SPA**: `react-oidc-context` + `oidc-client-ts` — Authorization Code flow; tokens in memory (dev-friendly; harden with BFF/cookies for production threat models).
- **Resource server**: FastAPI validates **RS256** JWTs via **JWKS** (`OIDC_JWKS_URL` in Compose points at `http://keycloak:8080/...` so the API container does not use `localhost` for Keycloak), while **`iss`** still matches the browser-facing issuer (`OIDC_ISSUER_URL`). Checks **`exp`** and **`azp`** (authorized party = SPA client id) because Keycloak’s default **`aud`** on access tokens is not always a dedicated API audience without mappers.

Next hardening steps (not required for the lab checkpoint): **audience mapper** for a dedicated API client, **refresh** + silent renew, **mTLS** / **DPoP**, and **Keycloak production mode** with external DB.
