# Keycloak layout — professional split (master admin client vs user realm)

This matches the workflow you described: **one separate client file** for **`master`**, **users in a new realm**, app uses **secret + Admin API** to manage those users.

---

## In plain terms

1. You keep a **JSON file that only describes the confidential client** (not the whole user realm).
2. In Keycloak you select realm **`master`**, use **Import client**, and that client appears in **`master`** with a **client secret**.
3. You give that client’s **service account** the right **admin-style roles** so it may manage users in the **other realm** (here: **`learning`**).
4. Your **application** stores **`client_id` + `client_secret`**, calls **token** (`client_credentials`), then calls **Keycloak Admin REST** (e.g. create user in realm `learning`).

**Users** (logins like `learner`) live only in the **application realm**. They do **not** use the backend client secret.

---

## In professional language

| Concern | Where it lives |
|---------|----------------|
| **Identity Provider (IdP) configuration** | Keycloak realms, clients, roles, service account mappings. |
| **Machine / operator credential** | Confidential client in **`master`**, **client secret** in server env (never in SPA). |
| **End-user identities** | Application realm **`learning`** (imported via `realm-learning.json`). |
| **Authorization for “who may call Admin REST”** | **Fine-grained admin permissions** (preferred) or realm-management roles scoped to target realm — avoid blanket `admin` in production. |

---

## What this repo ships

| Artifact | Realm | Applied how |
|----------|--------|-------------|
| `docker/keycloak/realm-learning.json` | **`learning`** | **Automatic** on container start (`--import-realm`): users + **`learning-spa`**. |
| `docker/keycloak/clients/master-backend-service.json` | **`master`** | **Manual**: Admin Console → realm **`master`** → **Clients** → **Import client**. |

Why not auto-import the `master` client? Keycloak’s startup import **skips** realms that already exist; **`master` always exists**, so a second JSON cannot reliably add a client on every boot. **Import client** (or Terraform / `keycloak-config-cli`) is the usual fix.

---

## Env vars (application side)

| Variable | Purpose |
|----------|---------|
| `KEYCLOAK_MASTER_CLIENT_ID` / `KEYCLOAK_MASTER_CLIENT_SECRET` | **`backend-service`** in **`master`** after import; used for **client_credentials** against `/realms/master/.../token` and then **Admin REST** under `/admin/realms/learning/...`. |
| `OIDC_*` | Validate **end-user** JWTs from **`learning-spa`** (`GET /api/me`) — different flow from the Admin API client. |

---

## Further reading

- `docker/keycloak/README.md` — credential table + file map  
- `docker/keycloak/clients/README.md` — step-by-step import + role assignment hints  
