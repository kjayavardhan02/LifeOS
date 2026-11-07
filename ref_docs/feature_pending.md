# LifeOS — Features Pending (Not Yet Specified)

**Document type:** Pending feature tracker
**Last updated:** 2026-11-07
**Status:** These modules have high-level scope but need detailed specification before development

---

## How to read this document

Modules listed here are **planned but not yet fully specified**. Each needs a
detailed breakdown (features, data model, views, integrations, workflows) before
implementation begins. They are grouped by phase and priority.

---

## Phase 2 — Personal Management Expansion

These modules expand LifeOS into personal life management, health, and growth.
To be specified and built after all Phase 1 (MVP) modules are functional.

### 12. Goals & Habits
- **Scope:** Short/long-term goals, milestones, progress tracking, daily habits, streaks, completion history
- **Pending decisions:** Goal hierarchy structure, habit frequency options, streak calculation rules, how goals link to tasks and projects
- **Depends on:** Task Management (linking goals to tasks)

### 13. Personal Analytics
- **Scope:** Dashboards for productivity, spending, savings, habit consistency, learning hours, goal progress, time usage, monthly/yearly comparisons
- **Pending decisions:** Which metrics to track, chart types, comparison periods, whether to merge with AI Insights & Reports (overlap noted)
- **Depends on:** All Phase 1 modules (aggregates data from them)

### 14. Learning & Skill Tracker
- **Scope:** Skills with proficiency levels, learning roadmaps, courses, certifications, study hours, milestones, revision tracking
- **Pending decisions:** Proficiency scale, roadmap structure, how certifications link to Document Vault and Achievements
- **Depends on:** Task Management, Knowledge Base, Document Vault

### 15. Reading & Content Manager
- **Scope:** Articles, blogs, books, videos, podcasts, research papers; read-later queue, reading progress, highlights, summaries
- **Pending decisions:** Content types to support, highlight/annotation storage, integration with Knowledge Base bookmarks (overlap)
- **Depends on:** Knowledge Base

### 16. Personal Inventory
- **Scope:** Electronics, gadgets, appliances, furniture, vehicles; purchase details, serial numbers, warranty/invoice references, maintenance records, estimated value
- **Pending decisions:** Depreciation calculation, how to link to Document Vault (warranties/invoices) and Finance (purchase transactions)
- **Depends on:** Document Vault, Finance Management

### 17. Wishlist & Purchase Planner
- **Scope:** Products with links, target prices, purchase priority, planned date, actual price, price history
- **Pending decisions:** Price tracking mechanism (manual vs scraping), how purchase converts to Inventory item and Finance transaction
- **Depends on:** Finance Management, Personal Inventory

### 18. Time Management
- **Scope:** Time tracking, focus sessions, Pomodoro timer, planned vs actual time, time per task/project, productivity reports
- **Pending decisions:** Timer UI, whether time entries attach to tasks automatically, Pomodoro customization options
- **Depends on:** Task Management, Project Management

### 19. Travel Manager
- **Scope:** Trips, itineraries, flights, hotels, travel expenses, destinations, packing lists, travel documents, travel history
- **Pending decisions:** Trip planning workflow, expense linking to Finance, document linking to Document Vault, packing list templates
- **Depends on:** Finance Management, Document Vault, Calendar

### 20. Personal CRM
- **Scope:** Contacts with company/designation, important dates, interaction history, notes, follow-ups, categories
- **Pending decisions:** Contact fields, interaction types, how follow-ups link to Reminders/Tasks, birthday linking to Calendar
- **Depends on:** Reminders, Calendar, Task Management

### 21. Personal Journal
- **Scope:** Daily entries, reflections, achievements, experiences, lessons learned, monthly reflections
- **Pending decisions:** Entry structure (free-form vs template), mood tagging, whether to store in Obsidian vault or separately, AI analysis scope
- **Depends on:** Knowledge Base (storage decision)

### 22. Decision Journal
- **Scope:** Decisions with reasoning, alternatives considered, expected outcomes, risks, actual results, retrospective analysis
- **Pending decisions:** Decision template structure, review/revisit schedule, how to prompt for retrospective
- **Depends on:** Reminders (review prompts)

### 23. Life Timeline
- **Scope:** Chronological history of career milestones, achievements, purchases, trips, certifications, important personal events
- **Pending decisions:** Event types, how to pull data from other modules vs manual entry, visualization format (vertical timeline, etc.)
- **Depends on:** All other modules (aggregation layer)

