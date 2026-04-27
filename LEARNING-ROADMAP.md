# Infra Stack Lab — step-by-step roadmap

**Project folder:** `stack-learning-lab/` (repository root on disk; docs also say “lab root”).  
**Purpose:** Build an end-to-end **full-stack + Keycloak + Docker + (later) cloud** learning system in a **verifiable order**, using the [devops-handbook](../../devops-handbook/) as the **concept map** (files 01–10). Each phase below has **what to do**, **which handbook section it reinforces**, **how to test it**, and **how you know you are done**.

**Handbook file → topic (quick map)**  
| # | File | You practice |
|---|------|----------------|
| 01 | `01-gingerdesk-infra-and-scaffold.md` | What lives where: app vs infra repo; mental model of Git → images → cluster |
| 02 | `02-architecture-and-tech-stack.md` | End-to-end request path, C4-style vocabulary |
| 03 | `03-docker-and-containers.md` | Images, registries, non-root, health, resource mindset |
| 04 | `04-kubernetes.md` | Pods, Services, Ingress, config/secrets, failure modes |
| 05 | `05-cicd-github-actions.md` | Environments, OIDC, promote test → live |
| 06 | `06-security-auth-keycloak.md` | Realms, clients, PKCE, JWT validation, threats |
| 07 | `07-data-postgres.md` | Migrations, pooling, backups mindset |
| 08 | `08-cloud-aws-and-gcp.md` | GCP mapping: VPC, GKE, IAM, Secret Manager, OIDC to GCP |
| 09 | `09-architecture-styles-reference.md` | Modular monolith first; when to split services |
| 10 | `10-senior-devops-operational-excellence.md` | SLOs, logs/metrics/traces, incidents, cost |

**Execution order (as requested):** front-end first → back-end → Keycloak → Docker → devops/infra/CI-CD → GCP and Kubernetes. Earlier steps stay small and testable; later steps compose them.

**Where this repo is now (high level):** Phases **A–D** and remote **Git** are in place. **Phase F1:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) on `main` and PRs. **Phase F2 (registry):** [`.github/workflows/publish-images.yml`](.github/workflows/publish-images.yml) pushes API + web images to **GHCR** after green CI on a **push** to `main`. **Phase E2** (rulesets / branch protection) you configure in GitHub. **Still ahead:** deploy to a **test** environment (F2 smoke), **live** gates (F3), **GCP + WIF** (G), **Kubernetes** (H) — follow the sections below.

---

## Phase A — Front-end (React) only

**Implementation path in this repo:** `apps/frontend/` (Vite + React + TypeScript). Conventions: `docs/CODEBASE-CONVENTIONS.md`.

**Handbook focus:** 02 (request path, SPA role), 09 (BFF / layering options — awareness only for now)

### Step A1 — Scaffold and run the UI locally

- **Do:** Create a minimal React app (Vite or CRA) with a single page: app title, “health” section that will later call the API, and a placeholder for “signed in as …”.
- **Test:** `npm install` / `npm run dev` (or your package manager) opens in browser; no console errors; hot reload works.
- **Done when:** You can explain in one minute what the browser loads (HTML, JS bundle, static assets) and where API calls *will* go (still placeholder).

### Step A2 — Add a “backend URL” config (no real auth yet)

- **Do:** Use env-based API base URL (e.g. `VITE_API_URL` or `REACT_APP_API_URL`). Add a “Ping API” button that will call `GET /health` once the back-end exists; until then, show a clear “not connected” state.
- **Test:** Change the env var, rebuild/restart, confirm the UI shows the new base URL in dev (or a small debug readout in non-prod only).
- **Done when:** No hard-coded API URLs in components; you understand build-time vs runtime env for SPAs (handbook 02).

### Step A3 — (Optional but valuable) Add routing and a simple “protected” view placeholder

- **Do:** e.g. React Router: `/` public, `/app` “protected” (for now, just a static message).
- **Test:** Direct navigation to routes works; refresh on `/app` works if you configure the dev server (SPA fallback).
- **Done when:** You are ready to plug in Keycloak redirect for `/app` in Phase C (handbook 06 preview).

**Phase A checkpoint:** A runnable front-end, configurable API base, no back-end required.

