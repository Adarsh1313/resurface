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
| Phase 1 — Working locally | ✅ Done |
| Phase 1.5 — Personal dogfooding (7 days) | ⏳ Next — see [docs/go-live.md](./docs/go-live.md) |
| Phase 2 — Deploy (owner-only, $0) | ✅ Deployed; scheduler + email need the go-live steps |
| Phase 2.5 — Demand validation | 🔜 |
| Phase 3 — Chrome Web Store + AI + polish | 🔜 |

---

## Features (v1)

- [x] Chrome MV3 extension — detects X + YouTube saves, offline retry queue, capture-health status
- [x] Capture prompt — 320px, bottom-right, auto-dismiss 8s, topic + reminder UI
- [x] Insights dashboard — rescue rate, rhythm, backlog debt, save clock, topic drift, graveyard, author loyalty
- [x] AI topic suggestion — rule-based tagger (no API key required)
- [x] Reminders — pick date + time, email fires at due time
- [x] Snooze — defer a bookmark; it comes back automatically when the snooze ends
- [x] Scheduled digest — daily or weekly, your days, time and timezone; 5 saves per email
- [x] One-click email actions — Open, Mark reviewed, Snooze 1 day
- [x] Notification preferences, data export, account deletion
- [x] Auth — email/password + JWT; long-lived (180-day) extension token
- [x] Onboarding flow, privacy policy page
- [ ] Google OAuth
- [ ] Chrome Web Store listing — checklist in [docs/chrome-web-store.md](./docs/chrome-web-store.md)

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

No Postgres install or Docker needed — `npm run db:local` runs a real Postgres from the `embedded-postgres` npm package.

### 1. Clone the repo

```bash
git clone https://github.com/Adarsh1313/resurface.git
cd resurface
```

### 2. Start the database (terminal 1)

```bash
cd backend
npm install
cp .env.example .env       # defaults point at the local DB; set JWT_SECRET
npm run db:local           # Postgres on localhost:5433, data in backend/.pgdata — leave running
```

### 3. Migrate, seed, and start the backend (terminal 2)

```bash
cd backend
npx prisma migrate deploy  # applies migrations (first run only, or after pulling new ones)
npx prisma db seed         # seeds demo user + 13 bookmarks
npm run dev                # API on http://localhost:4000 (health: /ready)
npm test                   # backend unit tests (vitest)
```

With no `RESEND_API_KEY` or `SMTP_*` set, emails (digest, reminders, waitlist) are logged to this terminal.

### 4. Start the frontend (terminal 3)

```bash
cd web
npm install
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1 > .env.local
npm run dev                # http://localhost:3000
```

### 5. Build and load the extension

```bash
cd extension
npm install
npm run build:local        # dist/ pointed at localhost:4000 / localhost:3000
```

Then in Chrome: `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `extension/` folder. Pair it by opening the popup → it links to `http://localhost:3000/extension`, where you copy your token and paste it back into the popup.

`npm run build` (no `:local`) builds against the production API and web app.

### Demo credentials

After seeding, log in at `http://localhost:3000/login` with:
- Email: `demo@resurface.app`
- Password: `password123`

The seed includes ~10 weeks of history so the insights dashboard has something to show.

The demo account is in `ADMIN_EMAILS` in `.env.example`, so `/dashboard/admin` works too.

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
