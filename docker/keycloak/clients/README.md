# Master-realm client (separate file — your professional layout)

This folder holds a **client-only** JSON for realm **`master`**. It is **not** loaded by Docker `--import-realm` (that only applies full realm files such as `../realm-learning.json`). Keycloak does not reliably merge new clients into an already-existing `master` realm on every boot, so this file is meant for **one-time Import client** in the Admin Console.

## Why this pattern

| Piece | Role |
|-------|------|
| **`master` + confidential `backend-service`** | Your application holds the **client secret** and uses **client_credentials** to obtain a token, then calls **Keycloak Admin REST API** to create/update users in another realm. |
| **Application realm `learning`** | **End users** and the **public SPA** (`learning-spa`) — imported automatically from `../realm-learning.json`. |

## Steps (first time after `docker compose up`)

1. Open **Admin Console**: http://localhost:8080 — login **`admin` / `admin`** (from `docker/backend/default.env`).
2. Realm selector (top left): choose **`master`**.
3. **Clients** → **Import client** → browse to **`master-backend-service.json`** in this folder → confirm.
4. Open client **`backend-service`** → **Service account roles** → **Assign realm role** (or **Client roles** on `realm-management`) so this client may manage **`learning`** users.  
   - Minimum for user CRUD in `learning`: typically roles under client **`realm-management`** scoped to realm `learning` (exact names depend on Keycloak version; often **manage-users**, **view-users**, **query-users** on realm `learning`).  
   - For a **lab only** shortcut some teams assign **`admin`** from `realm-management` — **high privilege**; prefer fine-grained roles in real environments.
5. **Credentials** tab → if Keycloak regenerated the secret, copy it into **`KEYCLOAK_MASTER_CLIENT_SECRET`** in your private env file. Otherwise it should match the JSON: **`dev-master-backend-service-secret`**.
6. Your application uses **`client_id=backend-service`**, **`client_secret=...`**, **`grant_type=client_credentials`**, token URL:  
   `http://keycloak:8080/realms/master/protocol/openid-connect/token` (from inside Docker) or `http://localhost:8080/...` from the host.

Admin API base URL example: `http://keycloak:8080/admin/realms/learning/users` (Bearer = access token from step 6).

## Default dev secret (committed lab only)

| Variable | Value |
|----------|--------|
| `KEYCLOAK_MASTER_CLIENT_ID` | `backend-service` |
| `KEYCLOAK_MASTER_CLIENT_SECRET` | `dev-master-backend-service-secret` |

Set in `docker/backend/default.env` to match this file after import (unless Keycloak rotated the secret).
