# Docker — frontend image

- `Dockerfile` — `npm ci` + `npm run build`, then **nginx** serves the SPA.
- `nginx.conf` — SPA routing (`try_files` + `index.html`).
- `startup.sh` — runs nginx in the foreground (`daemon off`).
- `default.env` — documents Vite build variables (see also `docker/backend/default.env`).
- `dev.env.sample` — sample overrides for local builds.

Full stack (recommended), from the **lab root**:

```bash
docker compose --env-file docker/backend/default.env up --build
```
