# Resurface — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Status:** Ready for Development  
> **Last Updated:** April 2026  
> **Prepared For:** Engineering / Coding Agents (Claude Code, Codex, Google Antigravity, etc.)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Jobs To Be Done (JTBD)](#4-jobs-to-be-done-jtbd)
5. [Product Goals & Success Metrics](#5-product-goals--success-metrics)
6. [Scope — What We Are (and Are NOT) Building](#6-scope--what-we-are-and-are-not-building)
7. [System Architecture Overview](#7-system-architecture-overview)
8. [Feature Specifications](#8-feature-specifications)
   - 8.1 [Browser Extension — Capture Layer](#81-browser-extension--capture-layer)
   - 8.2 [Web Dashboard — Organisation Layer](#82-web-dashboard--organisation-layer)
   - 8.3 [Weekly Email Digest — Action Layer](#83-weekly-email-digest--action-layer)
   - 8.4 [Authentication & User Management](#84-authentication--user-management)
   - 8.5 [Notifications & Reminders](#85-notifications--reminders)
9. [Data Models](#9-data-models)
10. [API Specifications](#10-api-specifications)
11. [Tech Stack Recommendations](#11-tech-stack-recommendations)
12. [User Flows](#12-user-flows)
13. [UI/UX Requirements](#13-uiux-requirements)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Milestones & Appetite (Shape Up)](#15-milestones--appetite-shape-up)
16. [Riskiest Assumptions & Mitigation](#16-riskiest-assumptions--mitigation)
17. [Anti-Goals](#17-anti-goals)
18. [Open Questions for v2](#18-open-questions-for-v2)

---

## 1. Product Overview

**Product Name:** Resurface

**Tagline:** *Your saved content, finally acted on.*

**One-liner:** Resurface is a web app + browser extension that rescues your X (Twitter) and YouTube bookmarks from being forgotten — organising them into a dashboard and delivering a weekly digest email that prompts you to actually act on what you saved.

**The Core Loop:**
```
User doomscrolls → Saves a tweet/video → Extension captures it →
Dashboard organises it → Weekly digest resurfaces it → User acts on it
```

---

## 2. Problem Statement

Social media platforms are designed to maximise time-on-site, not knowledge retention. When a user bookmarks a thread on X or saves a YouTube video, that content enters a black hole:

- **X Bookmarks** are buried behind 3 taps with no organisation, no search, no reminders.
- **YouTube "Watch Later"** is a chronological pile that grows infinitely and is never revisited.
- **The save is an intention** — but the platform provides zero infrastructure to honour that intention.

Existing solutions fall short:
- **Pocket / Instapaper** — designed for long-form articles, not tweets or videos.
- **Notion Web Clipper** — requires an existing Notion setup and manual organisation.
- **Readwise** — focused on highlights from books/articles, no native X or YouTube support.

No product today specifically closes the loop between *saving on social media* and *acting on what you saved*.

---

## 3. Target Users

### Primary User — "The Intentional Consumer"
- **Demographics:** 22–40 years old, urban professionals
- **Roles:** Entrepreneurs, indie hackers, content creators, knowledge workers
- **Behaviour:** Heavy X and YouTube users (1–3 hours/day); saves 5–20 items per week with genuine intent; uses mobile for consumption but laptop for deep work
- **Pain:** "I save things constantly but never go back. My bookmarks are a graveyard."
- **Goal:** Turn passive consumption into applied knowledge or action

### Secondary User — "The Self-Improver"
- **Demographics:** 18–35 years old
- **Roles:** Fitness enthusiasts, students, habit builders
- **Behaviour:** Saves fitness/productivity/motivation content on YouTube; wants accountability
- **Pain:** "I save every workout video but never actually do them."
- **Goal:** Bridge the gap between inspiration and follow-through

---

## 4. Jobs To Be Done (JTBD)

### The Core Job
> *"When I'm scrolling and save something I genuinely want to come back to, I want a way to ensure I actually revisit it — so I stop wasting my own intentions."*

### Push Forces (why they'll leave the status quo)
- Native bookmarks are disorganised and forgotten
- No cross-platform view of what they've saved
- Feeling of "consuming without gaining anything"
- Guilt about never acting on saved content

### Pull Forces (why they'll adopt Resurface)
- Zero-friction capture with the extension
- Organised dashboard with topics, filters, and status
- Weekly digest that feels like a curated newsletter of *their own saves*
- Reminders at times they actually choose

### Anxiety (what might stop them)
- "Will I just ignore the digest emails like every other newsletter?"
- "Do I have to manually tag everything?"
- "Is my data safe?"

### Inertia (habit friction to overcome)
- Opening a new app/dashboard takes effort
- They already have a half-working system (starred emails, screen-shotting content)

---

## 5. Product Goals & Success Metrics

### North Star Metric
**"Weekly Active Reviewers"** — users who open the digest AND mark at least 1 bookmark as reviewed in a given week.

### v1 Launch Metrics (6 weeks post-launch)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Weekly digest open rate | > 40% | Email provider analytics |
| % users reviewing ≥1 bookmark/week | > 30% | DB: `bookmark.status` updated |
| D30 retention | > 25% | Users active at Day 30 / Day 1 cohort |
| Avg. bookmarks saved per user/week | > 5 | DB aggregate |
| Extension installs → account created | > 60% | Funnel analytics |
| Unsubscribe rate from digest | < 5% | Email provider analytics |

---

## 6. Scope — What We Are (and Are NOT) Building

### ✅ In Scope — v1

| Feature | Priority |
|---------|----------|
| Browser extension (Chrome) that detects X + YouTube saves | P0 |
| Capture prompt with optional topic + reminder | P0 |
| Web dashboard with bookmark table | P0 |
| Filter/sort by platform, topic, date, status | P0 |
| Weekly email digest (1–3x/week, user-configured) | P0 |
| AI-suggested topic tagging at capture time | P1 |
| Reminder scheduling (user picks date + time) | P1 |
| Mini dashboard with stats (saves this week, top topics) | P1 |
| "Mark as reviewed" / "Snooze" actions | P1 |
| User authentication (email + Google OAuth) | P0 |

### ❌ Out of Scope — v1 (Anti-Goals)

- Mobile app (iOS or Android)
- Firefox / Safari extension support
- Reddit, LinkedIn, Substack, or any platform beyond X and YouTube
- Social/sharing features — this is a personal, private tool
- Full AI video transcription or summarisation
- Notion / Obsidian / third-party integrations
- Recommendation engine ("you might also like…")
- Team or collaborative workspaces
- Public profiles or bookmark sharing

---

## 7. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RESURFACE SYSTEM                             │
│                                                                     │
│  ┌──────────────────┐         ┌───────────────────────────────────┐ │
│  │ BROWSER EXTENSION│         │          BACKEND API              │ │
│  │  (Chrome MV3)    │─────────│  (Node.js / Express or FastAPI)  │ │
│  │                  │  HTTPS  │                                   │ │
│  │ - Detects saves  │  REST   │  - Auth (JWT)                     │ │
│  │ - Capture prompt │         │  - Bookmark CRUD                  │ │
│  │ - Metadata fetch │         │  - Topic AI suggestion            │ │
│  │ - Auth token     │         │  - Reminder scheduling            │ │
│  └──────────────────┘         │  - Digest generation              │ │
│                               │  - Email dispatch                 │ │
│  ┌──────────────────┐         └───────────────┬───────────────────┘ │
│  │   WEB DASHBOARD  │                         │                     │
│  │  (React / Next)  │─────────────────────────┘                     │
│  │                  │                         │                     │
│  │ - Bookmark table │               ┌─────────▼──────────┐          │
│  │ - Filters/sort   │               │     DATABASE       │          │
│  │ - Stats widget   │               │  (PostgreSQL)      │          │
│  │ - Settings       │               │                    │          │
│  └──────────────────┘               │  - users           │          │
│                                     │  - bookmarks       │          │
│  ┌──────────────────┐               │  - topics          │          │
│  │  EMAIL DIGEST    │               │  - reminders       │          │
│  │  (Cron + Resend) │               │  - digest_logs     │          │
│  │                  │               └────────────────────┘          │
│  │ - Weekly cron    │                                               │
│  │ - Top 5 picks    │               ┌────────────────────┐          │
│  │ - AI summaries   │               │   AI SERVICE       │          │
│  │ - Action CTAs    │               │ (OpenAI / Claude)  │          │
│  └──────────────────┘               │                    │          │
│                                     │ - Topic suggestion │          │
│                                     │ - Digest summaries │          │
│                                     └────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Feature Specifications

---

### 8.1 Browser Extension — Capture Layer

**Platform:** Chrome (Manifest V3)

#### Trigger Conditions
The extension must detect a save/bookmark action on the following:

| Platform | Action to Detect | Method |
|----------|-----------------|--------|
| X (Twitter) | User clicks the Bookmark icon on a tweet | DOM mutation observer on `[data-testid="bookmark"]` click |
| YouTube | User clicks "Save" → "Watch Later" or any playlist | DOM mutation observer on save button; listen for YouTube API events |
| YouTube Shorts | User clicks the bookmark/save icon on a Short | Same as above, scoped to `/shorts/` URL pattern |

#### Capture Prompt UI
After detecting a save action, display a **non-blocking floating modal** in the bottom-right corner of the screen within 500ms.

**Prompt contents:**
```
┌──────────────────────────────────────────┐
│ 🔖 Saved to Resurface                    │
│                                          │
│ Title: [auto-fetched title, truncated]   │
│ Platform: [X / YouTube]                  │
│                                          │
│ Topic: [AI suggestion dropdown]  ▼       │
│         (or type your own)               │
│                                          │
│ ⏰ Remind me?   [ Set reminder ]         │
│                                          │
│        [ Skip ]    [ Save & Close ]      │
└──────────────────────────────────────────┘
```

**Behaviour:**
- Auto-dismisses after 8 seconds if user takes no action (saves with no topic/reminder)
- Reminder picker opens a date + time selector inline
- Topic field has AI-suggested options pre-populated (see §8.1.3)
- "Skip" dismisses prompt; bookmark is still saved with no metadata

#### Metadata Fetched at Capture Time
The extension must extract and send the following to the backend:

```json
{
  "url": "https://twitter.com/user/status/123456",
  "platform": "x",
  "title": "Thread title or first 120 chars of tweet",
  "author": "@username",
  "thumbnail_url": "https://...",
  "saved_at": "2026-04-14T10:30:00Z",
  "topic": "entrepreneurship",
  "reminder_at": null
}
```

For YouTube:
```json
{
  "url": "https://www.youtube.com/watch?v=abc123",
  "platform": "youtube",
  "title": "Video title",
  "channel": "Channel Name",
  "duration_seconds": 1842,
  "thumbnail_url": "https://img.youtube.com/vi/abc123/hqdefault.jpg",
  "saved_at": "2026-04-14T10:30:00Z",
  "topic": "fitness",
  "reminder_at": "2026-04-16T19:00:00Z"
}
```

#### Extension Auth Flow
- On first install → redirect to `resurface.app/auth/extension` with an install token
- User logs in or creates account
- Extension receives and stores a JWT in `chrome.storage.local`
- All API calls include `Authorization: Bearer <token>`

---

### 8.2 Web Dashboard — Organisation Layer

**Framework:** Next.js (React) — server-side rendered for SEO and performance

#### Layout
```
┌────────────────────────────────────────────────────────────────┐
│  RESURFACE             [Search...]           [Settings] [Avatar]│
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│  SIDEBAR         │  MAIN CONTENT AREA                         │
│                  │                                             │
│  📊 Dashboard    │  ┌────────────────────────────────────────┐ │
│  🔖 All Saves    │  │         STATS MINI DASHBOARD           │ │
│  ✅ Reviewed     │  │  Saved this week: 12                   │ │
│  💤 Snoozed      │  │  Pending review: 28  | Top topic: AI   │ │
│  ⏰ Reminders    │  │  Streak: 3 weeks reviewed ✨            │ │
│                  │  └────────────────────────────────────────┘ │
│  TOPICS          │                                             │
│  — Fitness (8)   │  ┌──────────────────────────────────────┐  │
│  — Business (14) │  │  FILTER BAR                          │  │
│  — AI (6)        │  │  Platform: [All][X][YouTube]          │  │
│  — Design (3)    │  │  Topic: [All topics ▼]               │  │
│  + Add topic     │  │  Status: [All][Pending][Reviewed]     │  │
│                  │  │  Sort: [Date saved ▼]                 │  │
│                  │  └──────────────────────────────────────┘  │
│                  │                                             │
│                  │  ┌──────────────────────────────────────┐  │
│                  │  │  BOOKMARK TABLE                      │  │
│                  │  │  [rows — see below]                  │  │
│                  │  └──────────────────────────────────────┘  │
└──────────────────┴─────────────────────────────────────────────┘
```

#### Bookmark Table — Column Spec

| Column | Type | Sortable | Notes |
|--------|------|----------|-------|
| Thumbnail | Image | No | 48×48px; platform icon fallback |
| Title | Text | Yes | Truncated to 60 chars; click → opens original URL |
| Platform | Badge | Yes | "X" (black) or "YouTube" (red) |
| Author / Channel | Text | No | @handle or channel name |
| Topic | Pill/Tag | Yes | Editable inline on click |
| Date Saved | Date | Yes | Relative ("3 days ago") + tooltip with full date |
| Status | Badge | Yes | "Pending" (yellow) / "Reviewed" (green) / "Snoozed" (grey) |
| Actions | Buttons | No | ✅ Review · 💤 Snooze · 🗑 Delete · ↗ Open |

#### Table Behaviour
- **Pagination:** 25 rows per page with infinite scroll option
- **Bulk actions:** Select multiple → Mark reviewed / Delete / Change topic
- **Inline editing:** Click topic pill → dropdown to reassign topic
- **Row click:** Expands to show full tweet text / video description + any saved notes
- **Empty state:** "Nothing saved yet — install the extension to start capturing"

#### Stats Mini Dashboard (Top of Page)
- Total saves this week vs last week (with % delta)
- Total pending reviews
- Top topic this week
- Review streak (consecutive weeks with ≥1 reviewed item)

---

### 8.3 Weekly Email Digest — Action Layer

#### Digest Email Spec

**Subject line format:**
`Your Resurface Digest — 5 saves worth revisiting 🔖`

**Email structure:**

```
─────────────────────────────────────
RESURFACE
Your weekly saves, ready to act on.
─────────────────────────────────────

Hey [First Name],

Here are your top 5 unreviewed saves this week:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [Thumbnail]  How to Price Your First SaaS Product
               📌 X · @sweatystartup · Saved 3 days ago
               Topic: Entrepreneurship
               
               "A thread breaking down value-based pricing
                for early-stage founders with 3 frameworks..."
               
               [ ✅ Mark Reviewed ]  [ 💤 Snooze 1 week ]  [ ↗ Open ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. [Thumbnail]  Full Body Workout — No Equipment (45 min)
               ▶️ YouTube · Jeff Nippard · Saved 5 days ago
               Topic: Fitness
               
               "A science-based 45-minute full body workout..."
               
               [ ✅ Mark Reviewed ]  [ 💤 Snooze 1 week ]  [ ↗ Open ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... 3 more items ...]

─────────────────────────────────────
You have 23 more saves pending review.
[ View All on Dashboard → ]
─────────────────────────────────────
Manage digest frequency · Unsubscribe
```

#### Digest Generation Logic (Backend)

```
Selection algorithm for "top 5":
1. Filter: status = 'pending' AND user_id = current user
2. Prioritise:
   a. Items with a reminder set for this week (highest priority)
   b. Items saved > 7 days ago (about to be "stale")
   c. Items from the user's most-saved topic this week
   d. Remaining slots: most recently saved
3. Limit to 5 items
4. Generate a 1-2 sentence AI summary for each item
   (use title + author + URL as context for AI call)
```

#### Digest Scheduling Options (User-Configurable)
- **Frequency:** Once, twice, or three times per week
- **Day(s) of week:** User selects (e.g., Monday + Thursday)
- **Time of day:** User selects from 8am / 12pm / 6pm / 9pm (in their timezone)
- **Default:** Once per week, Monday at 8am

---

### 8.4 Authentication & User Management

#### Auth Methods
- Email + Password (with email verification)
- Google OAuth 2.0

#### User Settings Page
- **Profile:** Name, email, avatar
- **Digest settings:** Frequency, days, time, timezone
- **Topics:** Create, rename, delete topics
- **Connected platforms:** Show X and YouTube connection status (extension active/inactive)
- **Notifications:** Toggle reminder emails on/off
- **Account:** Export data (JSON), Delete account

---

### 8.5 Notifications & Reminders

#### In-Browser Reminder (via Extension)
When a saved reminder time is reached and the user has their browser open:
- Show a Chrome notification (via `chrome.notifications` API):
  ```
  🔖 Resurface Reminder
  "How to Price Your First SaaS Product"
  Tap to open · Dismiss
  ```

#### Reminder Email
If the browser is not open at reminder time, send a transactional email:
```
Subject: ⏰ Reminder: "How to Price Your First SaaS Product"

You asked to be reminded about this save today.

[Thumbnail]  How to Price Your First SaaS Product
             📌 X · @sweatystartup

[ Open Now → ]   [ Snooze 1 day ]   [ Mark Reviewed ]
```

---

## 9. Data Models

### `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  auth_provider TEXT DEFAULT 'email',       -- 'email' | 'google'
  timezone      TEXT DEFAULT 'UTC',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `bookmarks`
```sql
CREATE TABLE bookmarks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  platform        TEXT NOT NULL,            -- 'x' | 'youtube'
  title           TEXT,
  author          TEXT,                     -- @handle or channel name
  thumbnail_url   TEXT,
  duration_seconds INT,                     -- YouTube only
  topic_id        UUID REFERENCES topics(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'pending',   -- 'pending' | 'reviewed' | 'snoozed'
  snoozed_until   TIMESTAMPTZ,
  reminder_at     TIMESTAMPTZ,
  reminder_sent   BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  saved_at        TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_status ON bookmarks(status);
CREATE INDEX idx_bookmarks_platform ON bookmarks(platform);
CREATE INDEX idx_bookmarks_topic_id ON bookmarks(topic_id);
CREATE INDEX idx_bookmarks_reminder_at ON bookmarks(reminder_at) WHERE reminder_sent = FALSE;
```

### `topics`
```sql
CREATE TABLE topics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#6B7280',        -- hex colour for UI pill
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### `digest_settings`
```sql
CREATE TABLE digest_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  frequency       INT DEFAULT 1,            -- times per week: 1 | 2 | 3
  days_of_week    INT[] DEFAULT '{1}',      -- 0=Sun, 1=Mon ... 6=Sat
  send_time       TIME DEFAULT '08:00:00',
  is_active       BOOLEAN DEFAULT TRUE,
  last_sent_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `digest_logs`
```sql
CREATE TABLE digest_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  bookmark_ids    UUID[],                   -- which bookmarks were included
  opened          BOOLEAN DEFAULT FALSE,
  opened_at       TIMESTAMPTZ,
  items_reviewed  INT DEFAULT 0
);
```

---

## 10. API Specifications

**Base URL:** `https://api.resurface.app/v1`  
**Auth:** All protected routes require `Authorization: Bearer <jwt_token>`

---

### Authentication

#### `POST /auth/register`
```json
// Request
{ "email": "user@example.com", "password": "...", "name": "Arjun" }

// Response 201
{ "user": { "id": "...", "email": "...", "name": "..." }, "token": "jwt..." }
```

#### `POST /auth/login`
```json
// Request
{ "email": "user@example.com", "password": "..." }

// Response 200
{ "user": { ... }, "token": "jwt..." }
```

#### `GET /auth/google` — Redirects to Google OAuth
#### `GET /auth/google/callback` — Handles OAuth callback, returns JWT

---

### Bookmarks

#### `GET /bookmarks`
Query params: `platform`, `topic_id`, `status`, `sort` (saved_at|title), `order` (asc|desc), `page`, `limit`

```json
// Response 200
{
  "bookmarks": [ { ...bookmark object... } ],
  "total": 47,
  "page": 1,
  "limit": 25
}
```

#### `POST /bookmarks`
Called by extension on save.
```json
// Request
{
  "url": "https://twitter.com/...",
  "platform": "x",
  "title": "...",
  "author": "@handle",
  "thumbnail_url": "...",
  "topic_id": "uuid-or-null",
  "reminder_at": "2026-04-16T19:00:00Z"
}

// Response 201
{ "bookmark": { ...full object... } }
```

#### `PATCH /bookmarks/:id`
Update status, topic, reminder, notes.
```json
// Request (any subset of fields)
{ "status": "reviewed", "topic_id": "...", "notes": "Applied this to my pricing deck" }

// Response 200
{ "bookmark": { ...updated object... } }
```

#### `DELETE /bookmarks/:id`
```json
// Response 204 No Content
```

#### `POST /bookmarks/:id/snooze`
```json
// Request
{ "snooze_until": "2026-04-21T08:00:00Z" }

// Response 200
{ "bookmark": { ...updated object... } }
```

---

### Topics

#### `GET /topics`
```json
// Response 200
{ "topics": [ { "id": "...", "name": "Fitness", "color": "#EF4444", "count": 8 } ] }
```

#### `POST /topics`
```json
// Request
{ "name": "Entrepreneurship", "color": "#F59E0B" }
// Response 201
```

#### `PATCH /topics/:id` · `DELETE /topics/:id`

---

### AI Topic Suggestion

#### `POST /ai/suggest-topic`
Called by extension before showing prompt.
```json
// Request
{ "title": "How to Price Your First SaaS Product", "platform": "x", "author": "@sweatystartup" }

// Response 200
{ "suggestions": ["Entrepreneurship", "SaaS", "Pricing"] }
```

---

### Digest

#### `GET /digest/preview`
Returns what would be in the next digest for the current user.
```json
// Response 200
{ "bookmarks": [ ...top 5... ] }
```

#### `POST /digest/send-now`
Manually triggers a digest (for testing or user request).

#### `PATCH /digest/settings`
```json
// Request
{ "frequency": 2, "days_of_week": [1, 4], "send_time": "08:00:00", "is_active": true }
```

---

### Stats

#### `GET /stats/dashboard`
```json
// Response 200
{
  "saved_this_week": 12,
  "saved_last_week": 9,
  "pending_review": 28,
  "top_topic": "Entrepreneurship",
  "review_streak_weeks": 3,
  "platform_breakdown": { "x": 18, "youtube": 10 }
}
```

---

## 11. Tech Stack Recommendations

### Frontend (Web Dashboard)
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | SSR, great DX, Vercel deploy |
| UI components | shadcn/ui + Tailwind CSS | Unstyled primitives, fast to customise |
| State management | Zustand | Lightweight, no boilerplate |
| Data fetching | TanStack Query (React Query) | Caching, pagination, optimistic updates |
| Table | TanStack Table | Headless, sortable, filterable |
| Auth | NextAuth.js | Handles Google OAuth + email/password |
| Forms | React Hook Form + Zod | Validation with type safety |

### Backend (API)
| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | Node.js + TypeScript | Type safety; shared types with frontend |
| Framework | Fastify or Express | Fast, minimal |
| ORM | Prisma | Type-safe DB queries, easy migrations |
| Database | PostgreSQL (Supabase) | Free tier, real-time, built-in auth option |
| Auth | JWT + bcrypt | Simple, stateless |
| Email | Resend | Modern API, React Email templates |
| AI calls | OpenAI GPT-4o-mini | Cost-effective for topic suggestion + summaries |
| Job scheduler | node-cron or BullMQ | Weekly digest cron jobs |
| Storage | Cloudflare R2 | If storing thumbnails (optional) |

### Browser Extension
| Layer | Choice |
|-------|--------|
| Manifest | Version 3 (MV3) |
| Language | TypeScript |
| Build tool | Vite + CRXJS plugin |
| DOM manipulation | Vanilla JS (no heavy libs in content scripts) |
| Storage | `chrome.storage.local` for auth token |
| Notifications | `chrome.notifications` API |

### Infrastructure
| Service | Choice |
|---------|--------|
| Frontend hosting | Vercel |
| Backend hosting | Railway or Render (free tier friendly) |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| Extension distribution | Chrome Web Store |
| Monitoring | Sentry (error tracking) |

---

## 12. User Flows

### Flow 1 — New User Onboarding
```
1. User finds Resurface (landing page)
2. Clicks "Get Started" → /auth/register
3. Creates account (email or Google)
4. Redirected to /onboarding:
   a. "Install the Chrome extension" — link to Chrome Web Store
   b. "Go to X or YouTube and bookmark anything"
   c. "We'll take it from here"
5. Extension install → triggers extension auth flow
6. User is redirected to dashboard (empty state with guide)
```

### Flow 2 — Save on X (via Extension)
```
1. User is on twitter.com, scrolling
2. Clicks bookmark icon on a tweet
3. Extension content script detects click via MutationObserver
4. Extension fetches tweet metadata (title, author, URL)
5. Extension calls POST /ai/suggest-topic (async, <1s)
6. Capture prompt appears (bottom-right, non-blocking)
7. AI topic suggestions pre-fill dropdown
8. User selects topic or skips
9. User optionally sets reminder
10. Extension calls POST /bookmarks with metadata
11. API saves to DB → 201 response
12. Prompt shows "✅ Saved!" confirmation → auto-dismiss 2s
```

### Flow 3 — Weekly Digest Received
```
1. Cron job fires at user's configured day + time
2. Backend runs digest selection algorithm (top 5)
3. For each bookmark: calls AI for 1-2 sentence summary
4. React Email template rendered with 5 items
5. Resend API dispatches email
6. digest_logs record created
7. User receives email, opens it
8. Clicks "Mark Reviewed" → GET /bookmarks/:id/review (tokenised link)
9. bookmark.status updated to 'reviewed', reviewed_at set
10. digest_logs.items_reviewed incremented
```

### Flow 4 — Dashboard Review Session
```
1. User opens resurface.app
2. Dashboard loads with stats + bookmark table
3. User filters by "Pending" + "YouTube"
4. Sees 6 fitness videos pending
5. Clicks row → expanded view with description
6. Clicks ↗ Open → opens YouTube in new tab
7. Returns to dashboard, clicks ✅ → status = 'reviewed'
8. Moves to next item
```

---

## 13. UI/UX Requirements

### Design Principles
1. **Frictionless capture** — the extension prompt must never feel like an interruption. Non-blocking, auto-dismissing, quick to interact with.
2. **Calm dashboard** — not another noisy feed. Clean table, clear status, no infinite scroll by default.
3. **Digestible digest** — the email should feel like a curated briefing, not a notification dump. 5 items max.
4. **Mobile-responsive dashboard** — even though mobile app is out of scope, the web dashboard must be usable on mobile browsers for occasional access.

### Extension Prompt UX Rules
- Must appear within 500ms of save detection
- Must not block the user's scrolling or page interaction (fixed position, bottom-right, z-index managed)
- Must auto-dismiss in 8 seconds if ignored
- Width: 320px max; height: adaptive

### Dashboard UX Rules
- Default view: All saves, sorted by date saved (newest first)
- Pending items always visually distinct from reviewed (colour or opacity)
- Table rows are clickable to expand
- No modals for simple actions (review, snooze) — inline or row-level buttons only

### Accessibility
- All interactive elements must have `aria-label`
- Keyboard navigable dashboard table
- Email digest must be readable in plain text mode (no image-only content)
- Colour contrast: WCAG AA minimum

---

## 14. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Extension capture prompt latency | < 500ms from save detection |
| API response time (p95) | < 300ms for all endpoints |
| Dashboard initial load | < 2s (LCP) |
| Digest email delivery | Within 5 minutes of scheduled time |
| Uptime | 99.5% monthly |
| Data retention | User data retained for 12 months post-deletion for recovery |
| GDPR | Data export + deletion endpoints required |
| Security | All API routes authenticated; HTTPS only; no PII in logs |
| Extension permissions | Minimal: `storage`, `notifications`, `activeTab` only — no `history` or `tabs` |

---

## 15. Milestones & Appetite (Shape Up)

**Total Appetite: 6 weeks**

### Week 1–2 — Foundation
- [ ] Backend: PostgreSQL schema + Prisma migrations
- [ ] Backend: Auth endpoints (email + Google OAuth)
- [ ] Backend: Bookmark CRUD endpoints
- [ ] Extension: MV3 scaffold + auth flow
- [ ] Extension: X bookmark detection (MutationObserver)
- [ ] Extension: POST /bookmarks on detect

### Week 3 — Extension + AI
- [ ] Extension: YouTube save detection
- [ ] Extension: Capture prompt UI (no reminder yet)
- [ ] Backend: POST /ai/suggest-topic (OpenAI integration)
- [ ] Extension: Topic suggestion in prompt

### Week 4 — Dashboard
- [ ] Frontend: Next.js scaffold + auth pages
- [ ] Frontend: Bookmark table (all columns)
- [ ] Frontend: Filter bar (platform, topic, status, sort)
- [ ] Frontend: Stats mini dashboard
- [ ] Frontend: Mark reviewed / delete actions

### Week 5 — Digest + Reminders
- [ ] Backend: Digest selection algorithm
- [ ] Backend: React Email template
- [ ] Backend: Resend integration + cron job
- [ ] Backend: Digest settings endpoints
- [ ] Frontend: Digest settings page
- [ ] Extension: Reminder scheduling in prompt
- [ ] Backend: Reminder cron + Chrome notification dispatch

### Week 6 — Polish + Launch Prep
- [ ] Onboarding flow
- [ ] Empty states for all views
- [ ] Error handling (extension offline, API down)
- [ ] Extension: Chrome Web Store submission
- [ ] Landing page (single page: problem → solution → install CTA)
- [ ] Sentry integration
- [ ] End-to-end testing of core loop

---

## 16. Riskiest Assumptions & Mitigation

### RAT #1 — "Users will open and act on the digest email"
**Why it's the riskiest:** The entire behaviour-change loop depends on this. If the email is ignored, there is no product.

**Mitigation (test before building):**
Manually curate a digest for 10 target users using exported bookmarks. Send via plain Gmail. If open rate > 40% and ≥3 users report taking action → proceed.

**In-product mitigation:**
- Subject line A/B testing (personalised vs. generic)
- Send time optimisation (match user's historically active hours)
- Hard cap of 5 items (scarcity creates urgency)

---

### RAT #2 — "The extension can reliably detect saves on X and YouTube"
**Why it's risky:** Both platforms update their DOM frequently. MutationObserver hooks can break on any frontend deploy.

**Mitigation:**
- Automated weekly test against live X and YouTube pages (Playwright)
- Error monitoring in Sentry: if `bookmark_created_via_extension` events drop > 30% → alert
- Fallback: manual "Add bookmark" button in the dashboard (URL paste)

---

### RAT #3 — "Users will install a Chrome extension for this"
**Why it's risky:** Extension install friction is high; users are wary of permissions.

**Mitigation:**
- Request minimal permissions only (`activeTab`, `storage`, `notifications`)
- Clearly state what the extension can and cannot see (privacy-first messaging)
- Fallback: bookmarklet (JavaScript bookmark in browser) for users who won't install an extension

---

## 17. Anti-Goals

These are explicit decisions about what Resurface will NOT do in v1. These exist to protect scope and focus.

| Anti-Goal | Reason |
|-----------|--------|
| No mobile app | Platform risk; high cost; web-first validates the model first |
| No AI video summarisation | Cost and latency; title + description is sufficient for v1 |
| No social/sharing features | Privacy is a feature; users save personal content |
| No Firefox/Safari extension | Chrome is 65%+ market share; validate first |
| No Reddit/LinkedIn support | Focus breeds trust; expand in v2 based on user requests |
| No Notion/Obsidian integration | Build the habit first; power-user integrations are v2 |
| No in-app content reader | Not a read-it-later app; always opens the original source |
| No recommendation engine | Resurface resurfaces *your* content, not new content |

---

## 18. Open Questions for v2

These are intentionally deferred. Do not address in v1.

1. **Mobile gap:** Is a native "Share to Resurface" iOS/Android share sheet extension a viable v1.5 — without a full app? This would solve the mobile capture problem without the cost of a full native build.

2. **Monetisation model:** What is the freemium line?
   - Option A: Free tier = 30 saves/month cap; Paid = unlimited
   - Option B: Free tier = digest only (no reminders); Paid = full features
   - Option C: Free forever, charge for AI features (topic suggestions, summaries)

3. **"Acted on" definition:** Does clicking a link in the digest count as "reviewed"? Or does it require a self-reported "I did this"? The latter is more honest but adds friction.

4. **Cross-platform expansion:** After X and YouTube — what's next? Reddit is the most requested. LinkedIn second. Each requires its own DOM detective work.

5. **Import from native bookmarks:** Can users bulk-import their existing X bookmarks and YouTube Watch Later? X has an API for this. YouTube Data API v3 has playlist read access. This would give users instant value on day one.

6. **Browser extension → PWA bridge:** Can a PWA with a custom share target replace the extension for mobile saves? Worth investigating for v1.5.

---

## Appendix A — Naming & Branding Notes

**Product name:** Resurface

**Why:** Captures the core mechanic (bringing saved content back to the surface) and the emotional promise (your intentions are not buried). Clean, one-word, memorable. Domain: `resurface.app`

**Voice:** Clear, calm, trustworthy. Never urgent or alarming. The product is your organised, reliable assistant — not another notification source.

---

## Appendix B — Extension Permissions Justification

To be included in Chrome Web Store submission:

| Permission | Why Needed |
|------------|------------|
| `activeTab` | Read the current page URL and title at save time only |
| `storage` | Store authentication token locally |
| `notifications` | Show reminder notifications when bookmark reminder time is reached |
| `host_permissions: twitter.com, x.com, youtube.com` | Inject content script to detect save actions on these sites only |

**We do NOT request:** `history`, `tabs`, `browsingData`, `cookies`, `webRequest`

---

*End of Document — Resurface PRD v1.0*