### 24. Health & Wellness (new addition)
- **Scope:** Sleep tracking, workout log, water intake, weight, medical records, appointments
- **Pending decisions:** Tracking input method (manual vs wearable integration), medical record storage (in Document Vault or separate), health metrics and charts
- **Depends on:** Document Vault (medical records), Calendar (appointments), Reminders

### 25. Entertainment Tracker (new addition)
- **Scope:** Movies, shows, music, games; watchlist, ratings, recommendations
- **Pending decisions:** Content database source (manual entry vs API like TMDB/IGDB), rating scale, recommendation logic
- **Depends on:** None (standalone)

### 26. Achievements / Wins Log (new addition)
- **Scope:** Running list of accomplishments for self-reflection and resume updates
- **Pending decisions:** Achievement categories, linking to projects/goals/learning, export format for resume use
- **Depends on:** Project Management, Goals & Habits, Learning & Skill Tracker

### 27. Emergency Quick Reference (new addition)
- **Scope:** Blood type, allergies, emergency contacts, insurance info, medical conditions
- **Pending decisions:** Data fields, access without login (emergency scenario?), linking to Document Vault for insurance documents
- **Depends on:** Document Vault

---

## Phase 3 — AI Integration

### 28. AI Assistant
- **Scope:** Natural-language commands, data retrieval, task/reminder creation, financial queries, planning, cross-module analysis, recommendations
- **Pending decisions:** LLM provider, MCP tool design, conversation memory, authorization boundaries, which actions need user confirmation
- **Depends on:** All Phase 1 modules, MCP server infrastructure

### 29. Daily Briefing
- **Scope:** AI-generated daily overview with priorities, events, deadlines, tasks, financial info
- **Pending decisions:** Generation trigger (on login vs scheduled), delivery format (dashboard widget vs email vs both), content selection logic
- **Depends on:** AI Assistant, Dashboard

### 30. AI Insights & Reports
- **Scope:** Monthly life reports, spending insights, productivity analysis, goal progress, weekly summaries, annual reviews
- **Pending decisions:** Report templates, generation schedule, whether to merge with Personal Analytics (overlap noted)
- **Depends on:** AI Assistant, all data modules

---

## Phase 4 — Advanced Intelligence

### 31. Personal Automation Engine
- **Scope:** Rule-based workflows — triggers (events, dates, thresholds) → actions (alerts, notifications, reports)
- **Pending decisions:** Rule definition UI, trigger types, action types, whether to merge with AI Personal Automation (overlap noted)
- **Depends on:** All modules (triggers can come from any module)

### 32. Personal Knowledge Graph
- **Scope:** Relationships between goals, projects, notes, tasks, certifications, achievements for contextual search and AI reasoning
- **Pending decisions:** Graph database vs relational modeling, visualization, query interface
- **Note:** Labeled aspirational — extremely complex to build well
- **Depends on:** All modules

### 33. AI Personal Automation
- **Scope:** AI-assisted multi-module workflows — review week, find conflicts, propose schedules, identify unfinished tasks
- **Pending decisions:** Workflow templates, confirmation UX for sensitive actions, whether to merge with Personal Automation Engine (overlap noted)
- **Depends on:** AI Assistant, Personal Automation Engine

---

## Phase 5 — External Integrations

### 34. Automated Transaction Collection
- **Scope:** CSV/Excel/PDF bank statement import, parsing, deduplication, refund detection, AI categorization, manual review
- **Pending decisions:** Supported bank formats, parser architecture, Account Aggregator feasibility
- **Depends on:** Finance Management

### 35. External Integrations
- **Scope:** Google Calendar sync, email integrations, browser notifications, document processing, external MCP client support
- **Pending decisions:** Which integrations to prioritize, OAuth flows, sync conflict resolution
- **Depends on:** Respective modules

---

## Noted Overlaps to Resolve

These module pairs have significant overlap and should be evaluated for merging
during their specification phase:

1. **Personal Analytics + AI Insights & Reports** — both generate cross-module reports and analysis
2. **Personal Automation Engine + AI Personal Automation** — rule-based and AI automation are two tiers of the same concept

---

## Tech Stack — DECIDED

- **Frontend:** React + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **MCP Server:** TypeScript (`@modelcontextprotocol/sdk`), shares backend services directly
- **Background Jobs:** node-cron + Bull (Redis-backed queue)
- **Email:** Nodemailer (SMTP)
- **File Watching:** chokidar (Obsidian vault monitoring)
- **Why TypeScript everywhere:** One language, shared types across frontend/backend/MCP. MCP SDK is TypeScript-first.
