---
name: db-migrate
description: Create and run Prisma database migrations for LifeOS
user_invocable: true
---

# Database Migration Workflow

## Before Migrating

1. Check current migration status: `cd apps/backend && npx prisma migrate status`
2. Ensure PostgreSQL is running: `docker compose ps` or `pg_isready -h localhost -p 5432`

## Create a New Migration

After editing `apps/backend/prisma/schema.prisma`:

```bash
cd apps/backend && npx prisma migrate dev --name <descriptive-name>
```

Migration naming convention: `<action>-<entity>[-detail]`
- `add-task-models`
- `add-finance-categories`
- `update-task-add-recurring`
- `add-reminder-notification-fields`

## Apply Pending Migrations

```bash
cd apps/backend && npx prisma migrate deploy
```

## Generate Prisma Client

After any schema change (automatically done by `migrate dev`, but manual if needed):

```bash
cd apps/backend && npx prisma generate
```

## Reset Database (Development Only)

```bash
cd apps/backend && npx prisma migrate reset
```

This drops the database, re-runs all migrations, and re-seeds. **Destructive — confirm with user first.**

## Seed Data

```bash
cd apps/backend && npx prisma db seed
```

Seed script location: `apps/backend/prisma/seed.ts`

## Open Prisma Studio

```bash
cd apps/backend && npx prisma studio
```

Opens a GUI at http://localhost:5555 to browse/edit data.

## Troubleshooting

- **Migration failed:** Check the failed migration SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`
- **Schema drift:** Run `npx prisma migrate diff` to see what's different
- **Shadow database errors:** Ensure the PostgreSQL user has CREATE DATABASE privileges
