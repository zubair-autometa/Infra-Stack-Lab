# Docker — edge nginx (optional)

This folder holds **example** reverse-proxy configuration if you later put a single
public entrypoint in front of the UI and API (one host/port, path-based routing).

Today the lab stack exposes:

- UI: `http://localhost:5173`
- API: `http://localhost:8000`

See `proxy.conf.example` for a starting point if you add a `gateway` service to Compose.
