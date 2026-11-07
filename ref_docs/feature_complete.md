# LifeOS — Features Complete (Specified & Decisions Made)

**Document type:** Decision log & feature specification tracker
**Last updated:** 2026-11-07
**Status:** Pre-development — all entries are finalized specifications, not implemented code

---

## How to read this document

Each entry below represents a feature or decision that has been **fully discussed,
specified, and locked in**. The "Decision" section explains **why** a particular
approach was chosen over alternatives.

---

## Module Specifications Complete

### 1. Dashboard — SPECIFIED
- Widget-based layout with drag-and-drop customization
- Widgets: welcome bar, today's tasks, upcoming events, active reminders, finance snapshot, recent transactions, project progress, quick stats strip, activity feed, Quick Capture button
- **Decision:** Widget-based over fixed layout — allows users to prioritize what matters to them. Widgets for unavailable modules are hidden rather than showing errors.

### 2. Task Management — SPECIFIED
- Full CRUD with priorities, statuses, categories, tags, due dates, subtasks, recurring tasks, attachments
- Four views: List, Kanban, Calendar, My Day
- **Decision:** "My Day" view included as a curated daily focus — separate from "all tasks due today" because users need to intentionally pick what to focus on, not just see everything that's due.
- **Decision:** Subtasks limited to one level deep for MVP — nested subtask trees add UI complexity with little practical benefit at this stage.

### 3. Calendar & Events — SPECIFIED
- Day/Week/Month/Agenda views with recurring events and reminders
- Shows task due dates and subscription renewals as read-only references
- **Decision:** Calendar references other modules' dates rather than duplicating them — avoids sync issues and respects the "one source of truth" principle. Edit tasks in Tasks module, not from the calendar.

### 4. Reminders — SPECIFIED
- One-time and recurring, with snooze, dismiss, and mark done
- In-app + browser push + email notifications
- Backend scheduler runs server-side
- **Decision:** Email chosen as the primary external notification channel over WhatsApp/Telegram. Reason: zero external dependencies, no Meta business verification, no template approval process, works everywhere, free/cheap. WhatsApp/Telegram deferred to a later phase.
- **Decision:** Backend scheduler required even for MVP — reminders must fire when the browser is closed, otherwise the feature is unreliable.

### 5. Finance Management — SPECIFIED
- Manual transaction entry with categories, payment methods, tags, recurring transactions
- Budgets with per-category limits and threshold warnings
- Reports: monthly overview, category breakdown, daily trends, income vs expense, yearly summary
- **Decision:** Manual entry only for MVP. Reason: GPay, PhonePe, Paytm have no public API for personal transaction history. SMS/notification listeners require a native Android app (out of scope for web-only). Bank CSV import deferred to Phase 5 — manual entry + Quick Capture covers daily use well enough.
- **Decision:** Internal transfers tracked separately and excluded from income/expense reports to avoid inflating numbers.

### 6. Subscription Manager — SPECIFIED
- Full subscription tracking with auto-calculated monthly/yearly totals
- Renewal reminders, payment history, status tracking
- Integrates with Reminders, Calendar, and Finance modules
- **Decision:** Auto-creates renewal reminders and links to Finance transactions rather than being a standalone silo — cross-module integration is core to LifeOS's value.

### 7. Project Management — SPECIFIED
- Projects with milestones, linked tasks, progress tracking, notes, attachments
- List, detail, and board views
- **Decision:** Tasks belong to Task Management (source of truth), projects reference them via linking. This avoids duplicate task records and keeps the task system as the single place to manage all tasks regardless of whether they belong to a project.
- **Decision:** Completing all tasks doesn't auto-complete the project — user decides when a project is truly done, because there may be non-task work involved.

