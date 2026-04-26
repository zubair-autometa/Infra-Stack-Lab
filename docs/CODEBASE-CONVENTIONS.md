# Codebase layout and naming (this lab)

This document matches the structure under **Infra Stack Lab** (monorepo lab root). It is the professional default for a small full-stack monorepo: clear boundaries, scalable names, and tooling-friendly paths.

**Concepts (stack, Compose, CORS, env planes, networking):** see [`SYSTEM-AND-DOCKER-CONCEPTS.md`](./SYSTEM-AND-DOCKER-CONCEPTS.md) — dual “plain terms / professional language” explanations plus a senior **checklist for reading code and config**. Extend that file when you add phases (Keycloak OIDC, JWT verification, etc.).

**Keycloak `master` vs application realm (users + SPA vs confidential backend client):** see [`KEYCLOAK-LAYOUT.md`](./KEYCLOAK-LAYOUT.md).

## Top-level layout

| Path | Purpose |
|------|---------|
| `apps/` | Runnable applications (`frontend`, later `backend`). |
| `docs/` | Cross-cutting notes (conventions, ADRs, runbooks). |
| `LEARNING-ROADMAP.md` | Ordered execution plan. |
| `infra/` | (Phase G-H) Terraform and Kubernetes. |
| `docker-compose.yml` | **Root** multi-service stack (Postgres, API, UI, Keycloak). Run from the lab root. |
| `docker/backend/` | Backend image: `Dockerfile`, `startup.sh`, `default.env`, `dev.env.sample`. Build context is the **lab root**. |
| `docker/frontend/` | Frontend image: `Dockerfile`, `nginx.conf`, `startup.sh`, `default.env`, `dev.env.sample`. |
| `docker/nginx/` | Optional edge reverse-proxy examples (`proxy.conf.example`). |
| `docker/keycloak/` | `realm-learning.json` (auto-import **learning**), **`clients/`** (master **Import client** JSON), **`README.md`**. |
| `docker/dev.env.sample` | Umbrella sample for private stack overrides. |
| `.dockerignore` | Speeds root-context Docker builds (excludes `node_modules`, `.venv`, etc.). |

## Front-end app (`apps/frontend/`)

| Path | Purpose |
|------|---------|
| `src/main.tsx` | Browser entry point. |
| `src/app/` | Router composition and root app wiring. |
| `src/pages/` | Route-level pages (`HomePage`, `AppPage`). |
| `src/features/` | Domain UI by feature (`auth`, `system`). |
| `src/hooks/` | Cross-feature reusable hooks (empty for now). |
| `src/shared/config/` | Runtime/env config (`env.ts`). |
| `src/shared/services/` | HTTP/services (`healthService.ts`). |
| `src/shared/layout/` | App shell/layout components. |
| `src/styles/` | Global styling. |
| `.env.example` | Committed template only (no real secrets). |

## Naming conventions

- Folders: lowercase short names.
- Components/pages: `PascalCase.tsx`.
- Services/hooks utils: `camelCase.ts`.
- Vite browser env vars: `VITE_*` only.
- Import alias: `@/` maps to `src/`.

## Why hooks + services (your concern)

- `services` owns transport and API concerns (`fetch`, URLs, response parsing).
- `hooks` owns UI state transitions and lifecycle (`idle/loading/error/success`).
- Components stay focused on rendering and user interaction.
- This makes migration to React Query later straightforward without rewriting pages.
