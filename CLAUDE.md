# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LifeOS — a centralized personal management platform (productivity, finance, documents, knowledge, health) built as a responsive web app. Localhost-first deployment. Single-user.

## Status

Pre-development. Reference docs in `ref_docs/` define the full scope:
- `ref_docs/phase_overview.md` — all 35 modules across 5 phases with detailed MVP specs
- `ref_docs/feature_complete.md` — finalized specs and decision rationale for the 11 MVP modules
- `ref_docs/feature_pending.md` — remaining 24 modules with scope, pending decisions, and dependencies

**Read `ref_docs/feature_complete.md` before making architectural decisions** — it captures the reasoning behind each choice.

## Architecture Principles

- **Modular monolith** — one app, clearly separated domain modules. No microservices.
- **One source of truth** — each module owns its records (Finance owns transactions, Tasks owns tasks). Other modules reference by ID, never duplicate.
- **Knowledge Base reads the Obsidian vault** — the vault path is configured, LifeOS indexes `.md` files. Quick notes created in LifeOS are saved as `.md` into the vault. Obsidian is the editor; LifeOS is the reader/search layer.
- **Document Vault dual storage** — local files in `vault/` folder on disk OR external links (Google Drive, etc.). Metadata in database, files never publicly served.
- **Notifications** — in-app + browser push + email. No WhatsApp/Telegram in MVP.
- **Finance** — manual entry only for MVP. No bank API integrations yet.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Shadcn/ui (Radix primitives)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** Zustand (global), React Query / TanStack Query (server state)
- **Routing:** React Router v6
- **MCP Server:** TypeScript (`@modelcontextprotocol/sdk`), shares backend services
- **Background Jobs:** node-cron + Bull (Redis-backed queue)
- **Email:** Nodemailer (SMTP)
- **File Watching:** chokidar (Obsidian vault monitoring)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date handling:** date-fns

TypeScript strict mode across the entire stack — frontend, backend, and MCP server share types.

## Directory Structure

```
lifeos/
├── CLAUDE.md
├── ref_docs/                    # Product specs (read-only reference)
├── packages/
│   └── shared/                  # Shared types, constants, utils
│       └── src/
│           ├── types/           # Shared TypeScript interfaces
│           ├── constants/       # Enums, category defaults, statuses
│           └── utils/           # Pure utility functions
├── apps/
│   ├── frontend/                # React SPA
│   │   ├── src/
│   │   │   ├── app/             # App shell, providers, router
│   │   │   ├── components/
│   │   │   │   ├── ui/          # Shadcn/ui primitives (Button, Card, etc.)
│   │   │   │   ├── layout/      # Shell, Sidebar, TopBar, Breadcrumb
│   │   │   │   └── shared/      # Cross-module components (StatCard, EmptyState)
│   │   │   ├── modules/         # Feature modules
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── components/   # Module-specific components
│   │   │   │   │   ├── hooks/        # Module-specific hooks
│   │   │   │   │   ├── pages/        # Route-level page components
│   │   │   │   │   └── index.ts      # Public exports
│   │   │   │   ├── tasks/
│   │   │   │   ├── calendar/
│   │   │   │   ├── reminders/
│   │   │   │   ├── finance/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── projects/
│   │   │   │   ├── knowledge/
│   │   │   │   ├── documents/
│   │   │   │   ├── quick-capture/
│   │   │   │   └── search/
│   │   │   ├── hooks/           # Global hooks
│   │   │   ├── lib/             # API client, query keys, utils
│   │   │   ├── stores/          # Zustand stores
│   │   │   └── styles/          # Global CSS, Tailwind config
│   │   ├── public/
│   │   ├── index.html
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── backend/                 # Express API server
│   │   ├── src/
│   │   │   ├── app.ts           # Express app setup
│   │   │   ├── server.ts        # Entry point
│   │   │   ├── modules/         # Domain modules
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── task.router.ts
│   │   │   │   │   ├── task.service.ts
│   │   │   │   │   ├── task.validator.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── finance/
│   │   │   │   └── ...
│   │   │   ├── middleware/      # Auth, error handling, validation
│   │   │   ├── lib/             # Database client, logger, mailer
│   │   │   └── jobs/            # Background job definitions
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── tsconfig.json
│   └── mcp-server/              # MCP server
│       └── src/
│           ├── server.ts
│           └── tools/
├── vault/                       # Document storage (not committed)
└── docker-compose.yml           # PostgreSQL + Redis
```