### 8. Knowledge Base — SPECIFIED (Obsidian Integration)
- Reads existing Obsidian vault from local folder, indexes all `.md` files
- Quick notes created in LifeOS saved as `.md` files into the Obsidian vault
- Simple Markdown editor for quick notes, full Markdown preview
- **Decision:** Obsidian stays the primary editor, LifeOS is the reader/search/browse layer. Reason: Obsidian has years of features (backlinks, graph view, plugins) that would be impossible to replicate. Instead of competing, LifeOS complements it by providing cross-module search and a quick capture fallback.
- **Decision:** Quick notes saved as `.md` files in the vault folder so they automatically appear in Obsidian — one folder, two tools, zero sync complexity.

### 9. Document Vault — SPECIFIED
- Upload local files OR paste external links (Google Drive, Dropbox, etc.)
- Local files stored in `vault/` folder on disk, metadata in database
- Expiry reminders, version history, document number search
- **Decision:** Dual storage (local + external link) chosen. Reason: local upload gives quick in-app viewing for frequently accessed documents; external links avoid re-uploading things already in Google Drive. Users choose per document.
- **Decision:** Local folder storage over cloud (S3/R2) for MVP. Reason: localhost deployment means zero cost, maximum privacy, files never leave the machine. Storage layer will be built as an abstraction so migration to cloud is a swap, not a rewrite.

### 10. Universal Quick Capture — SPECIFIED
- Floating button + keyboard shortcut, captures tasks/expenses/notes/reminders/events/bookmarks/ideas
- Auto-detects type from input, smart defaults
- **Decision:** Auto-detection included from MVP — the whole point of quick capture is speed. Typing "300 food zomato" should become an expense without the user manually selecting "Expense" type.

### 11. Global Search — SPECIFIED
- Searches across all modules simultaneously from one search bar
- Results grouped by module, filterable, with context snippets
- **Decision:** PostgreSQL full-text search for MVP over Elasticsearch/Meilisearch. Reason: simpler infrastructure for localhost, good enough performance for a single-user app. Can upgrade later if needed.

---

## Platform-Level Decisions

### Deployment: Localhost
- LifeOS runs locally on the user's machine, accessed via browser at localhost
- **Why:** Enables direct filesystem access to Obsidian vault and document storage. No hosting costs. Maximum privacy. Simpler architecture.
- **Future:** Can migrate to remote hosting later; storage abstractions will make the swap manageable.

### Notifications: In-app + Browser Push + Email
- **Why:** Email has zero external dependencies, no API approvals, works on all devices, free tier available (Resend, SendGrid, Nodemailer). WhatsApp requires Meta business verification and message template approval — too much friction for MVP.

### Data Ownership: One Source of Truth
- Each module owns its primary records (Finance owns transactions, Tasks owns tasks, etc.)
- Other modules reference records by stable identifiers, never duplicate them
- **Why:** Prevents data inconsistency, simplifies updates, and keeps the codebase maintainable.

### Architecture: Modular Monolith
- Single application with clearly separated domain modules
- No microservices until there is a concrete operational need
- **Why:** For a single-user localhost app, microservices add deployment complexity with zero benefit. Clean module boundaries give the same organizational benefits.

### Tech Stack: TypeScript Full-Stack
- **Frontend:** React + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **MCP Server:** TypeScript (`@modelcontextprotocol/sdk`)
- **Background Jobs:** node-cron + Bull (Redis-backed queue)
- **Email:** Nodemailer (SMTP)
- **File Watching:** chokidar (Obsidian vault monitoring)
- **Why TypeScript everywhere:** Single language across frontend, backend, and MCP server. Shared type definitions, one mental model. MCP SDK is TypeScript-first, so the MCP server can directly import backend services without an API translation layer.
- **Why PostgreSQL over SQLite:** Full-text search for Global Search module, complex query support for finance reports and analytics, easier migration to remote hosting later.
- **Why Express over Next.js:** Heavy backend logic (file watchers, background schedulers, Obsidian scanning, document serving) benefits from a dedicated server with full control rather than serverless-style API routes.
- **Why Shadcn/ui:** Component ownership (code copied into project, not a dependency), built on Radix (accessible), Tailwind-native, highly customizable.
