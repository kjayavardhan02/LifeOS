# LifeOS — Implementation Status

**Last Updated:** 2026-11-12  
**Status:** Active Development — MVP modules implemented

---

## Project Overview

LifeOS is a centralized personal management platform covering productivity, finance, documents, knowledge, and health — built as a responsive web app with a dark-first dashboard aesthetic. Localhost-first, single-user deployment.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Shadcn/ui (Radix primitives) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| State Management | Zustand (UI state) + TanStack Query (server state) |
| Routing | React Router v6 |
| MCP Server | TypeScript + `@modelcontextprotocol/sdk` |
| Icons | Lucide React |
| Charts | Recharts |

---

## Implemented Modules

### 1. Authentication

Full user authentication with session management.

**Backend:** `apps/backend/src/modules/auth/`  
**Frontend:** `apps/frontend/src/modules/auth/`

- User registration (signup) with validation
- User login with session tokens
- Auth guard component protecting all routes
- Auth layout with dedicated login/signup pages
- Profile page for viewing/editing user info

**Database Models:** `User`, `UserSettings`  
**API Routes:** `POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me`  
**Pages:** `/login`, `/signup`, `/profile`

---

### 2. Dashboard

Central overview page aggregating data from all modules.

**Frontend:** `apps/frontend/src/modules/dashboard/`

- Stat cards showing key metrics across modules
- Summary widgets pulling data from tasks, finance, reminders, goals
- Quick access to recent items

**Pages:** `/` (home)

---

### 3. Tasks

Full-featured task management with multiple views.

**Backend:** `apps/backend/src/modules/tasks/`  
**Frontend:** `apps/frontend/src/modules/tasks/`

- Create, update, delete tasks with soft delete
- Priority levels: low, medium, high, urgent
- Status workflow: todo → in_progress → done / cancelled
- Subtasks with independent completion tracking
- Recurring tasks with configurable patterns (daily, weekly, monthly, yearly) and auto-rescheduling on completion
- "My Day" feature for daily task focus
- Category and tag-based organization
- Task activity history logging
- Due date tracking with overdue detection
- Project linking (tasks can belong to a project)
- Multiple views: list view, kanban board, calendar view
- Advanced filtering by status, priority, category, tags, date range, overdue, project
- Sortable by any field
- Task detail panel with full editing

**Database Models:** `Task`, `Subtask`, `TaskActivity`  
**Enums:** `TaskStatus` (todo, in_progress, done, cancelled), `Priority` (low, medium, high, urgent), `RecurrencePattern` (daily, weekly, monthly, yearly)  
**API Routes:** `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`  
**Pages:** `/tasks`  
**Components:** `task-dialog`, `task-item`, `task-detail-panel`, `task-filters`, `kanban-board`, `task-calendar-view`, `priority-badge`, `status-badge`

---

### 4. Calendar

Event management with multiple calendar views.

**Backend:** `apps/backend/src/modules/calendar/`  
**Frontend:** `apps/frontend/src/modules/calendar/`

- Create, update, delete calendar events
- All-day and timed events
- Recurring events with configurable patterns
- Event categories and color coding
- Location support
- Four calendar views: month, week, day, agenda
- Event detail panel with editing
- Upcoming events query (next N days)

**Database Models:** `CalendarEvent`  
**API Routes:** `GET /api/events`, `POST /api/events`, `PATCH /api/events/:id`, `DELETE /api/events/:id`  
**Pages:** `/calendar`  
**Components:** `month-view`, `week-view`, `day-view`, `agenda-view`, `event-dialog`, `event-detail-panel`

---

### 5. Reminders

Flexible reminder system with snooze and linking.

**Backend:** `apps/backend/src/modules/reminders/`  
**Frontend:** `apps/frontend/src/modules/reminders/`

- Create, update, dismiss reminders
- Priority levels and categories
- Status workflow: pending → snoozed → done / dismissed
- Snooze functionality with configurable duration
- Recurring reminders
- Cross-module linking (link a reminder to a task, subscription, document, etc.)
- Overdue detection
- Filtering by status, priority, category, linked module, date range