---

## Phase B — Back-end (FastAPI) and PostgreSQL (local)

**Handbook focus:** 02 (full path), 07 (Postgres, migrations, pooling at a high level), 09 (modular monolith: keep API in one service first)

### Step B1 — FastAPI “health” and config

- **Do:** FastAPI app with `GET /health` returning JSON (`{"status":"ok"}`). Use `pydantic-settings` (or similar) for config: DB URL, CORS origins, later Keycloak issuer URL as optional.
- **Test:** `uv run` or `uvicorn` locally; `curl http://localhost:8000/health` returns 200; wrong port fails predictably.
- **Done when:** CORS allows your local front-end origin (handbook 02 — browser → API).

### Step B2 — PostgreSQL: connect and one real table

- **Do:** Run Postgres locally (native or Docker is fine for this step — full container story comes in Phase D). Add SQLAlchemy (or async equivalent), one table (e.g. `users` or `notes`) with a migration tool (Alembic).
- **Test:** Apply migrations; insert a row via a small `GET`/`POST` or a seed script; restart API and data persists.
- **Done when:** You can state where the **system of record** is (Postgres) vs ephemeral API memory (handbook 07).

### Step B3 — Expose 1–2 API routes the front-end will use

- **Do:** e.g. `GET /api/me` returning 401 without token (Keycloak not wired yet) or 200 with a stub. Align JSON shape with the React app.
- **Test:** `curl` without auth gets 401; with a temporary fake header (optional dev-only) or stub, returns JSON the UI can show.
- **Done when:** Contract between front-end and back-end is stable enough to freeze for Phase C (handbook 02, contracts).

**Phase B checkpoint:** API + DB working locally; front-end can ping `/health` and optionally show 401/JSON from `/api/me`.

---

## Phase C — Keycloak (auth) and wire browser + API

**Handbook focus:** 06 (Keycloak, OIDC, PKCE, JWT validation), 02 (auth in the request path), 10 (threats: XSS and token handling at a high level)

### Step C1 — Run Keycloak locally (or container) and create realm + clients

- **Do:** One realm (e.g. `learning`), two clients: public SPA (PKCE), confidential or separate client for the API (audience). Note issuer URL, client IDs, and redirect URIs.
- **Test:** Log in via Keycloak account console or a simple OIDC test; tokens appear in the auth flow; JWKS URL loads in browser or `curl`.
- **Done when:** You can list **iss**, **aud** (intent), and which client is public vs confidential (handbook 06).

### Step C2 — Front-end: Authorization Code + PKCE

- **Do:** Use a well-maintained OIDC client (e.g. oidc-client-ts / react-oidc-context). After login, store tokens per your threat model (memory vs secure cookie/BFF is a later hardening pass — handbook 06, 10).
- **Test:** Login redirects work on `localhost` callbacks; token refresh or re-login path works; logout clears state.
- **Done when:** User can log in and the UI shows “signed in as …” (claims from ID token or userinfo).

### Step C3 — Back-end: validate JWTs (JWKS)

- **Do:** Validate `iss`, `aud`, `exp`, signature using Keycloak’s JWKS. Map roles/scopes to authorization for `/api/me` or a sample protected route.
- **Test:** Valid Bearer token from Keycloak returns 200; tampered token, wrong audience, or expired token returns 401 with clear reason in logs (not to client).
- **Done when:** You can **draw** browser → Keycloak → API with tokens (handbook 02, 06).

**Phase C checkpoint:** E2E local auth: React → Keycloak → FastAPI validates JWT → optional DB read for `/api/me`.

**Implemented in this repo:** realm import `docker/keycloak/realm-learning.json` (Compose `keycloak` service + `--import-realm`); SPA `react-oidc-context` with PKCE; `/api/me` validates JWT via PyJWT + JWKS and enforces `azp=learning-spa`. See `README.md` (Phase C auth table).

---

## Phase D — Dockerise (compose the full local “system”)

**Handbook focus:** 03 (images, non-root, health, immutable tags), 07 (DB in compose), 01 (separate app build vs “stack” run)

**Stack file in this repo:** `docker-compose.yml` at the **lab root** (run with `docker compose --env-file docker/backend/default.env up --build` from that folder).

