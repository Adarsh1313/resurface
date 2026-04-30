# Resurface — Roadmap & Decision Log

> A living document capturing the back-and-forth on priorities, phases, and the current plan. This is the source of truth for what we're building, in what order, and why.

---

## TL;DR

Build a Chrome extension + web dashboard that rescues X and YouTube bookmarks and emails users a weekly digest so they actually revisit what they saved.

**Current state:** Phase 1 in progress. Backend + frontend + extension code all scaffolded and wired. Database seeded with demo data. Dashboard reads from real API. Extension not yet tested end-to-end in Chrome.

**Next milestone:** Phase 1.5 — owner uses the product personally for 7 days to find real bugs before deploying anything.

---

## The five phases

```
Phase 1     Build it locally
Phase 1.5   Use it yourself for a week
Phase 2     Deploy + build waitlist + post to X/Reddit
Phase 2.5   Wait 2 weeks. Read signals. Decide whether to continue.
Phase 3     Polish + Chrome Web Store + real AI + open waitlist
```

This ordering exists because the riskiest assumption in the PRD is not "can we build it" — it's "will users engage with the digest." We validate demand in Phase 2 **before** spending on API keys, domains, and polish in Phase 3.

---

## Phase 1 — Working locally (you are here)

Goal: the owner can use the full product on their own laptop, end-to-end.

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Backend API with auth, bookmarks, topics, stats | Claude | Done |
| 2 | Chrome extension scaffold (MV3 + MutationObserver) | Claude | Done |
| 3 | Next.js dashboard with sidebar, table, stats | Claude | Done |
| 4 | SQLite database, seeded with demo user | Claude | Done |
| 5 | Dashboard fetches real data via React Query | Claude | Done |
| 6 | Rule-based topic suggester (no AI key required) | Claude | Done |
| 7 | Console email logger + digest endpoints | Claude | Done |
| 8 | Connect sidebar pages (saves/reviewed/snoozed/reminders) to real API | Claude | In progress |
| 9 | Manual "Add bookmark" button — fallback when extension breaks | Claude | Pending |
| 10 | "Send digest now" button in dashboard | Claude | Pending |
| 11 | Header search bar wired to filter bookmarks | Claude | Pending |
| 12 | Minimal settings page (logout, digest frequency, email) | Claude | Pending |
| 13 | Extension auth flow (popup login, JWT stored in chrome.storage) | Claude | Pending |
| 14 | Load extension unpacked in Chrome, test capture on X + YouTube | Owner | Pending |

**Exit criteria:** Owner can register, install extension, bookmark a tweet or YouTube video, see it appear in the dashboard within 2 seconds, mark it reviewed, and manually trigger a digest email that logs to console.

---

## Phase 1.5 — Use it yourself for 7 days

Goal: find real-world bugs and UX gaps before any users see it.

- Owner uses the product daily on their own laptop.
- Log everything that feels wrong, missing, or annoying.
- Decide what's a bug vs. "I actually don't need this."
- Track: how many bookmarks do you actually save per day? Do you revisit them? What would make you skip a digest?

**Why this phase exists:** building for strangers without using your own tool first is how you end up with a feature-complete product nobody wants.

**Exit criteria:** Owner has a prioritized list of fixes and knows whether the core loop feels valuable in practice.

---

## Phase 2 — Deploy + waitlist + distribution

Goal: product is live on the internet, owner collects waitlist signups for 2 weeks.

