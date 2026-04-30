# Resurface -- Paid / External Services Specification

> **Version:** 1.0
> **Last Updated:** April 2026

---

## Table of Contents

1. [Resend (Email)](#1-resend-email)
2. [OpenAI GPT-4o-mini (AI)](#2-openai-gpt-4o-mini-ai)
3. [Google OAuth 2.0 (Authentication)](#3-google-oauth-20-authentication)
4. [Sentry (Error Monitoring)](#4-sentry-error-monitoring)
5. [Chrome Web Store (Extension Distribution)](#5-chrome-web-store-extension-distribution)
6. [Cost Summary](#6-cost-summary)
7. [Required vs Optional Services](#7-required-vs-optional-services)
8. [Recommended Integration Order](#8-recommended-integration-order)

---

## 1. Resend (Email)

**Website:** https://resend.com

### What It's Used For

- **Weekly digest emails** -- the core action layer. A cron job selects each user's top 5 unreviewed bookmarks, generates AI summaries, renders a React Email template, and dispatches via Resend.
- **Reminder emails** -- transactional emails sent when a bookmark's `reminder_at` time is reached and the user's browser is not open.
- **Email verification** -- account verification emails for email+password signups.

### API Endpoints / Code Paths

| Code Path | Description |
|-----------|-------------|
| `POST /digest/send-now` | Manually triggers a digest; calls Resend send API |
| Digest cron job (node-cron / BullMQ) | Iterates users with active digest settings, renders React Email template, calls `resend.emails.send()` |
| Reminder cron job | Checks `bookmarks.reminder_at` where `reminder_sent = FALSE`, sends reminder email via Resend |
| `POST /auth/register` | Sends email verification link via Resend |

### Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=digest@resurface.app
RESEND_REPLY_TO=support@resurface.app
```

**Note:** Requires a verified domain in Resend (add DNS records for `resurface.app`).

### Pricing & Cost Estimates

| Tier | Price | Emails/month |
|------|-------|-------------|
| Free | $0 | 100 emails/day (3,000/month) |
| Pro | $20/month | 50,000 emails/month |
| Business | $90/month | 100,000 emails/month |

**Per-user email volume estimate:** ~5 emails/month (4 digests + 1 reminder on average).

| Scale | Emails/month | Tier Needed | Monthly Cost |
|-------|-------------|-------------|-------------|
| 100 users | ~500 | Free | $0 |
| 1,000 users | ~5,000 | Pro | $20 |
| 10,000 users | ~50,000 | Pro (at limit) | $20 |

**Free tier limit:** 100 emails/day = ~3,000/month. You hit this around **600 active users**.

### Setup Instructions

1. Sign up at https://resend.com
2. Add and verify your domain (`resurface.app`) -- Resend provides DNS records (SPF, DKIM, DMARC) to add in your DNS provider
3. Create an API key at https://resend.com/api-keys (use a "sending" scoped key)
4. Set `RESEND_API_KEY` in your environment
5. Install the SDK: `npm install resend`
6. For React Email templates: `npm install @react-email/components`

### Fallback Behavior

- If Resend is unavailable, digest and reminder emails silently fail
- Log the failure and set a `retry_at` timestamp on the digest_log / bookmark
- Retry failed emails on the next cron cycle (up to 3 attempts)
- The dashboard remains fully functional without email delivery
- Users can always use `GET /digest/preview` to see what would have been in the digest

### Rate Limits

- Free tier: 100 emails/day, 1 email/second
- Pro tier: 50,000 emails/month, 10 emails/second burst
- If batch-sending digests, stagger sends to stay under burst limits

---

## 2. OpenAI GPT-4o-mini (AI)

**Website:** https://platform.openai.com

### What It's Used For

- **Topic suggestions at capture time** -- when the extension detects a save, it calls `POST /ai/suggest-topic` with the title, platform, and author. The backend calls GPT-4o-mini to suggest 3 relevant topic labels.
- **Digest email summaries** -- for each of the 5 bookmarks in a digest, the backend generates a 1-2 sentence summary using the bookmark's title, author, and URL as context.

### API Endpoints / Code Paths

| Code Path | Description |
|-----------|-------------|
| `POST /ai/suggest-topic` | Receives `{title, platform, author}`, calls OpenAI chat completions API, returns `{suggestions: string[]}` |
| Digest generation (cron job) | For each of 5 selected bookmarks, calls OpenAI to generate a short summary |

### Environment Variables

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS_TOPIC=100
OPENAI_MAX_TOKENS_SUMMARY=150
```

**Alternative (Claude):**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
```

### Pricing & Cost Estimates

**GPT-4o-mini pricing (as of early 2026):**

| | Price |
|---|---|
| Input tokens | $0.15 / 1M tokens |
| Output tokens | $0.60 / 1M tokens |

**Per-call token estimates:**

| Operation | Input tokens | Output tokens | Cost per call |
|-----------|-------------|--------------|---------------|
| Topic suggestion | ~150 | ~30 | ~$0.00004 |
| Digest summary (per item) | ~200 | ~60 | ~$0.00007 |

**Per-user monthly usage:** ~40 topic suggestions + ~20 digest summaries = ~60 API calls.

| Scale | API calls/month | Monthly Cost |
|-------|----------------|-------------|
| 100 users | ~6,000 | ~$0.30 |
| 1,000 users | ~60,000 | ~$3 |
| 10,000 users | ~600,000 | ~$30 |

**Free tier:** OpenAI does not offer a free tier. New accounts get a small initial credit (typically $5-$18 depending on promotions). After that, it is pay-as-you-go from day one.

### Setup Instructions

1. Sign up at https://platform.openai.com
2. Add a payment method under Billing
3. Create an API key at https://platform.openai.com/api-keys (use a project-scoped key)
4. Set usage limits to prevent runaway costs (Settings > Limits > set monthly budget)
5. Install the SDK: `npm install openai`
6. Configure in backend:
   ```typescript
   import OpenAI from 'openai';
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   ```

### Fallback Behavior

- If OpenAI is unavailable or returns an error:
  - **Topic suggestions:** Return an empty `suggestions` array. The extension prompt shows the topic dropdown with only the user's existing topics (no AI suggestions). The user can still type a custom topic.
  - **Digest summaries:** Omit the summary paragraph from the digest email. Show only the bookmark title, author, and platform. The digest is still useful without summaries.
- Set a circuit breaker: if 5 consecutive calls fail, stop calling OpenAI for 5 minutes before retrying.

### Rate Limits

- GPT-4o-mini: 500 RPM (requests per minute), 200,000 TPM (tokens per minute) on Tier 1
- At 10K users sending topic suggestions simultaneously, you could hit RPM limits during peak hours
- Mitigation: queue AI requests via BullMQ rather than calling inline; cache topic suggestions for identical titles

---

## 3. Google OAuth 2.0 (Authentication)

**Website:** https://console.cloud.google.com

### What It's Used For

- **User authentication** -- "Sign in with Google" on the web dashboard and in the extension auth flow
- Provides user profile info (name, email, avatar URL) to populate the `users` table
- Referenced in routes: `GET /auth/google` (redirect) and `GET /auth/google/callback` (token exchange)

### API Endpoints / Code Paths

| Code Path | Description |
|-----------|-------------|
| `GET /auth/google` | Redirects user to Google's OAuth consent screen |
| `GET /auth/google/callback` | Receives auth code, exchanges for tokens, creates/finds user, returns JWT |
| Extension auth flow | Opens `resurface.app/auth/extension` which uses the same Google OAuth flow |

### Environment Variables

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://api.resurface.app/v1/auth/google/callback
```

### Pricing & Cost Estimates

**Google OAuth is free at all scales.** There is no per-request charge.

| Scale | Monthly Cost |
|-------|-------------|
| 100 users | $0 |
| 1,000 users | $0 |
| 10,000 users | $0 |

### Setup Instructions

1. Go to https://console.cloud.google.com and create a new project (e.g., "Resurface")
2. Navigate to APIs & Services > OAuth consent screen
   - Choose "External" user type
   - Fill in app name ("Resurface"), support email, and authorized domains (`resurface.app`)
   - Add scopes: `openid`, `email`, `profile`
3. Navigate to APIs & Services > Credentials > Create Credentials > OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://api.resurface.app/v1/auth/google/callback`
4. Copy the Client ID and Client Secret into your environment variables
5. While in development/testing, add test users under the OAuth consent screen (app starts in "Testing" mode with a 100-user cap)
6. Submit for Google verification before public launch to remove the "unverified app" warning

**Important:** Google verification can take 1-4 weeks. Submit early.

### Fallback Behavior

- If Google OAuth is unavailable, the "Sign in with Google" button should show a toast/banner: "Google sign-in is temporarily unavailable. Please use email and password."
- Email + password auth (`POST /auth/register`, `POST /auth/login`) is the primary fallback and must always work independently
- Existing users who signed up via Google can still access their account if you implement a "set password" flow

### Rate Limits

- OAuth token endpoint: 10,000 requests per 100 seconds per project
- This is effectively unlimited for authentication use cases

---

## 4. Sentry (Error Monitoring)

**Website:** https://sentry.io

### What It's Used For

- **Backend error tracking** -- uncaught exceptions, failed API calls, Prisma errors
- **Frontend error tracking** -- React rendering errors, failed API requests in the dashboard
- **Extension error tracking** -- content script failures (especially DOM detection breakage on X/YouTube), failed bookmark captures
- **Performance monitoring** -- API endpoint latency, dashboard load times
- **Alerting** -- if `bookmark_created_via_extension` events drop > 30%, alert the team (as specified in the PRD's risk mitigations)

### API Endpoints / Code Paths

Sentry does not have app-facing API endpoints. It is integrated as middleware/SDK initialization:

| Code Path | Description |
|-----------|-------------|
| Backend `app.ts` / `index.ts` | `Sentry.init()` with Express integration; error handler middleware |
| Frontend `next.config.js` + `sentry.client.config.ts` | Next.js Sentry plugin for automatic error capture |
| Extension `background.ts` | `Sentry.init()` in the service worker for extension errors |
| Extension content scripts | `try/catch` blocks with `Sentry.captureException()` around DOM observers |

### Environment Variables

```env
# Backend
SENTRY_DSN_BACKEND=https://xxxxxxxxxxxx@o123456.ingest.sentry.io/1234567
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.2

# Frontend (public, safe to expose)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxx@o123456.ingest.sentry.io/2345678

# Extension (embedded in extension build)
SENTRY_DSN_EXTENSION=https://xxxxxxxxxxxx@o123456.ingest.sentry.io/3456789
```

### Pricing & Cost Estimates

| Tier | Price | Errors/month | Performance events |
|------|-------|-------------|-------------------|
| Developer (free) | $0 | 5,000 | 10,000 |
| Team | $26/month | 50,000 | 100,000 |
| Business | $80/month | 100,000 | 250,000 |

**Per-user error volume estimate:** ~2-5 errors/month (higher during platform DOM changes).

| Scale | Errors/month (est.) | Tier Needed | Monthly Cost |
|-------|-------------------|-------------|-------------|
| 100 users | ~300 | Developer (free) | $0 |
| 1,000 users | ~3,000 | Developer (free) | $0 |
| 10,000 users | ~30,000 | Team | $26 |

**Free tier limit:** 5,000 errors/month + 10,000 performance events. Sufficient until roughly **2,000-3,000 users**.

### Setup Instructions

1. Sign up at https://sentry.io
2. Create a Sentry organization and three projects:
   - `resurface-backend` (Node.js)
   - `resurface-web` (Next.js)
   - `resurface-extension` (Browser JavaScript)
3. Copy the DSN from each project's settings
4. Backend setup:
   ```bash
   npm install @sentry/node
   ```
5. Frontend setup:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
6. Extension setup:
   ```bash
   npm install @sentry/browser
   ```
7. Configure alert rules: create an alert for error spike detection and for custom metrics (e.g., bookmark creation rate drop)

### Fallback Behavior

- If Sentry is unavailable, errors are simply not reported externally
- All errors should also be logged locally (`console.error` or a file logger like Winston/Pino) as a baseline
- The application functions identically with or without Sentry -- it is purely observational

### Rate Limits

- Free tier: 5,000 errors/month hard cap; events are dropped after
- Use `beforeSend` callbacks to filter noisy/duplicate errors
- Set `tracesSampleRate` to 0.1-0.2 to stay within performance event quotas

---

## 5. Chrome Web Store (Extension Distribution)

**Website:** https://chrome.google.com/webstore/devconsole

### What It's Used For

- **Distribution** of the Resurface browser extension to end users
- Provides auto-updates, user reviews, install metrics, and a trusted installation path

### API Endpoints / Code Paths

No runtime API calls. This is a publishing/distribution platform only.

| Code Path | Description |
|-----------|-------------|
| Extension `manifest.json` | Defines permissions, version, and Chrome Web Store metadata |
| CI/CD pipeline (optional) | Can use the Chrome Web Store API to automate publishing new versions |

### Environment Variables

```env
# Only needed if automating publishing via CI/CD
CHROME_WEB_STORE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
CHROME_WEB_STORE_CLIENT_SECRET=xxxxxxxxxxxxxxxx
CHROME_WEB_STORE_REFRESH_TOKEN=xxxxxxxxxxxxxxxx
CHROME_WEB_STORE_EXTENSION_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Pricing & Cost Estimates

| Item | Cost |
|------|------|
| Developer registration fee | $5 (one-time) |
| Hosting/distribution | Free |
| Updates | Free |

| Scale | Monthly Cost |
|-------|-------------|
| Any scale | $0 (after initial $5) |

### Setup Instructions

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay the one-time $5 developer registration fee
3. Prepare store listing assets:
   - Extension icon: 128x128 PNG
   - Screenshots: 1280x800 or 640x400 (at least 1, up to 5)
   - Promotional tile: 440x280 (small), 920x680 (large, optional)
   - Description (up to 16,000 chars)
   - Privacy policy URL (required)
4. Zip the extension build output (must include `manifest.json` at root)
5. Upload via the Developer Dashboard
6. Fill in the "Privacy practices" tab:
   - Declare all permissions and justify each one (see PRD Appendix B)
   - Declare data usage (Resurface collects: URLs from twitter.com, x.com, youtube.com only)
7. Submit for review (typically 1-3 business days; can take longer for first submission)
8. After approval, the extension is live and publicly installable

### Fallback Behavior

- If the Chrome Web Store is down, existing users are unaffected (extension is already installed locally)
- New users cannot install the extension during an outage
- Provide a manual installation guide (developer mode + load unpacked) as a backup for beta testers
- The web dashboard remains fully functional without the extension (users can manually add bookmarks in v2)

### Rate Limits

- Publishing: maximum of 20 extension updates per day
- Chrome Web Store API (for automated publishing): standard Google API quotas

---

## 6. Cost Summary

### Total Estimated Monthly Cost

| Service | 100 users | 1,000 users | 10,000 users |
|---------|-----------|-------------|-------------|
| Resend | $0 | $20 | $20 |
| OpenAI GPT-4o-mini | $0.30 | $3 | $30 |
| Google OAuth 2.0 | $0 | $0 | $0 |
| Sentry | $0 | $0 | $26 |
| Chrome Web Store | $0 | $0 | $0 |
| **Total** | **~$0.30** | **~$23** | **~$76** |

**Notes:**
- Chrome Web Store has a one-time $5 fee not included in monthly costs.
- OpenAI cost assumes ~60 API calls per user per month. Actual usage depends on how frequently users save bookmarks and how many digests are configured.
- These costs do not include hosting (Vercel, Railway/Render, Supabase) which are separate infrastructure costs.

---

## 7. Required vs Optional Services for v1

### Required (P0)

| Service | Why Required |
|---------|-------------|
| **Resend** | Weekly digest email is the core action layer -- without it, there is no "resurface" loop. This is the product's primary engagement mechanism. |
| **Google OAuth 2.0** | Listed as P0 auth method in PRD. While email+password exists as alternative, Google OAuth is expected by the target user demographic. |
| **Chrome Web Store** | The only distribution channel for the Chrome extension, which is the primary capture mechanism. |

### Optional (P1 / can launch without)

| Service | Why Optional | Impact of Skipping |
|---------|-------------|-------------------|
| **OpenAI GPT-4o-mini** | AI topic suggestions are P1 in the PRD. Digest summaries are nice-to-have. | Extension prompt shows only user's existing topics (no AI suggestions). Digest emails omit summary paragraphs -- still functional. |
| **Sentry** | Error monitoring is important but not user-facing. | Rely on server logs and manual testing. Add Sentry in Week 6 polish phase as planned. |

---

## 8. Recommended Integration Order

The order below follows the PRD's milestone plan and prioritizes services that unblock other features.

| Order | Service | When (PRD Week) | Rationale |
|-------|---------|-----------------|-----------|
| 1 | **Google OAuth 2.0** | Week 1 | Unblocks all authenticated flows. Backend auth endpoints and extension auth flow depend on this. |
| 2 | **Chrome Web Store** | Week 1 (register) / Week 6 (publish) | Register the developer account immediately. Prepare listing assets during Week 6 polish. First submission review takes days. |
| 3 | **OpenAI GPT-4o-mini** | Week 3 | Needed for `POST /ai/suggest-topic` integration. Build with a clean abstraction layer so the AI provider can be swapped (OpenAI vs Claude). |
| 4 | **Resend** | Week 5 | Digest and reminder email functionality. Requires verified domain -- start DNS verification in Week 4 so it is ready. |
| 5 | **Sentry** | Week 6 | Final polish. Non-blocking for any feature development. Set up all three projects (backend, frontend, extension) in one session. |

### Integration Tips

- **Start domain verification early:** Both Resend (domain verification) and Google OAuth (app verification) involve DNS changes and review periods. Initiate these in Week 1 even if the code integration comes later.
- **Abstract the AI provider:** Wrap OpenAI calls behind a service interface (e.g., `AISuggestionService`) so you can swap to Claude or another provider without changing calling code.
- **Use environment-based feature flags:** Each service should degrade gracefully when its API key is missing. Check for the presence of `RESEND_API_KEY`, `OPENAI_API_KEY`, etc. at startup and disable related features rather than crashing.

---

*End of Document -- Resurface Paid Services Spec v1.0*
