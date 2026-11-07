---
name: dev-server
description: Start, stop, or restart the LifeOS development servers (frontend, backend, database)
user_invocable: true
---

# Dev Server Management

## Pre-flight Checks

1. Check if Docker is running: `docker info > /dev/null 2>&1`
2. Check if PostgreSQL and Redis containers are up: `docker compose ps`
3. Check if ports are free: `lsof -i :5173` (frontend), `lsof -i :3001` (backend)

## Start Everything

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Wait for PostgreSQL
until pg_isready -h localhost -p 5432 > /dev/null 2>&1; do sleep 1; done

# 3. Run any pending migrations
cd apps/backend && npx prisma migrate deploy && cd ../..

# 4. Start dev servers
pnpm dev
```

## Start Individual Services

- Frontend only: `pnpm dev:frontend` (Vite on http://localhost:5173)
- Backend only: `pnpm dev:backend` (Express on http://localhost:3001)
- MCP server: `pnpm dev:mcp`

## Stop Everything

```bash
# Kill dev servers (if running in background)
lsof -ti :5173 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null

# Stop infrastructure
docker compose down
```

## Troubleshooting

- Port in use: `lsof -i :<port>` to find the process, then kill it
- Database connection refused: ensure Docker container is running with `docker compose ps`
- Migration errors: check `apps/backend/prisma/migrations/` for failed migrations
- If `pnpm` not found: `npm install -g pnpm`

## After Starting

Once servers are running, open http://localhost:5173 in the browser to verify the app loads. Check the terminal for any compilation errors.
