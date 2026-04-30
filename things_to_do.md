# Resurface — Things To Do

Living list of outstanding work, ordered by phase. Update as items land.

---

## Outstanding manual checks

| # | Check | How | Status |
|---|-------|-----|--------|
| 1 | Landing page renders | Visit `/` | ✅ Done |
| 2 | Onboarding flow renders | Visit `/onboarding` | ⚠️ Renders, but CTAs are local-only — not wired to "first save → dashboard" redirect |
| 3 | AI topic suggestions | `POST /v1/ai/suggest-topic` | ✅ Returns `["AI"]` etc. |
| 4 | Unlabelled bucket in sidebar | Dashboard sidebar | ✅ Filters via `__unlabelled__` magic query |
| 5 | Snooze → `/dashboard/snoozed` | Snooze a bookmark, open page | ⏳ Spot-check after next save |
| 6 | Reminders fire | Save a bookmark w/ reminder, wait ≤1 min, `curl $BASE/reminders/run` | ✅ Worker built, 60s cron + manual trigger |
| 7 | Dashboard sparkline trend | Dashboard stat cards | ✅ Synthetic week series |
| 8 | Digest email | `POST /v1/digest/send-now` | ✅ HTTP 200, 5 bookmarks, email rendered |
| 9 | Platform pills solid X-black / YT-red | Anywhere bookmarks render | ✅ Done |
| 10 | Per-topic consistent colors | Dashboard + chips | ✅ 12-color deterministic hash palette |
| 11 | Snoozed pill beige/brown | `/dashboard/snoozed` | ✅ Done |
| 12 | Full user flow install → digest click-through | Manual end-to-end | ⏳ Pending |
| 13 | Extension datetime picker usable | Save a bookmark, set a custom reminder | ✅ Bubble-propagation bug fixed |

---

## Phase roadmap (what's yet to be built)

| Phase | Scope | Key tasks | Priority |
|-------|-------|-----------|----------|
| **1. Polish core flows** | Ship a v1 that feels complete end-to-end | Wire onboarding CTAs → real actions (`Install ext` → store link, `Bookmark` → wait-for-event, `Set digest` → `PATCH /digest/settings`), persist onboarding-complete flag, redirect to `/dashboard` after first save | 🔴 High |
| **2. Settings wiring** | Currently the Settings page is a visual shell | Hook up: Profile name edit, Digest toggle/days/time save, Topic rename/delete/merge, Extension token regeneration, Notifications toggles (store in `User.preferences`), Export (zip JSON), Delete account (cascade) | 🔴 High |
| **3. Auth upgrade** | Token-paste bridge is fine for dev, not for real users | Add Google OAuth via `passport-google` or direct OAuth; remove bridge-page flow for non-dev; add "Log out everywhere" | 🟠 Medium |
| **4. Email deliverability** | Currently uses Resend's shared sandbox domain | Buy domain, verify in Resend, add SPF/DKIM/return-path DNS, set `EMAIL_FROM` to branded address, enable Resend webhooks for bounces/complaints | 🟠 Medium |
| **5. Digest email redesign** | Digest uses plain `<h2><ol>` HTML | Refactor `buildDigestHtml` to share the branded template shell from `workers/reminders.ts` (dark bg, teal CTAs, per-bookmark cards with platform pill + author + topic chips) | 🟠 Medium |
| **6. Reminder variants** | Reminder email is title+author only | Add: thumbnail (from `b.thumbnail_url`), "Snooze 1 day / Mark reviewed" one-click deep-links (signed URL → `/api/bookmark/:id/action?token=...`) | 🟡 Low |
| **7. Topic taxonomy** | AI suggests 1–3 topics; no merge/split UI | Settings → Topics: drag-to-merge, rename propagates, bulk reassign, colour override | 🟡 Low |
| **8. Search & filter** | Dashboard has `query` state but only filters title/author | Add: full-text (SQLite FTS5), topic+platform+status filter combinators, saved views in sidebar | 🟠 Medium |
| **9. Mobile + PWA** | Dashboard is desktop-only right now | Responsive sidebar (drawer on <768px), make tables card-list on mobile, add `manifest.json` + service worker for installable PWA | 🟡 Low |
| **10. Analytics + error tracking** | No observability | Add PostHog (product analytics: `save_created`, `digest_opened`, `reminder_clicked`), Sentry for backend+web error tracking | 🟠 Medium |
| **11. Tests** | Zero test coverage | Unit: `sendEmail`, `processDueReminders`, `getDigestBookmarks`, normalizers. Integration: supertest on routes. E2E: Playwright flow install → save → digest | 🟠 Medium |
| **12. Deployment** | Everything is `localhost` | Frontend → Vercel, Backend → Railway/Fly/Render, DB → managed SQLite (Turso) or migrate to Postgres, env-var matrix, CORS for prod origin, ext pointing at `api.resurface.app` | 🔴 High |
| **13. Extension store listing** | Loads unpacked only | Screenshots (1280×800), promo tiles, privacy-policy page, Chrome Web Store listing, Firefox MV3 build variant | 🟠 Medium |
| **14. Accessibility pass** | Keyboard nav + a11y not audited | Focus rings, `aria-*` on menus (SnoozeMenu, ReminderMenu, datetime picker), escape-to-close, skip links, colour contrast for teal-on-dark-teal | 🟡 Low |
| **15. Billing (if monetising)** | No payment layer | Stripe: free tier (e.g. 100 saves/mo, 1× weekly digest), Pro ($4/mo unlimited + AI topics + reminders), portal page | 🟡 Low / TBD |

