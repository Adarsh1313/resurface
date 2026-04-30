# Resurface

> **Your saved content, finally acted on.**

Resurface is a Chrome extension + web dashboard that rescues your X (Twitter) and YouTube bookmarks from being forgotten — organising them, tagging them automatically, and delivering a weekly digest email that prompts you to actually act on what you saved.

---

## The Problem

Social platforms are engineered to maximise time-on-site, not knowledge retention. Every "Save for later" is an intention — but platforms provide zero infrastructure to honour it.

**The numbers are stark:**

- **≥ 80% of saved content is never revisited.** [Source: Pocket internal data, 2021] The average Pocket user saves 3× more than they read.
- **X (Twitter) has 500M+ bookmarks saved per month** with no organisation, no reminders, and no search on mobile — buried behind 3 taps.
- **YouTube's "Watch Later" queue grows by ~1 billion videos per day** globally. The median Watch Later list is never fully consumed; most users abandon it entirely.
- **Knowledge workers lose an estimated 2.5 hours/week** re-finding content they know they saw but can't locate. [McKinsey Global Institute, "The social economy", 2012]
- **The "intention–action gap"** in behavioural economics is well-documented: declaring intent (bookmarking) reduces the perceived urgency to act. Saving something *feels* like doing something. It isn't.

**Existing tools don't solve this:**

| Tool | Gap |
|------|-----|
| Pocket / Instapaper | Designed for long-form articles. No native X thread or YouTube support. |
| Notion Web Clipper | Requires an existing Notion setup and heavy manual organisation. |
| Readwise | Focused on book/article highlights. No X or YouTube capture. |
| Native bookmarks | No cross-platform view, no reminders, no resurfacing mechanism. |

**No product today closes the loop between saving on social media and acting on what you saved.**

---

## The Solution

```
Doomscroll → Save on X/YouTube → Extension captures silently →
Dashboard organises automatically → Weekly digest resurfaces it →
You finally act on it
```

Resurface has three layers:

1. **Capture** — A Chrome extension that detects when you bookmark a tweet or save a YouTube video, silently captures it, and shows a lightweight 8-second prompt to add a topic or set a reminder. Zero friction.

2. **Organise** — A web dashboard that shows all your saves in one place, auto-tagged by AI into topics (no manual work), filterable by platform, status, and date. See what you've reviewed, what's snoozed, what has reminders.

3. **Resurface** — A weekly digest email — curated from *your own saves* — that lands in your inbox and pushes you to act. Not another newsletter. Your stuff, resurfaced.

---

## Current Status

| Phase | Status |
|-------|--------|
| Phase 1 — Working locally | ✅ In progress |
| Phase 1.5 — Personal dogfooding (7 days) | ⏳ Upcoming |
| Phase 2 — Deploy + waitlist + public launch | 🔜 |
| Phase 2.5 — Demand validation | 🔜 |
| Phase 3 — Chrome Web Store + AI + polish | 🔜 |

---

## Features (v1)

- [x] Chrome MV3 extension — detects X + YouTube save events
- [x] Capture prompt — 320px, bottom-right, auto-dismiss 8s, topic + reminder UI
- [x] Web dashboard — bookmark table, sidebar, topic chips, platform pills
- [x] AI topic suggestion — rule-based tagger (no API key required for v1)
- [x] Reminder scheduling — pick date + time, email fires at due time
- [x] Snooze — defer a bookmark for later
- [x] Weekly email digest — 5-item curated list
- [x] Auth — email/password + JWT
- [ ] Google OAuth
- [ ] Settings page wired to backend
- [ ] Extension auth flow (popup login + JWT in chrome.storage)
- [ ] Onboarding flow completion
- [ ] Chrome Web Store listing

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), React Query, Tailwind CSS v4, Zustand |
| Backend | Node.js, Express 5, Prisma ORM, SQLite → Supabase (PostgreSQL) |
| Extension | Chrome MV3, TypeScript, MutationObserver |
| Email | Resend |
| Auth | JWT (email/pass), Google OAuth (Phase 2) |
| Deployment | Vercel (web), Render (backend), Supabase (DB) |
| CI/CD | GitHub Actions → Vercel auto-deploy |

---

## Repository Structure

```
resurface/
├── web/          ← Next.js dashboard (deployed to Vercel)
├── backend/      ← Express API + Prisma (deployed to Render)
├── extension/    ← Chrome MV3 extension
├── docs/         ← Specs and paid-services notes
├── _design/      ← Design assets and references
├── ROADMAP.md    ← Living roadmap and decision log
└── README.md     ← You are here
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/resurface.git
cd resurface
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env       # fill in JWT_SECRET at minimum
npm install
npx prisma migrate dev     # creates dev.db and runs migrations
npx prisma db seed         # seeds demo user + bookmarks
npm run dev                # starts on http://localhost:3001
```

### 3. Start the frontend

```bash
cd web
cp .env.example .env.local  # set NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/v1
npm install
npm run dev                  # starts on http://localhost:3000
```

### 4. Load the extension

```bash
cd extension
npm install
npm run build              # compiles TS → dist/
```

Then in Chrome: **Settings → Extensions → Load unpacked** → select the `extension/` folder.

### Demo credentials

After seeding, log in at `http://localhost:3000/login` with:
- Email: `demo@resurface.app`
- Password: `demo1234`

---

## Roadmap

See **[ROADMAP.md](./ROADMAP.md)** for the full decision log. Summary:

### Phase 2 — Deploy + Demand Validation
- [ ] Migrate DB from SQLite to Supabase (PostgreSQL)
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel with custom domain
- [ ] Wire `NEXT_PUBLIC_API_BASE_URL` to production API
- [ ] Waitlist landing page live + functional
- [ ] Post to X and relevant subreddits
- [ ] Set up PostHog + Sentry

### Phase 3 — Polish + Store Listing
- [ ] Google OAuth
- [ ] Settings page fully wired
- [ ] Digest email redesign (branded template)
- [ ] Verified sending domain (SPF/DKIM)
- [ ] Chrome Web Store listing (screenshots, promo tiles, privacy policy)
- [ ] Firefox MV3 variant
- [ ] Mobile-responsive dashboard + PWA

### Phase 4 — Growth (Conditional on Phase 2.5 signals)
- [ ] AI topic tagging (OpenAI / local model)
- [ ] Full-text search (SQLite FTS5 → Postgres full-text)
- [ ] Saved filter views in sidebar
- [ ] One-click deep-link actions in reminder emails
- [ ] Billing layer (Stripe — free tier + Pro at $4/mo)

### Phase 5 — Platform Expansion
- [ ] Reddit saves support
- [ ] Substack saves support
- [ ] Notion integration (export bookmarks as a Notion database)
- [ ] Mobile app (React Native)

---

## Contributing

This is currently a solo project in early development. Contributions are not open yet — watch the repo and check back after Phase 2.

---

## License

MIT — see [LICENSE](./LICENSE).

---

*Built by [Adarsh Bharathwaj](https://github.com/adarshbharathwaj) · April 2026*