**Database Models:** `Reminder`  
**Enums:** `ReminderStatus` (pending, snoozed, done, dismissed)  
**API Routes:** `GET /api/reminders`, `POST /api/reminders`, `PATCH /api/reminders/:id`  
**Pages:** `/reminders`  
**Components:** `reminder-dialog`, `reminder-item`, `reminder-detail-panel`, `reminder-filters`

---

### 6. Finance

Manual financial tracking with budgets, summaries, and comparisons.

**Backend:** `apps/backend/src/modules/finance/`  
**Frontend:** `apps/frontend/src/modules/finance/`

- Record income, expense, and transfer transactions
- Transaction categories, merchants, payment methods, tags
- Monthly financial summary: total income, expenses, savings rate, category breakdown, daily trend
- Month-over-month comparison: income/expense deltas, category-by-category changes
- Budget management per category per month with actual vs. planned tracking
- Recurring transactions
- Advanced filtering by type, category, date range, amount range, payment method, tags
- Summary stat cards (income, expenses, savings, transaction count)
- Transaction detail panel

**Database Models:** `FinanceTransaction`, `RecurringTransaction`, `Budget`, `Category`  
**Enums:** `TransactionType` (income, expense, transfer)  
**API Routes:** `GET/POST /api/finance/transactions`, `GET /api/finance/budgets`, `POST /api/finance/budgets`  
**Pages:** `/finance`  
**Components:** `transaction-dialog`, `transaction-item`, `transaction-detail-panel`, `transaction-filters`, `summary-cards`, `budget-card`, `budget-dialog`, `month-comparison`

---

### 7. Subscriptions

Track recurring subscriptions and their costs.

**Backend:** `apps/backend/src/modules/subscriptions/`  
**Frontend:** `apps/frontend/src/modules/subscriptions/`

- Add, update, cancel subscriptions
- Billing cycles: monthly, quarterly, yearly
- Status tracking: active, paused, cancelled, trial
- Next renewal date tracking with reminder days configuration
- Provider, payment method, category, URL, notes
- Subscription summary: total monthly/yearly costs, active count, upcoming renewals, category breakdown
- Filtering by status, category, billing cycle

**Database Models:** `Subscription`  
**Enums:** `BillingCycle` (monthly, quarterly, yearly), `SubscriptionStatus` (active, paused, cancelled, trial)  
**API Routes:** `GET /api/subscriptions`, `POST /api/subscriptions`, `PATCH /api/subscriptions/:id`  
**Pages:** `/subscriptions`  
**Components:** `subscription-dialog`, `subscription-card`, `subscription-detail-panel`, `subscription-filters`, `summary-cards`

---

### 8. Projects

Project management with milestones and linked tasks.

**Backend:** `apps/backend/src/modules/projects/`  
**Frontend:** `apps/frontend/src/modules/projects/`

- Create, update, delete projects
- Status workflow: planning → active → on_hold → completed / cancelled
- Priority, category, tags, start/target end dates
- Milestones with target dates and completion tracking
- Link existing tasks to projects with task completion stats
- Project detail page with milestones and tasks view
- Project card grid and filtering

**Database Models:** `Project`, `Milestone`  
**Enums:** `ProjectStatus` (planning, active, on_hold, completed, cancelled), `MilestoneStatus`  
**API Routes:** `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/:id`, `POST /api/projects/:id/milestones`  
**Pages:** `/projects`, `/projects/:id`  
**Components:** `project-dialog`, `project-card`, `project-detail-panel`, `project-filters`, `milestone-dialog`, `milestone-item`, `link-task-dialog`

---

### 9. Goals & Habits

Goal tracking with linked habits and tasks, plus daily habit checklist.

**Backend:** `apps/backend/src/modules/goals/`  
**Frontend:** `apps/frontend/src/modules/goals/`

#### Goals
- Create, update goals with status, priority, category
- Goal types: outcome, habit-based, project-based, milestone
- Progress tracking: auto (calculated from linked tasks/milestones) or manual (0-100)
- Link tasks and habits to goals
- Target dates
- Goal detail page with linked items and progress visualization

