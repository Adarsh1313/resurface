import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../lib/email';
import { escapeHtml } from '../lib/html';

const router = Router();
router.use(authMiddleware);

async function getDigestBookmarks(userId: string) {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

  const bookmarks = await prisma.bookmark.findMany({
    where: { user_id: userId, status: 'pending', deleted_at: null },
    orderBy: [{ reminder_at: 'asc' }, { saved_at: 'asc' }],
    take: 20,
    include: { topics: true },
  });

  // Sort: reminders this week first, then oldest
  const thisWeekReminders = bookmarks.filter(
    (b: any) => b.reminder_at && new Date(b.reminder_at) <= endOfWeek,
  );
  const rest = bookmarks.filter(
    (b: any) => !b.reminder_at || new Date(b.reminder_at) > endOfWeek,
  );
  rest.sort((a: any, b: any) => new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime());

  return [...thisWeekReminders, ...rest].slice(0, 5);
}

function buildDigestHtml(userName: string, bookmarks: any[]): string {
  const items = bookmarks
    .map(
      (b: any) =>
        `<li>
          <strong>${escapeHtml(b.title || b.url)}</strong>
          ${b.author ? `<br>by ${escapeHtml(b.author)}` : ''}
          ${b.platform ? `<br><em>${escapeHtml(b.platform)}</em>` : ''}
        </li>`,
    )
    .join('\n');

  return `
    <h2>Hey ${escapeHtml(userName)},</h2>
    <p>Here are your top ${bookmarks.length} unreviewed saves this week:</p>
    <ol>${items}</ol>
    <p>Open Resurface to review them before they pile up!</p>
  `.trim();
}

// GET /digest/preview
router.get('/preview', async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await getDigestBookmarks(req.user!.id);
    res.json({ bookmarks });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /digest/send-now
router.post('/send-now', async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await getDigestBookmarks(req.user!.id);

    if (bookmarks.length === 0) {
      res.json({ success: true, bookmarks_included: 0, message: 'No pending bookmarks to digest' });
      return;
    }

    const html = buildDigestHtml(req.user!.name, bookmarks);

    await sendEmail({
      to: req.user!.email,
      subject: `Your Resurface Digest — ${bookmarks.length} save${bookmarks.length === 1 ? '' : 's'}`,
      html,
    });

    await prisma.digestLog.create({
      data: {
        user_id: req.user!.id,
        bookmark_ids: bookmarks.map((b: any) => b.id).join(','),
      },
    });

    res.json({ success: true, bookmarks_included: bookmarks.length });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /digest/settings
const settingsSchema = z.object({
  frequency: z.number().int().min(1).max(7).optional(),
  days_of_week: z.string().optional(),
  send_time: z.string().optional(),
  is_active: z.boolean().optional(),
});

router.patch('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const settings = await prisma.digestSetting.upsert({
      where: { user_id: req.user!.id },
      create: { user_id: req.user!.id, ...parsed.data },
      update: parsed.data,
    });

    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