---

## Deployment runbook (first launch)

Follow in order. Each step takes ~5–10 min.

### 0. Before you push — sanity check

```bash
cd C:\Claude Code\resurface
git status                       # nothing committed yet
cat .gitignore                   # confirm .env is listed
grep -r "JWT_SECRET\|RESEND_API_KEY" . --include="*.ts" --include="*.tsx"  # confirm no leaked secrets in code
```

### 1. Push to GitHub

```bash
cd C:\Claude Code\resurface
git init
git add .
git commit -m "Initial commit: Resurface v0"
# Create an empty repo on https://github.com/new (private recommended)
git remote add origin git@github.com:YOUR_USERNAME/resurface.git
git branch -M main
git push -u origin main
```

### 2. Create Postgres database — Neon (free tier)

1. Sign up at [neon.tech](https://neon.tech) → create a project called `resurface`
2. Copy the **pooled** connection string (starts `postgresql://…?sslmode=require&pgbouncer=true`)
3. Also copy the **direct** connection string (for migrations)

### 3. Point Prisma at Postgres

```bash
# In backend/prisma/schema.prisma, change:
provider = "sqlite"    →    provider = "postgresql"

# In backend/.env (NOT committed):
DATABASE_URL="postgresql://…?sslmode=require"

# Run migrations fresh against Neon:
cd backend
npx prisma migrate deploy    # or `db push` if you want to skip migration files
npx prisma generate
```

### 4. Deploy backend — Railway (easiest for Express + long-running cron)

1. Sign up at [railway.app](https://railway.app), connect GitHub
2. New Project → Deploy from GitHub → pick your `resurface` repo → set root dir to `backend/`
3. Add env vars in Railway dashboard: `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS` (= your Vercel URL), `RESEND_API_KEY`, `EMAIL_FROM`, `OPENAI_API_KEY`
4. Railway auto-detects `npm run build` and `npm start`. Add to `backend/package.json`:
   ```json
   "start": "node dist/index.js"
   ```
   (Railway will run `npm run build` then `npm start`.)
5. Generate a public URL (Settings → Networking → Generate Domain). Copy it — e.g. `resurface-api.up.railway.app`.

### 5. Deploy frontend — Vercel

1. Sign up at [vercel.com](https://vercel.com), connect GitHub
2. Import Project → pick `resurface` → set root dir to `web/`
3. Framework preset: Next.js (auto-detected)
4. Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://resurface-api.up.railway.app/v1`
5. Deploy. You'll get a URL like `resurface.vercel.app`.

### 6. Wire CORS both ways

- In Railway, update `ALLOWED_ORIGINS` to include your Vercel URL (and the custom domain once set)
- Redeploy backend so the new env var takes effect

### 7. Custom domain (optional)

- Buy on Namecheap/Cloudflare. In Vercel → Domains → add `resurface.app`. Follow DNS instructions.
- For the API subdomain `api.resurface.app`, point a CNAME to your Railway domain and add it in Railway's Custom Domains.
- Update `NEXT_PUBLIC_API_BASE_URL` + `ALLOWED_ORIGINS` accordingly and redeploy both.

### 8. Confirm end-to-end

```bash
# Waitlist endpoint public-accessible?
curl -X POST https://api.resurface.app/v1/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"curl-smoketest"}'
# → {"success":true,"id":"..."}

# Landing page renders and form submits?
# Open https://resurface.app, submit email, check Neon dashboard → waitlist_entries table.
```

### 9. Post-launch housekeeping

- Set up Vercel analytics (Settings → Analytics) — free tier
- Enable Railway's auto-deploy on push-to-main
- Add Sentry DSN for both projects (free hobby tier)
- Set up a weekly cron job on Railway to run `POST /v1/reminders/run` in case the process restarts at an awkward time

---

## Bugs / nits (triaged)

| Bug | Where | Severity |
|-----|-------|----------|
| Onboarding CTAs don't actually verify install / first save | `web/src/app/onboarding/page.tsx` | Medium |
| Digest "Send now" doesn't include bookmarks with only `reminder_sent=false` — sort still works, but reminder-week logic could be clearer | `backend/src/routes/digest.ts` | Low |
| Topic count mismatch (backend 9 vs sidebar 5) — root cause was Unlabelled bucket. Verify after user creates a few more untagged saves | Sidebar | Resolved ✅ |
| Reminder emails use `onboarding@resend.dev` sender — flagged as "via resend.dev" in Gmail until a verified domain is set up | `lib/email.ts` `EMAIL_FROM` env | Medium (prod blocker) |
| No "resend" for unsent reminders if worker was down during due-time — will send on next tick (worker only filters `reminder_sent=false`) — correct behaviour, document it | N/A | N/A (feature) |
