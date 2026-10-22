import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { sendEmail } from '../lib/email';
import { buildInviteEmail } from '../lib/email-templates';
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