### Step D1 — Dockerfile for API and optional Dockerfile for static front-end

- **Do:** Multi-stage builds; run API as non-root; document exposed port; set `HEALTHCHECK` or rely on K8s probes later.
- **Test:** `docker build` succeeds; `docker run` with env for DB and Keycloak URLs; `curl` to `/health` works from host.
- **Done when:** Image runs without the repo mounted (true portability — handbook 03).

### Step D2 — `docker-compose` (or Compose Spec) for: frontend, API, Postgres, Keycloak

- **Do:** One command brings up the stack; named volumes for Postgres; environment files **not** committed (`.env.example` committed only).
- **Test:** `docker compose up`, open UI, sign in, hit API; `docker compose down` and up again: DB volume persists; cold start documented.
- **Done when:** A new machine can follow your README: copy env from example, compose up, and pass the same manual test (handbook 03, 01).

**Phase D checkpoint:** The **application** is containerized; you are no longer depending on “works on my laptop” without images.

---

## Phase E — Repository layout, Git, and “infra vs app” (devops foundation)

**Handbook focus:** 01 (where things live), 09 (keep boundaries clear)

### Step E1 — Split or structure repos clearly

- **Do:** Either monorepo (`apps/frontend`, `apps/backend`, `infra/terraform`, `infra/k8s`) or two repos (app + infra). Align with your org’s blueprint / reference repo tree if you have one.
- **Test:** Clean clone, follow README, local and compose flows still work.
- **Done when:** You can say which repo owns **Dockerfiles** vs **GKE YAML** vs **Terraform** (handbook 01).

### Step E2 — Branching and “definition of done” for PRs

- **Do:** `main` protected; each PR runs lint + unit tests; document release tags for images.
- **Test:** Open a test PR; checks fail on intentional lint break, pass when fixed.
- **Done when:** Team-of-one still behaves like a real team: no green merge without checks (handbook 05 preflight).

**Phase E checkpoint:** The project is **packaged and governed** like production software, before cloud.

---

## Phase F — CI (GitHub Actions) first, then CD to “test”

**Handbook focus:** 05 (workflows, environments, OIDC, promotion), 03 (scan images), 10 (CI is not security forever)

**Concepts in this repo:** Read **[docs/CI-CD-CONCEPTS.md](docs/CI-CD-CONCEPTS.md)** for CI vs CD, workflow/job/step/runner vocabulary, what `ci.yml` does, branch protection, and how pipeline work connects to Docker and cluster deploys later.

### Step F1 — CI: lint, test, build images on every PR

- **Do:** Workflow jobs for front-end, back-end, optional Terraform `fmt`/`validate` if present. Tag images with `git sha`.
- **Test:** Open PR with a failing test; pipeline fails. Fix; pipeline green.
- **Done when:** Artifact: published images in a registry (can be GHCR for learning first, then move to Artifact Registry in Phase G — handbook 05, 08).

### Step F2 — CD to **test** environment (manual or on merge to `main`)

- **Do:** Use GitHub Environments (`test`); **no long-lived cloud keys** — plan for OIDC to GCP in Phase G. For early learning, you may use a short-lived WIF flow only when GCP is ready (handbook 05, 08).
- **Test:** Push image → deploy to test → run smoke: `/health` and one authenticated call.
- **Done when:** “test” is reproducible: same image tag redeploys identically (handbook 05).

### Step F3 — Promote to **live** (gate)

- **Do:** `live` environment with **required reviewers**; promote only by approval or tag.
- **Test:** Intentional failed deploy; rollback procedure documented and rehearsed (see Phase I).
- **Done when:** You have controlled promotion **test → live** (handbook 05, blueprint §7).

**Phase F checkpoint:** CI/CD exists; credentials strategy must stay aligned with WIF in GCP (next phase).

---

## Phase G — GCP (Terraform) and registry

**Handbook focus:** 08 (GCP services mapping), 01 (Terraform as source of cloud shape)

### Step G1 — Terraform: project, VPC, GKE, Artifact Registry, IAM basics

