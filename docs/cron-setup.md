# Scheduled jobs: cron-job.org setup ($0)

Render's free web service sleeps after about 15 minutes without traffic, so timers inside the
Node process can't be trusted to fire. Production scheduling is driven from outside instead:
a free [cron-job.org](https://cron-job.org) job calls the API every 10 minutes. Each call:

1. wakes the Render instance if it's asleep,
2. moves bookmarks whose snooze has ended back to `pending`,
3. sends due **reminders** (skipped if the user turned off `reminder_email`),
4. sends due **digests**, using each user's timezone, days and send time (skipped if
   `digest_email` is off or nothing is pending),
5. purges bookmarks that have been in the trash for more than 15 days.

The endpoint is idempotent. Calling it twice in the same minute, or while the in-process timer is
also running, won't send anything twice: every reminder and digest slot is claimed in the
database before the email goes out.

GitHub Actions `keep-alive.yml` stays in place as a **backup only**. It pings `/ready` every
30 minutes, but GitHub cron is best-effort and often runs late. **cron-job.org is the
primary scheduler.**

## 1. Get the secret from Render

`render.yaml` declares `CRON_SECRET` with `generateValue: true`, so Render creates a random value
when the blueprint is applied.

1. Open the Render dashboard, then **resurface-api**, then **Environment**.
2. Copy the value of `CRON_SECRET`. If it's missing (for example, the service wasn't created from
   the blueprint), add it yourself with a long random string (`openssl rand -hex 32`) and save. Render
   redeploys automatically.

In production, `/v1/cron/tick` rejects every request with `401` until `CRON_SECRET` is set.

## 2. Create the cron-job.org job

1. Sign up for a free account at <https://cron-job.org> and verify your email.
2. Open **Dashboard** and click **Create cronjob**.
3. **Title:** `Resurface tick`
4. **URL:** `https://resurface-nclr.onrender.com/v1/cron/tick`
5. **Execution schedule:** *Every 10 minutes*.
6. Open the **Advanced** tab:
   - **Request method:** `POST`. `GET` works too if you prefer it.
   - **Headers:** add one header:
     - Key: `Authorization`
     - Value: `Bearer <paste CRON_SECRET here>`
   - **Timeout:** the maximum the free plan allows (30 s). A cold start on Render can take longer
     than that. If the first call times out, the instance still wakes, the work still runs, and
     the next call (10 minutes later) gets a fast `200`.
   - Optional: under notifications, turn on **failure alerts** so you get an email if the job
     keeps failing.
7. Save, then click **Test run**. You should get HTTP `200` with a body like:

```json
{
  "reminders": { "sent": 0, "skipped": 0, "errors": 0 },
  "digests": { "sent": 0, "skipped": 0, "failed": 0 },
  "purged": 0,
  "unsnoozed": 0,
  "ran_at": "2026-10-21T10:00:00.000Z",
  "duration_ms": 42
}
```

A `401` means the header is missing or the secret doesn't match.

## 3. How digest timing works

- Settings are stored per user: `frequency` (`daily` or `weekly`), `days_of_week`
  (0 = Sunday … 6 = Saturday), `send_time` (`HH:MM`, 24 h) and `timezone` (IANA, stored on the user).
- A digest is **due** when, in the user's local time, today is one of the selected days, the
  local time is at or after `send_time`, and no digest has been sent yet on that local date.
- With a 10-minute tick, a digest goes out within about 10 minutes of `send_time`. If the server
  missed the slot, the digest still goes out later that same local day. A day that has fully
  passed is not sent retroactively.
- If there are no pending bookmarks, nothing is sent and the day isn't marked as sent, so the
  next tick that day checks again.
- `POST /v1/digest/send-now` (the dashboard button) sends right away and does not affect the schedule.

## 4. Manual testing

```bash
# local (CRON_SECRET=dev-cron-secret in backend/.env, server on PORT=4100)
curl -X POST http://localhost:4100/v1/cron/tick -H "Authorization: Bearer dev-cron-secret"

# production
curl -X POST https://resurface-nclr.onrender.com/v1/cron/tick -H "Authorization: Bearer $CRON_SECRET"
```

In local dev, an in-process timer also runs the same tick every 60 s. Set
`DISABLE_INTERNAL_SCHEDULER=true` to turn it off.

## Email action links

Digest and reminder emails include **Open**, **Mark reviewed** and **Snooze 1 day** buttons. They point
at `GET /v1/actions/:token`, a signed JWT that is valid for 14 days. The API performs the action and
redirects to `${PUBLIC_APP_URL}/action-done?result=reviewed|snoozed|expired|error`. **Open** records a
click on the digest log (`clicks`, `opened`, `opened_at`) and redirects to the bookmark itself. Action
links use `PUBLIC_API_URL`, falling back to Render's automatic `RENDER_EXTERNAL_URL`, so there's nothing
extra to configure on Render.
