import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { sendEmail } from '../lib/email';

const router = Router();

// Public — no auth middleware. This is the landing-page form endpoint.
const schema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(50).optional(),
  referrer: z.string().max(500).optional(),
});

function buildWaitlistConfirmationEmail(email: string) {
  const appUrl = process.env.PUBLIC_APP_URL || process.env.WEB_APP_URL || 'http://localhost:3000';
  const html = `
  <div style="margin:0;padding:0;background:#0f1413;color:#f4f7f5;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2dd4bf;margin-bottom:28px;">Resurface</div>
      <div style="background:#151b19;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:28px;">
        <h1 style="margin:0 0 14px;font-size:28px;line-height:1.12;font-weight:650;color:#ffffff;">You're on the Resurface waitlist.</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#c6d0cc;">Thanks for joining. We're building Resurface to help people actually revisit the X and YouTube saves they meant to come back to.</p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#c6d0cc;">The private beta is rolling out manually so we can learn from early users closely. When your invite is ready, we'll send setup steps for the dashboard and Chrome extension.</p>
        <div style="margin:24px 0;padding:16px;border-radius:8px;background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.20);">
          <p style="margin:0;font-size:14px;line-height:1.55;color:#d7fffa;">You joined with <strong>${email}</strong>. Keep an eye on this inbox for the private beta invite.</p>
        </div>
        <a href="${appUrl}" style="display:inline-block;background:#2dd4bf;color:#082f2a;text-decoration:none;border-radius:6px;padding:12px 16px;font-size:14px;font-weight:700;">Visit Resurface</a>
      </div>
      <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#7d8a86;">You received this because you joined the Resurface waitlist. If this was not you, you can ignore this email.</p>
    </div>
  </div>`;

  const text = [
    "You're on the Resurface waitlist.",
    '',
    "Thanks for joining. We're building Resurface to help people actually revisit the X and YouTube saves they meant to come back to.",
    '',
    "The private beta is rolling out manually so we can learn from early users closely. When your invite is ready, we'll send setup steps for the dashboard and Chrome extension.",
    '',
    `You joined with ${email}.`,
    `Visit Resurface: ${appUrl}`,
  ].join('\n');

  return {
    subject: "You're on the Resurface waitlist",
    html,
    text,
  };
}

// POST /v1/waitlist
router.post('/', async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const source = parsed.data.source || 'landing';
  const referrer = parsed.data.referrer;
  const user_agent = req.headers['user-agent']?.slice(0, 500);
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    undefined;

  try {
    // Upsert — don't error on duplicate, just return success (good UX).
    const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
    const entry =
      existing ||
      (await prisma.waitlistEntry.create({
        data: { email, source, referrer, user_agent, ip },
      }));

    if (!existing) {
      const confirmation = buildWaitlistConfirmationEmail(email);
      sendEmail({
        to: email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      }).catch((err) => {
        console.error('[waitlist] confirmation email failed:', err);
      });
    }

    res.json({ success: true, id: entry.id, alreadyJoined: Boolean(existing) });
  } catch (err) {
    console.error('[waitlist] save failed:', err);
    res.status(500).json({ error: 'Could not save — please try again' });
  }
});

// GET /v1/waitlist/count — public count for landing-page social proof ("N people already signed up").
router.get('/count', async (_req: Request, res: Response) => {
  try {
    const count = await prisma.waitlistEntry.count();
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