## Development Commands

```bash
# Start everything (from project root)
pnpm dev                         # Starts frontend + backend concurrently
pnpm dev:frontend                # Frontend only (Vite on :5173)
pnpm dev:backend                 # Backend only (Express on :3001)
pnpm dev:mcp                    # MCP server

# Database
pnpm db:migrate                  # Run pending Prisma migrations
pnpm db:push                     # Push schema changes (dev only)
pnpm db:seed                     # Seed with sample data
pnpm db:studio                   # Open Prisma Studio
pnpm db:reset                    # Reset database (destructive)

# Code quality
pnpm lint                        # ESLint across all packages
pnpm typecheck                   # TypeScript type checking
pnpm format                      # Prettier formatting
pnpm test                        # Vitest (frontend) + Jest (backend)

# Build
pnpm build                       # Production build
```

## Code Conventions

### TypeScript
- Strict mode everywhere. No `any` — use `unknown` and narrow.
- Interfaces for object shapes, type aliases for unions/intersections.
- Zod schemas for runtime validation at API boundaries.
- Barrel exports (`index.ts`) per module — import from the module, not internal files.

### Naming
- **Files:** kebab-case (`task-list.tsx`, `finance.service.ts`)
- **Components:** PascalCase (`TaskList`, `StatCard`)
- **Hooks:** camelCase with `use` prefix (`useTaskFilters`)
- **Services:** camelCase with `.service.ts` suffix
- **Routes:** camelCase with `.router.ts` suffix
- **Types:** PascalCase, no `I` prefix (`Task` not `ITask`)
- **Constants:** UPPER_SNAKE_CASE for true constants, camelCase for config objects
- **Database tables:** snake_case plural (`tasks`, `finance_transactions`)

### React Patterns
- Functional components only, no class components.
- Custom hooks for any logic beyond trivial state.
- Co-locate module components — `modules/tasks/components/`, not a global components folder.
- Use Shadcn/ui primitives for all interactive elements. Never raw HTML buttons, inputs, selects.
- TanStack Query for all server data — no `useEffect` + `fetch` patterns.
- Zustand only for client-side UI state (sidebar collapsed, theme, active filters).

### API Patterns
- RESTful routes: `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- Consistent response envelope: `{ data, meta? }` for success, `{ error: { message, code, details? } }` for errors
- Zod validation in `.validator.ts` files, applied via middleware.
- Services contain business logic, routers are thin.
- HTTP status codes: 200 (ok), 201 (created), 204 (deleted), 400 (validation), 404 (not found), 500 (server error).

### Database
- Prisma schema is the source of truth for the data model.
- Use Prisma Client — no raw SQL unless absolutely necessary for performance.
- Soft delete via `deletedAt` timestamp for user-facing records.
- All dates stored as UTC, converted to local time in the frontend.
- Relations: reference by ID, use Prisma's relation fields for includes.

## UI Design System

The UI follows a **dark-first dashboard aesthetic** inspired by modern SaaS tools.

### Layout Structure
- **Sidebar** (left, 256px wide, collapsible to 64px icon-only):
  - Logo + "LifeOS" branding at top
  - Navigation grouped by section with uppercase group labels
  - Groups: PRODUCTIVITY (Dashboard, Tasks, Calendar, Reminders), FINANCE (Finance, Subscriptions), PROJECTS (Projects), KNOWLEDGE (Knowledge Base, Documents), TOOLS (Quick Capture, Settings)
  - Each nav item: Lucide icon + label
  - Active item: accent background highlight
  - Collapse toggle at bottom
- **Top Bar** (sticky, full width minus sidebar):
  - Breadcrumb navigation (left)
  - Global search bar with Cmd+K shortcut (center-right)
  - Notification bell with badge count (right)
  - User avatar (far right)
- **Main Content** (scrollable, padded):
  - Page title + description line
  - Content below

### Component Patterns
- **Stat Cards** (dashboard): Large number, subtitle, icon top-right, subtle colored accent. Used in a horizontal row of 4-6 cards.
- **Chart Cards**: Card wrapper with title + subtitle, chart inside (Recharts). Use donut for breakdowns, horizontal bars for categories, line/area for trends.
- **Data Tables**: Shadcn/ui DataTable with sorting, filtering, pagination.
- **Forms**: Shadcn/ui Form with React Hook Form + Zod. Labels above inputs.
- **Empty States**: Illustration/icon + message + action button.
- **Loading**: Skeleton loaders matching the shape of content.

### Color Tokens (Tailwind / CSS variables)
```
--background:        #0a0a0f       (near-black body)
--card:              #12121a       (card/surface)
--card-hover:        #1a1a26       (card hover)
--sidebar:           #0e0e16       (sidebar bg)
--sidebar-active:    #1e293b/80    (active nav item)
--border:            #1e1e2e       (subtle borders)
--border-hover:      #2a2a3e