#### Habits
- Create habits with frequency: daily or specific days of the week
- Target value and unit (e.g., "30 minutes of reading")
- Color and icon customization
- Daily habit logging with value and optional notes
- Streak calculation (current and best) auto-updated on each log
- "Today's checklist" showing which habits are scheduled and their completion status
- Habit heatmap visualization
- Archive support

**Database Models:** `Goal`, `GoalMilestone`, `GoalTask`, `Habit`, `HabitLog`, `HabitGoal`  
**Enums:** `GoalStatus` (not_started, in_progress, completed, abandoned), `GoalType` (outcome, habit_based, project_based, milestone), `HabitFrequency` (daily, specific_days)  
**API Routes:** `GET/POST/PATCH /api/goals`, `GET/POST/PATCH /api/habits`, `POST /api/habits/:id/log`, `GET /api/habits/today`  
**Pages:** `/goals`, `/goals/:id`  
**Components:** `goal-dialog`, `goal-card`, `goal-filters`, `habit-dialog`, `habit-checklist`, `habit-heatmap`, `link-task-dialog`, `link-habit-dialog`

---

### 10. Knowledge Base

Note-taking and bookmark management integrated with Obsidian vault.

**Backend:** `apps/backend/src/modules/knowledge/`  
**Frontend:** `apps/frontend/src/modules/knowledge/`

- Create, update, archive, pin notes
- Quick notes saved as `.md` files into the configured Obsidian vault
- Folder-based organization with folder tree navigation
- Tag-based categorization
- Full-text search across notes
- Web bookmark saving with URL, title, description, favicon, tags
- Bookmark card grid with filtering
- Note detail panel with content preview
- Obsidian vault path configuration in settings

**Database Models:** `KnowledgeNote`, `Bookmark`  
**API Routes:** `GET/POST/PATCH /api/knowledge/notes`, `GET/POST /api/knowledge/bookmarks`  
**Pages:** `/knowledge`  
**Components:** `note-dialog`, `note-card`, `note-item`, `note-detail-panel`, `knowledge-filters`, `folder-tree`, `bookmark-dialog`, `bookmark-card`, `bookmark-filters`

---

### 11. Document Vault

Document management with file uploads, external links, and expiry tracking.

**Backend:** `apps/backend/src/modules/documents/`  
**Frontend:** `apps/frontend/src/modules/documents/`

- Upload and manage documents (local storage in `vault/` directory)
- External document links (Google Drive, etc.)
- Document categories and folder organization
- Tag-based classification
- Expiry date tracking with "expiring soon" and "expired" queries
- File upload zone with drag-and-drop
- Document card and list views
- Document detail panel
- Folder tree navigation

**Database Models:** `Document`, `DocumentFile`  
**API Routes:** `GET /api/documents`, `POST /api/documents`, `PATCH /api/documents/:id`  
**Pages:** `/documents`  
**Components:** `document-dialog`, `document-card`, `document-item`, `document-detail-panel`, `document-filters`, `document-folder-tree`, `file-upload-zone`

---

### 12. Reading List

Track articles, books, videos, podcasts, papers, and courses.

**Backend:** `apps/backend/src/modules/reading/`  
**Frontend:** `apps/frontend/src/modules/reading/`

- Add reading items of any type: article, book, video, podcast, paper, course, other
- Status workflow: want_to_read → in_progress → completed / dropped
- Progress tracking (0-100%)
- Rating system (1-5 stars)
- Favorites, notes, tags
- Collections for grouping items
- Content highlights/annotations
- Reading stats overview
- Filtering by type, status, category, collection, favorites

**Database Models:** `ContentItem`, `ContentCollection`, `ContentHighlight`  
**Enums:** `ContentType` (article, book, video, podcast, paper, course, other), `ContentStatus` (want_to_read, in_progress, completed, dropped)  
**API Routes:** `GET/POST/PATCH /api/reading`, `GET/POST /api/reading/collections`  
**Pages:** `/reading`  
**Components:** `content-item-dialog`, `content-item-card`, `content-detail-panel`, `content-filters`, `collection-dialog`, `collection-card`, `reading-stats`

---

### 13. Quick Capture

Natural language input that auto-detects intent and creates the right item.

