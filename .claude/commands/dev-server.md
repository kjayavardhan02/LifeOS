---
name: dev-server
description: Start, stop, or restart the LifeOS development servers (frontend, backend, database)
user_invocable: true
---

# Dev Server Management

## Pre-flight Checks

1. Check if PostgreSQL is running: `systemctl is-active postgresql`
2. Check if Redis is running: `systemctl is-active redis-server`
3. Check if ports are free: `lsof -i :5173` (frontend), `lsof -i :3001` (backend)

## Start Everything

```bash
# 1. Start infrastructure (needs sudo — ask user to run if not active)
# sudo systemctl start postgresql redis-server

# 2. Wait for PostgreSQL
until pg_isready -h localhost -p 5432 > /dev/null 2>&1; do sleep 1; done

# 3. Verify Redis
redis-cli ping

# 4. Run any pending migrations
cd apps/backend && npx prisma migrate deploy && cd ../..

# 5. Start dev servers (runs frontend + backend concurrently)
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

# Stop infrastructure (optional — can leave running)
# sudo systemctl stop postgresql redis-server
```

## Troubleshooting

- Port in use: `lsof -i :<port>` to find the process, then kill it
- Database connection refused: `systemctl is-active postgresql` — if inactive, ask user to run `sudo systemctl start postgresql`
- Redis connection refused: `systemctl is-active redis-server` — if inactive, ask user to run `sudo systemctl start redis-server`
- Migration errors: check `apps/backend/prisma/migrations/` for failed migrations
- Prisma can't find DATABASE_URL: ensure `.env` exists at project root (copy from `.env.example`) — the backend has a symlink to it

## After Starting

Once servers are running, open http://localhost:5173 in the browser to verify the app loads. Check the terminal for any compilation errors.
