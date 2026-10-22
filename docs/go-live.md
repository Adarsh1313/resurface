# Go live for personal use ($0)

The order to take Resurface from this branch to a production setup you use every day. Every service here stays on a free tier for a single user.

| Service | Role | Free-tier limit that matters |
|---|---|---|
| Render (web service `resurface`) | API + scheduler | Sleeps after 15 min idle — cron-job.org wakes it |
| Supabase | Postgres | Pauses after 7 days idle — the 10-min tick keeps it active |
| Vercel | Web app | Hobby plan, personal use |
| Resend | Email | 100/day; without a domain, only delivers to your Resend account's email |
| cron-job.org | Calls `/v1/cron/tick` every 10 min | Free |
| Chrome | Extension, loaded unpacked | Web Store listing ($5) only when going public |

## 1. Ship the code

1. Open a PR from `chore/local-dev-setup` to `main` and merge it.
2. Render auto-deploys the backend from `main`. Its build runs `prisma migrate deploy`, which adds the `users.preferences` and `digest_logs.clicks` columns.
3. The web CI workflow deploys the app to Vercel on push to `main`.

## 2. Resend (email)

1. Sign up at <https://resend.com> **with the same email you'll use for your Resurface account**. Without a verified domain, Resend only delivers to that address.
2. Create an API key (sending access).

## 3. Render environment (dashboard → `resurface` → Environment)

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | the key from step 2 |
| `EMAIL_FROM` | `Resurface <onboarding@resend.dev>` |
| `ADMIN_EMAILS` | your email (lets you sign up past the invite gate and opens `/dashboard/admin`) |
| `PUBLIC_APP_URL` | `https://resurface-web-eight.vercel.app` |
| `CRON_SECRET` | a long random string (`openssl rand -hex 32`) |
| `REQUIRE_INVITE` | `true` (keeps strangers out; admins bypass it) |

`DATABASE_URL`, `JWT_SECRET` and `ALLOWED_ORIGINS` should already be set. `PUBLIC_API_URL` is optional (Render's `RENDER_EXTERNAL_URL` is used for email links). Saving triggers a redeploy.

## 4. cron-job.org

Follow [cron-setup.md](cron-setup.md): URL `https://resurface-nclr.onrender.com/v1/cron/tick`, every 10 minutes, header `Authorization: Bearer <CRON_SECRET>`. Check that the first run returns 200.

## 5. Your account

1. Register at `https://resurface-web-eight.vercel.app/register` with the email from step 2.
2. Onboarding: pick **Daily** or **Weekly**, a send time and your timezone.
3. Settings → Extension → **Generate extension token**.

## 6. Extension

```bash
cd extension
npm install
npm run build
```

`npm run build` targets production; `build:local` targets localhost. In `chrome://extensions`, reload the unpacked extension (or **Load unpacked** → the `extension/` folder), open the popup and paste the token. It shows "Connected until …" (about 6 months).

## 7. Check it end to end

1. Bookmark a post on X → it appears on the dashboard within seconds.
2. Settings → Digest → **Send digest now** → the email arrives in your inbox and its buttons open `/action-done`.
3. The next morning, the scheduled digest arrives on its own (cron-job.org history shows `digests.sent: 1`).

## Optional

- Delete or disable the demo account in production if it exists.
- License: the repo is public under MIT; the roadmap planned BSL. Change `LICENSE` before announcing it if that matters.
- Opening it to others later: verify a domain in Resend, publish the extension ([chrome-web-store.md](chrome-web-store.md)) and send invites from `/dashboard/admin`.
