# Resend email setup

Resurface currently sends three kinds of email:

- Waitlist confirmation: `POST /v1/waitlist` sends this immediately when a new email joins the waitlist.
- Private beta invite: `/dashboard/admin` calls `POST /v1/admin/waitlist/:id/invite`.
- Digest now: dashboard and settings call `POST /v1/digest/send-now` for the logged-in user.

## Resend and Render variables

Set these on the Render backend service:

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Resurface <hello@your-verified-domain.com>
EMAIL_REPLY_TO=you@your-domain.com
PUBLIC_APP_URL=https://your-web-app.vercel.app
ALLOWED_ORIGINS=https://your-web-app.vercel.app
ADMIN_EMAILS=you@your-domain.com
REQUIRE_INVITE=true
```

The backend prefers Resend whenever `RESEND_API_KEY` is present. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` are only fallback settings now.

## Domain checklist

1. Add a sending domain in Resend. A sending subdomain such as `mail.your-domain.com` or `updates.your-domain.com` is usually cleaner than the root domain.
2. Add the DNS records Resend shows for SPF and DKIM.
3. Click `Verify DNS Records` in Resend and wait until the domain status is `verified`.
4. Set `EMAIL_FROM` to an address on that verified domain.
5. Send a waitlist signup and confirm it appears in Resend's Emails/Logs dashboard.

`onboarding@resend.dev` is only useful for testing to the email address on the Resend account. For real waitlist users, use a verified domain in `EMAIL_FROM`.

## Manual test flow

1. Submit the landing-page waitlist form with a test email.
2. In Render logs, look for `Resend delivered (id=...)`.
3. Log in with an email listed in `ADMIN_EMAILS`.
4. Open `/dashboard/admin`, confirm the waitlist row appears, and click `Invite`.
5. Log in as a normal user with saved bookmarks and click `Send digest now`.

The weekly scheduled digest worker is not implemented yet. The current digest email path is manual via `POST /v1/digest/send-now`.
