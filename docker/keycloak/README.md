# Keycloak files in this folder

## Professional layout (what you described)

1. **Separate file for the admin / backend client** → lives in **`clients/master-backend-service.json`**. You **Import client** into realm **`master`** (Admin Console). That client gets a **secret**; you put it in the app as **`KEYCLOAK_MASTER_CLIENT_SECRET`** (see `docker/backend/default.env`).
2. **New realm for users** → **`realm-learning.json`** is imported automatically on startup (`--import-realm` in Compose). Realm **`learning`** holds **users** and the **public SPA** client **`learning-spa`** only.

Your app then uses **client_credentials** against **`/realms/master/.../token`** with that secret, and calls **Admin REST API** under `/admin/realms/learning/...` to manage users in **`learning`**.

---

## Logins and secrets (development only)

| What | Username / client id | Password / secret | Notes |
|------|------------------------|-------------------|--------|
| **Admin Console** (realm `master`) | `admin` | `admin` | `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` in `docker/backend/default.env`. |
| **Sample user** (realm `learning`, SPA sign-in) | `learner` | `learner` | End-user login for the lab UI. |
| **Confidential client** `backend-service` (realm **`master`**) | `backend-service` | **`dev-master-backend-service-secret`** (after **Import client** from `clients/master-backend-service.json`; Keycloak may rotate — then copy from **Credentials** tab) | **Not** a human login. Used for **client_credentials** + **Admin API** to manage users in `learning`. Matches **`KEYCLOAK_MASTER_CLIENT_SECRET`** in `default.env` when unchanged. |

---

## Files

| File | How it is applied |
|------|-------------------|
| `realm-learning.json` | **Automatic** — Compose mounts it and Keycloak `--import-realm` creates realm **`learning`** (users + `learning-spa`). |
| `clients/master-backend-service.json` | **Manual once** — Admin Console, realm **`master`**, **Clients** → **Import client**. |

More detail: **`clients/README.md`**.

---

## Re-import `learning` after editing `realm-learning.json`

Keycloak **skips** import if the realm already exists. For a clean re-import, remove the Keycloak container (dev H2 is inside it) and `up` again, or see root `README.md` / Compose docs.