**Backend:** `apps/backend/src/modules/quick-capture/`  
**Frontend:** `apps/frontend/src/modules/quick-capture/`

- Single text input for rapid entry
- Auto-detection of intent: task, expense, note, reminder, or event
- Manual type override
- Examples of parsing:
  - `"buy groceries tomorrow"` → creates a task with due date
  - `"₹500 uber"` → creates an expense transaction
  - `"remind me to call dentist at 5pm"` → creates a reminder
- Recent captures list showing history
- Quick capture modal accessible from anywhere in the app
- Dedicated quick capture page

**Database Models:** `QuickCapture`  
**API Routes:** `POST /api/quick-capture`  
**Pages:** `/capture`  
**Components:** `capture-input`, `capture-type-badge`, `quick-capture-button`, `quick-capture-modal`, `recent-captures-list`

---

### 14. Global Search

Cross-module search across all LifeOS data.

**Backend:** `apps/backend/src/modules/search/`  
**Frontend:** `apps/frontend/src/modules/search/`

- Search across all modules: tasks, transactions, events, reminders, projects, notes, documents, subscriptions
- Results grouped by module
- Optional module-specific search (limit to one module)
- Sort by relevance or date
- Cmd+K keyboard shortcut to open search modal
- Search result items with module-specific formatting

**API Routes:** `GET /api/search?q=`  
**Components:** `search-modal`, `search-result-item`

---

### 15. Analytics

Aggregated analytics dashboards across productivity, finance, goals, and habits.

**Backend:** `apps/backend/src/modules/analytics/`  
**Frontend:** `apps/frontend/src/modules/analytics/`

- **Productivity analytics:** Task completion rate, overdue count, average completion time, breakdown by status/priority/category, trend over time
- **Finance analytics:** Income/expense totals, savings rate, category breakdowns, daily spending pattern, monthly trend
- **Habit analytics:** Completion rates, streak tracking, per-habit performance, weekly heatmap
- **Goal analytics:** Total/completed/in-progress counts, average progress, breakdown by status and type
- Configurable period: week, month, quarter, year
- Dedicated analytics cards with Recharts visualizations

**API Routes:** `GET /api/analytics/productivity`, `GET /api/analytics/finance`, `GET /api/analytics/habits`, `GET /api/analytics/goals`  
**Pages:** `/analytics`  
**Components:** `analytics-card`, `productivity-section`, `finance-section`, `habits-section`, `goals-section`

---

### 16. Settings

Application configuration and preferences.

**Frontend:** `apps/frontend/src/modules/settings/`

- Obsidian vault folder path configuration with folder picker dialog
- User preferences management

**Pages:** `/settings`  
**Components:** `folder-picker-dialog`

---

### 17. Categories

Shared category management used across modules.

**Backend:** `apps/backend/src/modules/categories/`

- CRUD for categories
- Categories used by tasks, finance, subscriptions, projects, goals, habits, documents, knowledge notes

**API Routes:** `GET/POST/PATCH/DELETE /api/categories`

---

## App Shell & Layout

The application shell provides a consistent layout across all pages.

**Components:** `apps/frontend/src/components/layout/`

- **Sidebar** (256px, collapsible to 64px icon-only):
  - Logo + "LifeOS" branding
  - Navigation grouped into sections:
    - **Productivity:** Dashboard, Tasks, Calendar, Reminders
    - **Finance:** Finance, Subscriptions
    - **Projects:** Projects
    - **Growth:** Goals & Habits, Analytics
    - **Knowledge:** Reading, Knowledge Base, Documents
    - **Tools:** Quick Capture, Settings
  - Active item highlighting with accent color
  - Collapse toggle
- **Top Bar** (sticky):
  - Breadcrumb navigation
  - Global search with Cmd+K shortcut
  - Notification bell
  - User avatar with dropdown
- **Shared Components:**
  - `StatCard` — reusable metric card with icon, value, subtitle
  - `ConfirmDialog` — reusable confirmation modal

---

## Database Schema

**28 models** defined in Prisma schema, **14 enums** for type safety:

