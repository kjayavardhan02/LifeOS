# LifeOS — Phase Overview

**Document type:** Development reference
**Last updated:** 2026-11-07
**Status:** MVP modules detailed, Phase 2–5 modules at high-level scope

---

## Product Vision

LifeOS is a centralized personal management platform — one place to manage
productivity, finances, projects, documents, knowledge, health, and everything
else in your life. It is a web-only, localhost-first application.

---

## Phase 1 — Core Foundation / MVP

The foundation. Get the essential modules working end-to-end.

### 1. Dashboard
- Central command center — shows the state of your life at a glance
- Customizable drag-and-drop widgets: today's tasks, upcoming events, active reminders, finance snapshot, recent transactions, project progress, quick stats strip, recent activity feed
- Each widget links to its parent module via "view all"
- Floating Quick Capture button always visible
- Widgets for unavailable modules are hidden or show "coming soon"
- Responsive — stacks on mobile, grid on desktop
- Data refreshes on page load (no real-time websocket for MVP)

### 2. Task Management
- Create/edit/delete tasks with: title, description (rich text), priority (low/medium/high/urgent), status (to-do/in-progress/done/cancelled), category, tags, due date & time, estimated duration, subtasks (one level deep), recurring tasks, file attachments, notes
- Optional project association
- Reminders per task (links to Reminders module)
- Views: List (sortable/filterable), Kanban (by status), Calendar (by due date), My Day (curated daily focus)
- Full-text search, filter by status/priority/category/tags/project/date/overdue
- Task activity history (created, edited, status changed, completed)
- Default categories: Personal, Work, Learning, Finance, Health, Errands, Shopping (customizable)

### 3. Calendar & Events
- Create/edit/delete events with: title, description, start/end date & time, location (text), category, reminder, all-day flag, recurring pattern
- Color coding by category
- Views: Day (hourly timeline), Week (7-day grid), Month (traditional grid), Agenda (scrollable list)
- Shows task due dates, reminder dates, and subscription renewals from other modules (read-only references, not duplicated)
- Default categories: Meeting, Personal, Birthday, Holiday, Deadline, Appointment

### 4. Reminders
- Create/edit/delete reminders with: title, description, date & time, repeat pattern, category, priority, linked module (optional)
- One-time and recurring (daily/weekly/monthly/yearly/custom)
- Snooze (15min, 1hr, tomorrow, custom), mark done, dismiss
- Notification delivery: in-app notification center (bell icon + badge), optional browser push notifications, email notifications (per-reminder or daily digest)
- Backend scheduler fires reminders even when browser is closed
- Overdue reminders stay visible until dismissed
- Auto-created by: tasks, subscriptions (renewal), calendar events, document vault (expiry dates)
- Default categories: Bill Payment, Subscription Renewal, Birthday, Anniversary, Document Expiry, Deadline, Custom

### 5. Finance Management
- Add/edit/delete transactions with: amount, type (income/expense/transfer), date, category, subcategory, payment method, merchant/source, notes, tags, receipt attachment (optional)
- Recurring transactions (salary, rent, EMI — auto-creates entries)
- Refund handling (link refund to original transaction)
- Internal transfers excluded from income/expense reports
- Budgets: monthly overall + per-category limits, progress bars, warnings at 50%/80%/100%
- Reports: monthly overview (income/expense/savings/savings rate), category breakdown (pie/bar chart), daily spending trend, income vs expense comparison, yearly month-by-month summary
- Transaction list: searchable, filterable (date range, category, payment method, type, amount range, tags), sortable
- **MVP: Manual entry only** — CSV import and bank integrations deferred to later phases
- Default income categories: Salary, Freelance, Interest, Cashback, Gift, Reimbursement, Other
- Default expense categories: Food & Dining, Groceries, Transport, Rent, Utilities, Shopping, Entertainment, Health, Education, Subscriptions, EMI, Personal Care, Travel, Gifts, Other
- Payment methods: Cash, UPI, Debit Card, Credit Card, Net Banking, Wallet (all customizable)

### 6. Subscription Manager
- Add/edit/delete subscriptions with: name, provider, amount, billing cycle (monthly/quarterly/yearly/custom), next renewal date, payment method, category, status (active/paused/cancelled/trial/expired), start date, notes, URL/login reference
- Auto-calculates monthly equivalent and yearly total cost
- Renewal reminders (configurable: 1/3/7 days before)
- Payment history per subscription
- Dashboard: total monthly cost, total yearly cost, upcoming renewals, category breakdown
- Auto-creates reminders in Reminders module, shows on Calendar, links to Finance transactions
- Default categories: Streaming, Software/Tools, Cloud/Storage, News/Media, Health/Fitness, Education, Gaming, Other

