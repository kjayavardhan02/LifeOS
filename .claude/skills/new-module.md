---
name: new-module
description: Scaffold a new LifeOS feature module (backend service + routes + frontend pages + components)
user_invocable: true
---

# Scaffold a New LifeOS Module

When the user asks to create a new module, follow this exact sequence. The module name should be one of the 11 MVP modules defined in `ref_docs/phase_overview.md`.

## Input

The user provides: module name (e.g., "tasks", "finance", "reminders")

## Step 1: Read the Spec

Read `ref_docs/feature_complete.md` and `ref_docs/phase_overview.md` for the module's full specification before writing any code. Understand every field, view, and integration point.

## Step 2: Prisma Schema

Add models to `apps/backend/prisma/schema.prisma`:
- Use snake_case table names, camelCase field names
- Add `createdAt`, `updatedAt` DateTime fields to every model
- Add `deletedAt DateTime?` for soft delete
- Define enums for status/priority/type fields
- Add appropriate indexes and relations

Then run: `cd apps/backend && npx prisma migrate dev --name add-<module>-models`

## Step 3: Shared Types

Create `packages/shared/src/types/<module>.ts`:
- Export TypeScript interfaces matching Prisma models
- Export create/update DTOs (omitting auto-generated fields)
- Export filter/query parameter types
- Re-export from `packages/shared/src/types/index.ts`

## Step 4: Backend Service

Create `apps/backend/src/modules/<module>/`:

**`<module>.service.ts`**
- Import Prisma client from `../../lib/prisma`
- CRUD methods: `create`, `findAll` (with filters + pagination), `findById`, `update`, `delete` (soft delete)
- Business logic methods specific to the module
- All methods return typed results

**`<module>.validator.ts`**
- Zod schemas for create, update, and query params
- Export `validate<Module>Create`, `validate<Module>Update`, etc.

**`<module>.router.ts`**
- Express router with RESTful endpoints
- Apply validation middleware
- Call service methods
- Consistent error handling with try/catch

**`index.ts`**
- Re-export router and service

## Step 5: Register Backend Route

Add the router to `apps/backend/src/app.ts`:
```typescript
import { moduleRouter } from './modules/<module>';
app.use('/api/<module>', moduleRouter);
```

## Step 6: Frontend API Layer

Create `apps/frontend/src/modules/<module>/hooks/`:

**`use-<module>.ts`**
- TanStack Query hooks: `use<Module>s()`, `use<Module>(id)`, `useCreate<Module>()`, `useUpdate<Module>()`, `useDelete<Module>()`
- Use query key factory pattern
- Optimistic updates for mutations
- Proper error handling

## Step 7: Frontend Pages

Create `apps/frontend/src/modules/<module>/pages/`:

**`<Module>ListPage.tsx`** — main list/table view with filters
**`<Module>DetailPage.tsx`** — detail/edit view (if applicable)

## Step 8: Frontend Components

Create `apps/frontend/src/modules/<module>/components/`:
- Module-specific UI components
- Use Shadcn/ui primitives
- Follow the design system from CLAUDE.md (dark theme, stat cards, etc.)

## Step 9: Wire Up Routes

Add routes to the React Router configuration in `apps/frontend/src/app/router.tsx`.

## Step 10: Add to Sidebar

Add navigation entry to the sidebar configuration with appropriate Lucide icon and group.

## Step 11: Verify

- Run `pnpm typecheck` to verify no type errors
- Run `pnpm lint` to check for lint issues
- Start dev servers and verify the module renders correctly