- **Do:** Smallest viable node pool for learning; private cluster if you accept complexity; **budget alerts** (blueprint §8, handbook 10 on cost).
- **Test:** `terraform plan` in CI; `apply` in a dedicated step; `gcloud`/`kubectl` can reach cluster with least-privilege.
- **Done when:** You can name what each of VPC, GKE, AR, and IAM are for in your system (handbook 08, 10).

### Step G2 — GitHub OIDC → Google Workload Identity Federation

- **Do:** No JSON keys in GitHub. Federation trust from GitHub to a dedicated GCP service account; narrow permissions (push to AR, deploy to GKE) (handbook 05, 08).
- **Test:** A workflow that only authenticates and lists artifacts or `kubectl` version without keys.
- **Done when:** Secret inventory has **no** static cloud keys in GitHub (handbook 05, 10 — secret rotation story).

**Phase G checkpoint:** Cloud account is **as code**, and CI authenticates the **right** way.

---

## Phase H — Kubernetes (GKE) deployment

**Handbook focus:** 04 (workloads, networking, storage, add-ons), 03 (probes, limits), 07 (External Secrets to DB creds), 06 (Keycloak on cluster vs external — trade-offs)

### Step H1 — Namespaces, Deployments, Services, ConfigMaps, Secrets (or External Secrets)

- **Do:** Kustomize or Helm (pick one, stay consistent). Deploy API + front-end (or static on bucket + CDN if you choose); Ingress with TLS (cert-manager) when ready; DB: prefer **managed Cloud SQL** for prod-like; for lab, a minimal path is allowed if documented as non-prod only (handbook 07).
- **Test:** `kubectl get pods,svc,ingress` all healthy; probes green; HPA optional.
- **Done when:** Public HTTPS URL returns UI; API health OK behind same host or API subdomain (handbook 04, 02).

### Step H2 — Observability hook

- **Do:** At minimum, structured logs to Cloud Logging; metrics endpoint for API; one dashboard or query saved (handbook 10, blueprint Phase 6).
- **Test:** Force a 500; find it in logs with correlation id; fix forward.
- **Done when:** You can answer “what broke?” without SSH-only debugging (handbook 10).

**Phase H checkpoint:** The same containers from Phase D run on **GKE** with a believable **ops** story.

---

## Phase I — Hardening, SLO, and “senior” closure

**Handbook focus:** 10 (SLO, incidents, runbooks, cost, compliance awareness), 09 (revisit: stay modular monolith until pressure justifies split)

### Step I1 — Secrets: Secret Manager + External Secrets; rotate one secret

- **Do:** Move DB password or client secret to Secret Manager; change value; pod picks up and app works (mechanics depend on ESO version).
- **Test:** Documented rotation; no Git commit of secrets.
- **Done when:** You satisfy blueprint “rotate a secret without code changes” (blueprint §10).

### Step I2 — SLO draft + runbook

- **Do:** One critical journey (e.g. sign-in and load home); define SLI/SLO; write one runbook: roll back deployment, keycloak down, db connection failures (handbook 10).
- **Test:** Tabletop: simulate failure, follow runbook, fix; time-box and note gaps.
- **Done when:** You can explain error budget in plain language (handbook 10).

### Step I3 — Architecture decision record (ADR)

- **Do:** e.g. “Why Kustomize vs Helm” or “Why public vs private cluster for lab”. One page: context, decision, consequences.
- **Done when:** ADR-001 or ADR-002 exists (blueprint Phase 0, §10 handbooks).

**Final acceptance (aligned with blueprint “Definition of Done”):**  
You can **explain** the path browser → Keycloak → API → DB; **deploy** test and **promote** live from pipelines; **rotate** a secret; **roll back** a bad deploy; **query** logs for a bad endpoint; keep **one ADR** and **one** incident or drill write-up (even simulated).

---

## Folder name (on disk)

| Name | Why |
|------|-----|
| **`stack-learning-lab/`** (current) | Neutral repo folder name; safe place to break things and learn. |
| **Alternative: `e2e-devops-handbook-lab`** | Puts the handbook-first learning goal in the name. |

Use this roadmap as the **ordered checklist**; the [devops-handbook](../../devops-handbook/) files 01–10 are the **depth reading** at each phase.