| Category | Models |
|----------|--------|
| Auth | `User`, `UserSettings` |
| Tasks | `Task`, `Subtask`, `TaskActivity` |
| Calendar | `CalendarEvent` |
| Reminders | `Reminder` |
| Finance | `FinanceTransaction`, `RecurringTransaction`, `Budget`, `Category` |
| Subscriptions | `Subscription` |
| Projects | `Project`, `Milestone` |
| Goals | `Goal`, `GoalMilestone`, `GoalTask` |
| Habits | `Habit`, `HabitLog`, `HabitGoal` |
| Knowledge | `KnowledgeNote`, `Bookmark` |
| Documents | `Document`, `DocumentFile` |
| Reading | `ContentItem`, `ContentCollection`, `ContentHighlight` |
| Capture | `QuickCapture` |

---

## API Routes Summary

18 route groups registered on the Express backend:

| Route | Module |
|-------|--------|
| `/api/auth` | Authentication |
| `/api/profile` | User profile |
| `/api/tasks` | Task management |
| `/api/events` | Calendar events |
| `/api/reminders` | Reminders |
| `/api/finance/transactions` | Financial transactions |
| `/api/finance/budgets` | Budget management |
| `/api/categories` | Shared categories |
| `/api/subscriptions` | Subscription tracking |
| `/api/projects` | Project management |
| `/api/knowledge` | Notes & bookmarks |
| `/api/documents` | Document vault |
| `/api/quick-capture` | Quick capture |
| `/api/search` | Global search |
| `/api/goals` | Goal tracking |
| `/api/habits` | Habit tracking |
| `/api/analytics` | Analytics dashboards |
| `/api/reading` | Reading list |

---

## MCP Server

A Model Context Protocol (MCP) server exposes LifeOS data and actions to Claude Code via 52 tools over stdio transport.

**Location:** `apps/mcp-server/`  
**SDK:** `@modelcontextprotocol/sdk` v1.15.1  
**Transport:** stdio (JSON-RPC)  
**Config:** `.mcp.json` at project root

The MCP server re-uses the backend's service layer directly (no HTTP calls), sharing the same Prisma client and database connection.

### MCP Tools — Full List (52 tools)

#### Tasks (6 tools)
| Tool | Description |
|------|-------------|
| `tasks_list` | List and filter tasks by status, priority, category, tags, overdue, My Day, project, date range, search |
| `tasks_get` | Get full task details including subtasks and activity log |
| `tasks_create` | Create a task with subtasks, recurrence, project linking, My Day |
| `tasks_update` | Update a task; completing a recurring task auto-reschedules it |
| `tasks_delete` | Soft-delete a task |
| `tasks_add_subtask` | Add a subtask to an existing task |

#### Calendar (4 tools)
| Tool | Description |
|------|-------------|
| `calendar_list` | List events with filters: category, date range, all-day, search |
| `calendar_upcoming` | Get upcoming events within the next N days |
| `calendar_create` | Create an event with datetime, location, recurrence |
| `calendar_update` | Update an existing event |

#### Reminders (4 tools)
| Tool | Description |
|------|-------------|
| `reminders_list` | List reminders with filters: status, priority, overdue, linked module, date range |
| `reminders_create` | Create a reminder with due date, priority, module link |
| `reminders_update` | Update or dismiss a reminder |
| `reminders_snooze` | Snooze a reminder for N minutes |

#### Finance (5 tools)
| Tool | Description |
|------|-------------|
| `finance_list_transactions` | List transactions with filters: type, category, date range, amount range, merchant |
| `finance_add_transaction` | Record an income, expense, or transfer transaction |
| `finance_get_summary` | Monthly summary: income, expenses, savings rate, category breakdown, daily trend |
| `finance_get_comparison` | Month-over-month comparison with deltas |
| `finance_list_budgets` | List budgets for a month with actual spend per category |

#### Subscriptions (4 tools)
| Tool | Description |
|------|-------------|
| `subscriptions_list` | List subscriptions with filters: status, category, billing cycle |
| `subscriptions_create` | Add a subscription with billing details and renewal date |
| `subscriptions_update` | Update or cancel a subscription |
| `subscriptions_get_summary` | Summary: total monthly/yearly costs, active count, upcoming renewals |