--foreground:        #e2e2e8       (primary text)
--muted:             #71717a       (secondary text)
--muted-foreground:  #a1a1aa

--primary:           #3b82f6       (blue accent — buttons, links, active states)
--primary-hover:     #2563eb
--success:           #22c55e       (green — completed, income, positive)
--warning:           #f59e0b       (amber — warnings, pending, medium priority)
--danger:            #ef4444       (red — errors, overdue, high/urgent, expenses)
--info:              #06b6d4       (cyan — info badges, tips)

--chart-1:           #3b82f6       (blue)
--chart-2:           #8b5cf6       (violet)
--chart-3:           #f59e0b       (amber)
--chart-4:           #22c55e       (green)
--chart-5:           #ef4444       (red)
--chart-6:           #06b6d4       (cyan)
```

### Responsive Breakpoints
- Mobile: < 768px — sidebar hidden (hamburger), single column, cards stack
- Tablet: 768-1024px — sidebar collapsed (icons only), 2-column grid
- Desktop: > 1024px — sidebar expanded, 3-4 column grid for stat cards, 2-3 column for charts

### Spacing & Typography
- Page padding: `p-6` (24px)
- Card padding: `p-5` (20px)
- Section gaps: `gap-6` (24px)
- Stat card numbers: `text-3xl font-bold`
- Card titles: `text-sm font-semibold` uppercase group labels, `text-base font-medium` card titles
- Body text: `text-sm`
- Muted text: `text-xs text-muted`
- Font: system font stack (Inter if loaded, otherwise system-ui)
- Border radius: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons/inputs

## Module Implementation Checklist

When building a new module, follow this order:
1. **Prisma schema** — define models, relations, enums in `schema.prisma`
2. **Migration** — `pnpm db:migrate` to create the migration
3. **Shared types** — export TypeScript interfaces in `packages/shared/src/types/`
4. **Backend service** — business logic in `modules/<name>/<name>.service.ts`
5. **Backend validators** — Zod schemas in `modules/<name>/<name>.validator.ts`
6. **Backend router** — Express routes in `modules/<name>/<name>.router.ts`
7. **Frontend API layer** — TanStack Query hooks in `modules/<name>/hooks/`
8. **Frontend pages** — route-level components in `modules/<name>/pages/`
9. **Frontend components** — UI pieces in `modules/<name>/components/`
10. **Wire up routes** — add to React Router config
11. **Add to sidebar** — register nav item in sidebar config
12. **Seed data** — optional sample data for development

## Cross-Module Integration Rules

- A module that needs data from another module calls that module's **service** (backend) or **API** (frontend). Never import another module's Prisma queries directly.
- Cross-module references use stable IDs. Example: a Project references Task IDs, not task objects.
- Calendar shows dates from Tasks (due dates), Reminders, and Subscriptions (renewal dates) as read-only references — these are rendered differently from calendar-native events.
- Reminders can be auto-created by Tasks, Subscriptions, Calendar Events, and Document Vault (expiry). The source module calls the Reminders service to create them.
- Finance transactions can be linked from Subscriptions (renewal payments). The Subscription module creates the transaction via the Finance service.

## Key Directories

- `ref_docs/` — product specs, decision logs, pending features (read before building any module)
- `vault/` — local document storage for Document Vault (not code, not committed)
- `packages/shared/` — shared types and utilities used by frontend, backend, and MCP server
- `apps/frontend/src/modules/` — all frontend feature code, organized by domain module
- `apps/backend/src/modules/` — all backend feature code, organized by domain module
