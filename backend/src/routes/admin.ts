import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { sendEmail } from '../lib/email';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

function adminEmails() {
  return (process.env.ADMIN_EMAILS || process.env.OWNER_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function requireAdmin(req: AuthRequest, res: Response, next: () => void) {
  const allowed = adminEmails();
  const email = req.user?.email.toLowerCase();

  if (!email || allowed.length === 0 || !allowed.includes(email)) {
    res.status(403).json({
      error: 'Admin access required',
      hint: 'Set ADMIN_EMAILS to your owner account email on the backend.',
    });
    return;
  }

  next();
}

function buildInviteEmail(email: string, token: string) {
  const appUrl = process.env.PUBLIC_APP_URL || process.env.WEB_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl.replace(/\/$/, '')}/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const html = `
  <div style="margin:0;padding:0;background:#0f1413;color:#f4f7f5;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2dd4bf;margin-bottom:28px;">Resurface</div>
      <div style="background:#151b19;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:28px;">
        <h1 style="margin:0 0 14px;font-size:28px;line-height:1.12;font-weight:650;color:#ffffff;">Your Resurface beta invite is ready.</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#c6d0cc;">Thanks for joining early. You can now create your account and try the private beta dashboard.</p>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#c6d0cc;">After signup, use the onboarding page to install the Chrome extension or add a bookmark manually.</p>
        <a href="${inviteUrl}" style="display:inline-block;background:#2dd4bf;color:#082f2a;text-decoration:none;border-radius:6px;padding:12px 16px;font-size:14px;font-weight:700;">Create your account</a>
      </div>
      <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#7d8a86;">This private beta invite was sent to ${email}.</p>
    </div>
  </div>`;

  return {
    subject: 'Your Resurface beta invite is ready',
    html,
    text: [
      'Your Resurface beta invite is ready.',
      '',
      'Thanks for joining early. You can now create your account and try the private beta dashboard.',
      '',
      `Create your account: ${inviteUrl}`,
    ].join('\n'),
  };
}

router.use(authMiddleware, requireAdmin);

// GET /v1/admin/waitlist
router.get('/waitlist', async (_req: AuthRequest, res: Response) => {
  try {
    const [entries, total, pending, invited, users] = await Promise.all([
      prisma.waitlistEntry.findMany({
        orderBy: { created_at: 'desc' },
        take: 250,
      }),
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.count({ where: { status: 'pending' } }),
      prisma.waitlistEntry.count({ where: { status: 'invited' } }),
      prisma.user.count(),
    ]);

    res.json({ entries, counts: { total, pending, invited, users } });
  } catch (err) {
    console.error('[admin] waitlist list failed:', err);
    res.status(500).json({ error: 'Could not load waitlist' });
  }
});

// POST /v1/admin/waitlist/:id/invite
router.post('/waitlist/:id/invite', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
    if (!entry) {
      res.status(404).json({ error: 'Waitlist entry not found' });
      return;
    }

    const invite_token = entry.invite_token || randomUUID();
    const updated = await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: {
        status: 'invited',
        invite_token,
        invited_at: new Date(),
      },
    });

    const invite = buildInviteEmail(updated.email, invite_token);
    await sendEmail({
      to: updated.email,
      subject: invite.subject,
      html: invite.html,
      text: invite.text,
    });

    res.json({ success: true, entry: updated });
  } catch (err) {
    console.error('[admin] invite failed:', err);
    res.status(500).json({ error: 'Could not send invite' });
  }
});

export default router;