#### Projects (5 tools)
| Tool | Description |
|------|-------------|
| `projects_list` | List projects with filters and task completion stats |
| `projects_get` | Get full project details with milestones and tasks |
| `projects_create` | Create a project with metadata, dates, category |
| `projects_update` | Update a project |
| `projects_add_milestone` | Add a milestone to a project |

#### Knowledge (5 tools)
| Tool | Description |
|------|-------------|
| `knowledge_list_notes` | List notes with filters: folder, tags, pinned, archived, quick notes |
| `knowledge_get_note` | Get full note content (reads from Obsidian vault for vault notes) |
| `knowledge_create_note` | Create a quick note (saves as .md to Obsidian vault) |
| `knowledge_update_note` | Update a note: content, tags, pin/archive |
| `knowledge_save_bookmark` | Save a web bookmark with URL, title, tags |

#### Documents (2 tools)
| Tool | Description |
|------|-------------|
| `documents_list` | List documents with filters: category, folder, tags, storage type, expiry |
| `documents_get_expiring` | Get documents expiring within the next N days |

#### Quick Capture (1 tool)
| Tool | Description |
|------|-------------|
| `quick_capture` | Natural language capture: auto-detects intent and creates the right item |

#### Global Search (1 tool)
| Tool | Description |
|------|-------------|
| `global_search` | Search across all modules with grouped results |

#### Goals (4 tools)
| Tool | Description |
|------|-------------|
| `goals_list` | List goals with filters: status, type, priority, category |
| `goals_get` | Get goal details with milestones, linked tasks, linked habits |
| `goals_create` | Create a goal with type and progress mode (auto/manual) |
| `goals_update` | Update a goal, set manual progress |

#### Habits (4 tools)
| Tool | Description |
|------|-------------|
| `habits_list` | List habits with today's completion status |
| `habits_create` | Create a habit with frequency and target value |
| `habits_log` | Log a habit completion for a date; auto-recalculates streaks |
| `habits_today` | Get today's habit checklist with completion status |

#### Reading (3 tools)
| Tool | Description |
|------|-------------|
| `reading_list` | List reading items with filters: type, status, collection, favorites |
| `reading_add` | Add a reading item (article, book, video, podcast, etc.) |
| `reading_update` | Update status, progress, rating, favorites |

#### Analytics (4 tools)
| Tool | Description |
|------|-------------|
| `analytics_productivity` | Task analytics: completion rate, overdue count, breakdowns, trend |
| `analytics_finance` | Finance analytics: income/expense totals, savings rate, daily spending |
| `analytics_habits` | Habit analytics: completion rates, streaks, weekly heatmap |
| `analytics_goals` | Goal analytics: counts, average progress, breakdowns |

---

## Frontend Routes

19 routes registered in React Router:

| Path | Page | Description |
|------|------|-------------|
| `/login` | LoginPage | User login |
| `/signup` | SignupPage | User registration |
| `/` | DashboardPage | Central overview |
| `/tasks` | TasksPage | Task management |
| `/calendar` | CalendarPage | Calendar views |
| `/reminders` | RemindersPage | Reminder management |
| `/finance` | FinancePage | Financial tracking |
| `/subscriptions` | SubscriptionsPage | Subscription management |
| `/projects` | ProjectsPage | Project list |
| `/projects/:id` | ProjectDetailPage | Project detail with milestones/tasks |
| `/goals` | GoalsHabitsPage | Goals and habits combined |
| `/goals/:id` | GoalDetailPage | Goal detail with linked items |
| `/analytics` | AnalyticsPage | Analytics dashboards |
| `/reading` | ReadingPage | Reading list |
| `/knowledge` | KnowledgePage | Notes and bookmarks |
| `/documents` | DocumentsPage | Document vault |
| `/capture` | QuickCapturePage | Quick capture |
| `/profile` | ProfilePage | User profile |
| `/settings` | SettingsPage | App settings |

---

## Summary

| Metric | Count |
|--------|-------|
| Backend modules | 16 |
| Frontend modules | 18 |
| Database models | 28 |
| Database enums | 14 |
| API route groups | 18 |
| Frontend routes | 19 |
| MCP tools | 52 |
| UI components | 80+ |