| # | Task | Notes |
|---|------|-------|
| 1 | Swap SQLite → Postgres (Supabase free tier) | Vercel can't write to SQLite |
| 2 | Deploy backend (Render free tier) + frontend (Vercel free) | Render sleeps after 15m inactivity; fine for trial |
| 3 | Real Resend integration (replace console logger) | Free: 3000 emails/month |
| 4 | Reminder cron (checks `reminder_at` every 5 minutes) | Script, not a separate service |
| 5 | Digest cron (hourly, sends digests on user's schedule) | Script on the backend |
| 6 | Landing page (single page: problem → solution → install CTA) | Lives on marketing domain |
| 7 | Waitlist signup form + `waitlist` table in DB | Email + optional notes |
| 8 | Owner bypass — demo account always gets full access | Check auth_provider or email allowlist |
| 9 | Update extension to point to production API URL | Environment-based config |
| 10 | Submit extension to Chrome Web Store as unlisted | $5 one-time fee |
| 11 | Onboarding flow (post-signup walkthrough) | Moved here from Phase 3 per decision |
| 12 | Post to X/Reddit targeting "intentional consumers" | r/productivity, r/selfimprovement, etc. |

**Deliberate exclusions from Phase 2:**
- Google OAuth (add in Phase 3 based on signup friction data)
- Sentry (add in Phase 3 when real users exist)
- Real AI topic suggestion (rule-based is good enough for validation)
- Bulk actions (nice-to-have)
- Custom domain (vercel.app subdomain works)

**Exit criteria:** Product is live, anyone with the URL can sign up for the waitlist, owner has posted to at least 2 distribution channels.

---

## Phase 2.5 — Wait and read signals

Goal: decide whether to keep investing based on market feedback.

- Wait 2 weeks after Phase 2 launch.
- Count waitlist signups. A rough bar: 50+ signups from genuine posts = enough demand to continue.
- Read comments on X/Reddit posts. Are people saying "I need this" or "meh, I use Notion"?
- Check Phase 2 bookmarking behavior if any early invitees were let in.

**Three possible outcomes:**
1. **Strong signal (50+ quality signups):** proceed to Phase 3, invest in polish and AI.
2. **Weak signal (<20 signups):** pivot or shelve. Don't build more on a product nobody wants.
3. **Mixed (20–50):** narrow the audience. Maybe the product needs to target a sub-segment — e.g., "fitness YouTube hoarders" instead of "all content consumers."

**This is the hardest phase** because it's sitting still. But it's the difference between building for 2 months vs. building for 12 months on a dead idea.

---

## Phase 3 — Polish and public launch

Goal: product is ready for a general audience, not just early believers.

| # | Task | Notes |
|---|------|-------|
| 1 | Google OAuth | Removes friction for signup |
| 2 | Empty states + loading skeletons | No more blank screens |
| 3 | Error handling throughout | Friendly messages when API fails |
| 4 | Sentry integration | Get notified when things break |
| 5 | Real AI topic suggestion (OpenAI GPT-4o-mini or Claude) | ~$0.15 per 1000 suggestions |
| 6 | Bulk actions (multi-select rows) | Users will have 100+ bookmarks |
| 7 | Chrome Web Store public listing | Move from unlisted to listed |
| 8 | Custom domain (if validated) | ~$12/year |
| 9 | GitHub repo published under BSL license | Protects commercial rights |
| 10 | Public launch posts (Product Hunt, HN) | Big distribution push |

**Exit criteria:** Product is stable enough for a non-technical user to use without owner support.

---

## Key decisions

### Tech decisions
- **SQLite for local dev, Postgres for production.** SQLite is a single file on disk — perfect for solo development, impossible to deploy to Vercel. Postgres on Supabase is free at the tier we need.
- **Render free tier over Railway.** Railway's free trial ended for the owner; Render gives 750 hours/month free with cold starts. One always-on worker service ($7/mo) handles cron.
- **Rule-based AI in Phase 1–2.** GPT-4o-mini is cheap, but we don't need it for validation. Rule-based keyword matching is good enough.
- **Ollama is not a viable production choice.** It requires a local model server; won't work on Vercel or Render.

### Product decisions
- **No mobile app, no Firefox, no Reddit/LinkedIn in v1.** PRD anti-goals are honored.
- **Private by default.** This is a personal knowledge tool; no social or sharing features.
- **5 items max per digest.** Scarcity is a feature — prevents digest fatigue.

### Business decisions
- **Waitlist before features.** Validate demand before spending on AI API keys or polish.
- **License: private repo until Phase 3; BSL when published.** MIT would let competitors rebrand and sell our work; AGPL is overkill; BSL lets people read the code but blocks commercial resale for 3–4 years.
- **Monetization is TBD.** Three options per PRD: (A) free up to 30 saves/month + paid unlimited, (B) free digest + paid reminders/AI, (C) free forever + paid AI features. Decision deferred to Phase 2.5.

---

## Open questions

1. **What counts as a "quality" waitlist signup?** Email + where they heard about it? Or a short "what do you currently use?" form?
2. **How do we measure digest engagement in Phase 2.5?** Email opens are unreliable; click-through to the dashboard is better but requires tokenized links.
3. **If the extension breaks on a Twitter DOM update, what's our detection + response SLA?** Manual fallback (paste URL) exists; but users will bounce if capture breaks silently.
4. **What's the fallback if OpenAI rate-limits us at scale?** Rule-based as tier 2? Cached suggestions?

---

## Q&A archive

### Why 5 phases instead of just "build and ship"?

Because the PRD's riskiest assumption is behavioral, not technical. "Users will open and act on the digest" is a bet about psychology. You can build a flawless product that nobody engages with. The phases exist to test that bet as cheaply as possible.

### Why is the extension riskier than the backend or frontend?

X and YouTube change their DOM frequently. Our MutationObserver hooks could break on any frontend deploy from those platforms. This is PRD RAT #2. We mitigate with manual URL paste as a fallback and by monitoring capture-rate metrics in Phase 3.

### Why private repo first, not public?

Public repos are great for indie-hacker marketing — stars, forks, credibility. But they also make it trivial for a competitor to rebrand and sell your work. MIT license is wrong here because it permits that. Until there's a real audience and revenue, keep it private. Switch to BSL when publishing is a strategic move rather than a default.

### Why not monetize immediately?

Because we haven't proven demand. Charging $5/month to 0 users is worse than being free to 0 users — one number is $0 revenue, the other is $0 revenue plus broken trust. Prove the retention first.

### Why the bypass for the owner account?

So the owner can continue to dogfood the product without being stuck behind the waitlist gate. Simple email allowlist or a flag on the user record.

### What's the risk of Ollama for AI?

Ollama runs a model locally. Only works when the backend and Ollama are on the same machine. Vercel and Render don't run GPU-capable instances affordably, and CPU inference is too slow for a capture-time suggestion. Use OpenAI/Claude in production; Ollama is fine for dev experimentation.

---

## Changelog

- 2026-04-15 — Initial scaffold of backend, extension, frontend by 3 parallel agents.
- 2026-04-15 — Wired dashboard to real API with React Query, seeded SQLite, verified all sidebar pages render.
- 2026-04-15 — Added rule-based topic suggester, console email logger, digest endpoints.
- 2026-04-16 — Roadmap locked to 5-phase plan (1, 1.5, 2, 2.5, 3) with waitlist-first strategy in Phase 2.
