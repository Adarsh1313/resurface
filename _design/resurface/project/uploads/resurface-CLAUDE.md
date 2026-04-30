# Resurface — Project Context

**Status:** Greenfield. PRD complete. Currently scaffolding.
**Goal:** Build v1 in 6 weeks. Chrome extension + web dashboard + email digest.

---

## What This Project Is

A web app + Chrome extension that rescues X (Twitter) and YouTube bookmarks
from being forgotten. Users save content normally on X/YouTube, the extension
captures it silently, the dashboard organises it, and a weekly email digest
resurfaces the saves so users actually act on them.

Core loop: Save on social → Extension captures → Dashboard organises →
Weekly digest resurfaces → User acts on it.

Source of truth: `PRD.md` in the project root. Read it before any task.

---

## Monorepo Structure

```
resurface/
├── PRD.md                  ← READ THIS FIRST before any task
├── CLAUDE.md               ← this file
├── backend/                ← Node.js/Express, PostgreSQL, Prisma
├── extension/              ← Chrome MV3
└── web/                    ← Next.js dashboard
```

Each directory is a separate agent domain. When working in one directory,
do not modify files in another directory unless explicitly instructed.

---

## Tech Stack

**Backend** (`/backend`):
- Node.js + Express (or FastAPI — TBD at scaffold time)
- PostgreSQL + Prisma ORM
- JWT auth + Google OAuth (NextAuth or Passport)
- Resend for email
- Node-cron for digest scheduling

**Extension** (`/extension`):
- Chrome MV3
- MutationObserver for X and YouTube save detection
- Capture prompt UI: bottom-right, 320px wide, auto-dismiss 8s
- chrome.storage.local for JWT storage

**Frontend** (`/web`):
- Next.js 14 (App Router)
- React Query for server state
- Tailwind CSS + Shadcn/ui

---

## API Contract (Shared Between All Agents)

All three components (backend, extension, web) must follow the API contracts
defined in `PRD.md §10`. Before building any API consumer or provider,
read §10 to ensure the endpoint URLs, request bodies, and response shapes match.

Do not invent API shapes. Use the PRD as the contract.

---

## Current Phase

**Week 1–2: Foundation**

- [ ] Backend: PostgreSQL schema + Prisma migrations (from PRD §9)
- [ ] Backend: Auth endpoints (email + Google OAuth)
- [ ] Backend: Bookmark CRUD endpoints (from PRD §10)
- [ ] Extension: MV3 scaffold + auth flow
- [ ] Extension: X bookmark detection (MutationObserver on `[data-testid="bookmark"]`)
- [ ] Extension: POST /bookmarks on detection
- [ ] Frontend: Next.js scaffold + auth pages

---

## What Must NOT Change Once Built

- Extension permissions: `activeTab`, `storage`, `notifications`,
  `host_permissions: twitter.com, x.com, youtube.com` ONLY.
  Do not add `history`, `tabs`, `browsingData`, or `cookies`.
- Capture prompt must not block scrolling — `position: fixed`, bottom-right,
  `z-index` managed, 320px max width, auto-dismiss after 8 seconds.
- The digest is capped at 5 items. Do not increase this.

---

## Out of Scope for v1 (Do Not Build)

- Mobile app
- Firefox/Safari extension
- Reddit, LinkedIn, Substack support
- AI video transcription or summarisation
- Notion/Obsidian integrations
- Social/sharing features
- Recommendation engine
- Team workspaces

If a task touches any of the above, flag it and do not implement.

---

## Skills Active for This Project

- `backend-development` — Express/FastAPI, PostgreSQL, Prisma
- `auth` — JWT, Google OAuth, session management
- `database` — schema design, migrations, query patterns
- `chrome-extension` — MV3, MutationObserver, capture prompt
- `frontend-development` — Next.js dashboard, React Query
- `api-design` — REST contract between extension and backend
- `email-notifications` — Resend integration, digest template
- `background-jobs` — cron job for weekly digest
- `security` — minimal permissions, HTTPS only, no PII in logs
- `observability` — Sentry integration (Week 6)
