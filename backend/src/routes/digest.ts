import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getDigestBookmarks, sendDigest } from '../lib/digest';
import { DEFAULT_DIGEST_ROW, patchToDbData, rowToDto, settingsPatchSchema } from '../lib/digest-schedule';

const router = Router();
router.use(authMiddleware);

async function loadSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true, digest_setting: true },
  });
  return rowToDto(user?.digest_setting ?? null, user?.timezone ?? 'UTC');
}

// GET /v1/digest/preview
router.get('/preview', async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await getDigestBookmarks(req.user!.id);
    res.json({ bookmarks });
  } catch (err) {
    console.error('[digest] preview failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /v1/digest/send-now — manual send; does not affect the schedule (last_sent_at).
router.post('/send-now', async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await getDigestBookmarks(req.user!.id);
    if (bookmarks.length === 0) {
      res.json({ success: true, bookmarks_included: 0, message: 'No pending bookmarks to digest' });
      return;
    }
    await sendDigest(req.user!, bookmarks);
    res.json({ success: true, bookmarks_included: bookmarks.length });
  } catch (err) {
    console.error('[digest] send-now failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /v1/digest/settings
router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    res.json({ settings: await loadSettings(req.user!.id) });
  } catch (err) {
    console.error('[digest] settings get failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /v1/digest/settings — any subset of { frequency, days_of_week, send_time, timezone, is_active }
router.patch('/settings', async (req: AuthRequest, res: Response) => {
  const parsed = settingsPatchSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }
  try {
    const userId = req.user!.id;
    const { timezone } = parsed.data;
    const data = patchToDbData(parsed.data);

    await prisma.$transaction([
      ...(timezone ? [prisma.user.update({ where: { id: userId }, data: { timezone } })] : []),
      prisma.digestSetting.upsert({
        where: { user_id: userId },
        create: { user_id: userId, ...DEFAULT_DIGEST_ROW, ...data },
        update: data,
      }),
    ]);

    res.json({ settings: await loadSettings(userId) });
  } catch (err) {
    console.error('[digest] settings patch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