### 7. Project Management
- Create/edit/delete/archive projects with: name, description (rich text), status, priority, category, start date, target end date, tags, color label
- Milestones: title, description, target date, status (pending/in-progress/completed), linked tasks
- Associated tasks: link existing tasks or create from within project
- Progress: auto-calculated from task/milestone completion %
- Project notes (rich text) and file attachments
- Views: Project list (cards/rows, filterable), Project detail (overview + milestones + tasks + notes + activity), Board view (cards by status columns)
- Statuses: Planning, Active, On Hold, Completed, Archived
- Priority: Low, Medium, High, Critical
- Tasks belong to Task Management (source of truth), projects reference them
- Activity log per project
- Default categories: Personal, Work, Learning, Side Project, Home, Finance, Health (customizable)

### 8. Knowledge Base (Obsidian Integration)
- **Reads Obsidian vault** from a local folder — LifeOS is the reader/search layer, Obsidian is the editor
- Scans and indexes all `.md` files from the configured vault path
- Reads Obsidian frontmatter (tags, aliases) for filtering
- Detects new/changed/deleted files (file watcher or on-demand rescan)
- **Quick notes** created inside LifeOS are saved as `.md` files into the Obsidian vault (in a configurable subfolder like `LifeOS-Notes/`)
- Simple Markdown editor for quick notes: title + content + tags, Markdown preview
- Browse by folder structure, search full-text, filter by tags/category/date
- Views: Grid (cards with preview), List (compact rows), Folder/tree view
- Bookmarks: save URL with title, description, tags (special note type)
- Note templates: meeting notes, research, custom (optional)
- "Open in Obsidian" button per note
- Pin and archive notes

### 9. Document Vault
- Upload/view/download/delete documents with: name, type/category, description, tags, upload date, expiry date, issuer, document number, notes
- **Dual storage: local file upload OR external link (Google Drive, etc.)**
- Local files stored in `vault/` folder on disk, organized by category subfolders
- External links open in a new tab
- Metadata in database, local files on disk
- Multiple files per document entry (e.g., front and back of ID card)
- Supported formats: PDF, images (JPG/PNG), Word, Excel
- Expiry date reminders auto-created in Reminders module
- Version history (re-upload renewed document, keep old versions)
- Search across name, type, description, document number, tags
- Quick reference: document number fields are searchable ("what's my PAN number")
- Security: files served through backend only (not public static), authentication required, audit log
- Default folders: Identity, Education, Employment, Financial, Insurance, Property, Medical, Warranties & Invoices, Contracts & Legal, Other

### 10. Universal Quick Capture
- Floating button (bottom-right) on all pages + keyboard shortcut (Ctrl+K or Ctrl+Shift+N)
- Opens minimal modal/slide-in panel
- Capture types: Task, Expense, Note, Reminder, Event, Bookmark, Idea
- Auto-detect type from input ("300 food zomato" → Expense, "call mom tomorrow 5pm" → Reminder)
- Manual type selection via tabs/dropdown
- Minimal required fields — capture fast, refine later
- Smart defaults: expense defaults to today + last-used payment method, task defaults to medium priority, reminder defaults to tomorrow if no date
- Confirmation with "open full entry" link after saving
- Recent captures list

### 11. Global Search
- Search bar in top navigation on every page + keyboard shortcut (Ctrl+K or /)
- Searches across ALL modules: tasks, transactions, events, reminders, projects, notes, documents, subscriptions
- Results grouped by module, each showing: module icon, title, context snippet with highlighted match, date
- Click result → navigate to item's detail view
- Filter results by module after searching
- Sort by relevance (default) or date
- Debounced search (~300ms)
- Recent searches remembered
- PostgreSQL full-text search for MVP (upgrade to Meilisearch/Elasticsearch later)

---

## Phase 2 — Personal Management Expansion

Expand into personal life management, health, and growth modules.

### 12. Goals & Habits
- Short-term and long-term goals, milestones, progress tracking
- Daily habits, logging, streaks, completion history
- Goal-related tasks linking to Task Management

