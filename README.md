# PrescriptionFront

Vue 3 + Vite frontend for سامانه ثبت آزمایش. Persian, RTL, mobile-first.

## Local development

```bash
npm install
npm run dev            # http://localhost:5173
```

`vite.config.js` proxies `/api` to `http://localhost:8080`, so the backend can run separately
without CORS. Leave `VITE_PRESCRIPTION_API_BASE_URL` empty locally.

To exercise the production image on your machine:

```bash
docker compose up --build      # http://localhost:8081
```

That file is local-only. The server uses `docker-compose.prod.yml`.

## Deployment

Pushing to `main` builds an image, pushes it to GHCR tagged with the commit SHA, and restarts
the container on the server. `workflow_dispatch` redeploys the current `main` without a commit.

### Required repository secrets

| Secret | Notes |
| --- | --- |
| `SSH_HOST` | Server address |
| `SSH_USER` | SSH user |
| `SSH_PASSWORD` | This server authenticates by password, not key |
| `SSH_PORT` | Optional, defaults to `22` |

The preflight job fails with the exact missing name rather than letting a blank secret surface
later as an unexplained SSH error. Pushing to GHCR and pulling on the server both use the
run-scoped `GITHUB_TOKEN`, so no long-lived registry PAT is stored.

### How it fits with the backend — three things that will break the site

The backend stack owns the edge. Its Caddy terminates TLS and reverse-proxies everything
except `/api/*` and `/health` to `frontend:80`.

1. **Publish no ports.** Caddy owns 80 and 443. A `ports:` entry here either fails to bind or
   takes the backend's site down with it. `docker-compose.prod.yml` deliberately has none, and
   the deploy verifies the container from *inside* (`docker exec … wget`) precisely because
   there is nothing to reach from the host.
2. **Keep `VITE_PRESCRIPTION_API_BASE_URL` empty.** The app and the API share an origin, so
   axios uses relative `/api/...` paths. The backend sends no CORS headers — pointing this at
   another origin blocks every request. Vite inlines it at *build* time, so it is a Docker
   build arg, not a runtime variable.
3. **Deploy to its own directory.** `DEPLOY_PATH` is `/opt/prescription-front`. The backend
   writes its own `docker-compose.prod.yml` and `.env`; sharing a directory would overwrite them.

### Connection contract

| Item | Value |
| --- | --- |
| Docker network | `prescription` (external, created by the backend) |
| Service / container name | `frontend` — Caddy addresses it by this name |
| Internal port | `80` |
| Image | `ghcr.io/amir-bahrami1377/prescriptionfront:<commit-sha>` |

Startup order does not matter: Caddy resolves the upstream per request, so bringing this stack
up after Caddy is fine. Until the container is running, `https://noskhe.net/` returns 502.

The image is tagged by commit SHA only, never `latest`, so a server restart brings back exactly
the build that was deployed. The deploy writes that SHA into `.env` next to the compose file.
Because the deploy logs out of GHCR when it finishes, a manual `docker compose pull` on the
server needs a fresh `docker login ghcr.io`; a plain restart does not, since the image is local.

## Notes

- `nginx.conf` serves the SPA with `try_files $uri $uri/ /index.html` for Vue Router history
  mode, and long-caches hashed files under `/assets/`. Keep `listen 80`.
- `.dockerignore` must keep excluding `node_modules`: the Dockerfile runs `npm ci` before
  `COPY . .`, and copying a host tree over it replaces Linux binaries (esbuild, rollup) with
  the host platform's.
