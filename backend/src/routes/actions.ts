import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyActionToken } from '../lib/action-tokens';
import { getPublicAppUrl } from '../lib/urls';

const router = Router();

type ActionResult = 'reviewed' | 'snoozed' | 'expired' | 'error';

function doneUrl(result: ActionResult): string {
  return `${getPublicAppUrl()}/action-done?result=${result}`;
}

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET /v1/actions/:token — public, signed one-click links from emails.
router.get('/:token', async (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store');
  res.set('Referrer-Policy', 'no-referrer');
  const verified = verifyActionToken(String(req.params.token));

  // "Open" should keep working even after the token expires — just don't count it.
  if (!verified.ok) {
    if (verified.reason === 'expired' && verified.payload?.action === 'open') {
      const b = await prisma.bookmark
        .findFirst({ where: { id: verified.payload.bookmarkId, user_id: verified.payload.userId } })
        .catch(() => null);
      if (b && isHttpUrl(b.url)) return res.redirect(302, b.url);
    }
    return res.redirect(302, doneUrl(verified.reason === 'expired' ? 'expired' : 'error'));
  }

  const { bookmarkId, userId, action, digestLogId } = verified.payload;
  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user_id: userId, deleted_at: null },
    });
    if (!bookmark) return res.redirect(302, doneUrl('error'));

    const logWhere = digestLogId ? { id: digestLogId, user_id: userId } : null;

    if (action === 'open') {
      if (logWhere) {
        const now = new Date();
        await prisma.digestLog
          .updateMany({ where: logWhere, data: { clicks: { increment: 1 }, opened: true } })
          .catch(() => {});
        await prisma.digestLog
          .updateMany({ where: { ...logWhere, opened_at: null }, data: { opened_at: now } })
          .catch(() => {});
      }
      if (!isHttpUrl(bookmark.url)) return res.redirect(302, doneUrl('error'));
      return res.redirect(302, bookmark.url);
    }

    if (action === 'review') {
      // Conditional update keeps double-clicks from double-counting.
      const { count } = await prisma.bookmark.updateMany({
        where: { id: bookmark.id, status: { not: 'reviewed' } },
        data: { status: 'reviewed', reviewed_at: new Date(), snoozed_until: null },
      });
      if (count === 1 && logWhere) {
        await prisma.digestLog
          .updateMany({ where: logWhere, data: { items_reviewed: { increment: 1 } } })
          .catch(() => {});
      }
      return res.redirect(302, doneUrl('reviewed'));
    }

    // snooze1d
    await prisma.bookmark.update({
      where: { id: bookmark.id },
      data: { status: 'snoozed', snoozed_until: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
    return res.redirect(302, doneUrl('snoozed'));
  } catch (err) {
    console.error('[actions] failed:', err);
    return res.redirect(302, doneUrl('error'));
  }
});

export default router;