### 13. Personal Analytics
- Productivity and task completion stats
- Expenditure, savings, and budget utilization
- Habit consistency, learning hours, goal progress
- Time usage analysis, monthly/yearly comparisons

### 14. Learning & Skill Tracker
- Skills and proficiency levels
- Learning roadmaps, courses, certifications
- Study hours, milestones, revision tracking

### 15. Reading & Content Manager
- Articles, blogs, books, videos, podcasts, research papers
- Read-later queue, reading progress, highlights, summaries

### 16. Personal Inventory
- Electronics, gadgets, appliances, furniture, vehicles
- Purchase date/price, serial numbers, warranty/invoice references
- Maintenance records, estimated current value

### 17. Wishlist & Purchase Planner
- Products and links, target prices, purchase priority
- Planned purchase date, actual price, price history
- Links to Finance and Inventory modules

### 18. Time Management
- Time tracking, focus sessions, Pomodoro timer
- Planned vs actual time, time per task/project
- Productivity reports

### 19. Travel Manager
- Trips, itineraries, flights, hotels, travel expenses
- Destinations, packing lists, travel documents, travel history

### 20. Personal CRM
- Contacts, company/designation, important dates
- Interaction history, notes, follow-ups, categories

### 21. Personal Journal
- Daily entries, reflections, achievements, experiences
- Lessons learned, monthly reflections
- AI analysis optional and user-controlled (later phase)

### 22. Decision Journal
- Decisions, reasoning, alternatives considered
- Expected outcomes, risks, actual results
- Retrospective analysis

### 23. Life Timeline
- Chronological history: career milestones, achievements, purchases, trips, certifications, important personal events

### 24. Health & Wellness (new)
- Sleep tracking, workout log, water intake, weight
- Medical records, appointments
- Pairs with Goals & Habits

### 25. Entertainment Tracker (new)
- Movies, shows, music, games
- Watchlist, ratings, recommendations

### 26. Achievements / Wins Log (new)
- Running list of accomplishments
- Useful for resume updates, self-reflection, reviews

### 27. Emergency Quick Reference (new)
- Blood type, allergies, emergency contacts
- Insurance info, medical conditions
- Simple but potentially life-saving

---

## Phase 3 — AI Integration

Add intelligence and natural-language capabilities across the platform.

### 28. AI Assistant
- Natural-language commands for data retrieval, task/reminder creation, financial queries, planning, prioritization
- Cross-module analysis, weekly/monthly reviews, recommendations
- AI accesses data through authorized backend services and MCP tools (no direct DB access)

### 29. Daily Briefing
- AI-generated daily overview: priorities, upcoming events, deadlines, pending tasks, financial info, areas needing attention

### 30. AI Insights & Reports
- Monthly life reports, spending insights, productivity analysis
- Goal progress analysis, weekly summaries, annual reviews

---

## Phase 4 — Advanced Intelligence

Rule-based and AI-powered automation, knowledge graph.

### 31. Personal Automation Engine
- Rule-based workflows: triggers (events, dates, thresholds) → actions
- Examples: alert at 80% budget, notify on overdue task, remind before renewal

### 32. Personal Knowledge Graph
- Relationships between goals, projects, notes, tasks, certifications
- Contextual search and richer AI reasoning
- Aspirational — extremely complex to build well

### 33. AI Personal Automation
- AI-assisted multi-module workflows: review upcoming week, find conflicts, propose schedules
- Sensitive actions require user confirmation

---

## Phase 5 — External Integrations

Connect LifeOS to the outside world.

### 34. Automated Transaction Collection
- CSV, Excel, PDF bank statement import with parsing
- Duplicate detection, refund/reversal detection
- AI-assisted categorization, manual review for uncertain records
- Account Aggregator ecosystem exploration (future)

### 35. External Integrations
- Google Calendar sync
- Email integrations
- Browser notifications
- Document processing
- External MCP client support

---

## Shared Platform Capabilities (across all phases)

| Capability | Responsibility |
|---|---|
| Authentication | Registration, login, sessions, MFA, account recovery |
| User Profile | Personal details and preferences |
| Authorization | User-level access control |
| Notification Service | In-app, email, optional browser push |
| File Storage | Local vault/ folder for documents + Obsidian vault for notes |
| Background Scheduler | Reminders, recurring jobs, scheduled workflows |
| Global Activity Log | Important actions across modules |
| Settings | Application, privacy, and security preferences |
| Backup & Export | Data backup, recovery, and portability |
