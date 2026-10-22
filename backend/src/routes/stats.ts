import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { computeInsights } from '../lib/insights';

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // Start of this week (Monday)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - mondayOffset);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const [saved_this_week, saved_last_week, pending_review, platformBreakdown, topics] =
      await Promise.all([
        prisma.bookmark.count({
          where: { user_id: userId, saved_at: { gte: startOfThisWeek }, deleted_at: null },
        }),
        prisma.bookmark.count({
          where: {
            user_id: userId,
            saved_at: { gte: startOfLastWeek, lt: startOfThisWeek },
            deleted_at: null,
          },
        }),
        prisma.bookmark.count({
          where: { user_id: userId, status: 'pending', deleted_at: null },
        }),
        prisma.bookmark.groupBy({
          by: ['platform'],
          where: { user_id: userId, deleted_at: null },
          _count: true,
        }),
        prisma.topic.findMany({
          where: { user_id: userId },
          include: { _count: { select: { bookmarks: { where: { deleted_at: null } } } } },
        }),
      ]);

    const sortedTopics = topics
      .map((t) => ({ id: t.id, name: t.name, count: t._count.bookmarks }))
      .sort((a, b) => b.count - a.count);
    const top_topic = sortedTopics[0] && sortedTopics[0].count > 0 ? sortedTopics[0] : null;

    const platform_breakdown: Record<string, number> = {};
    for (const item of platformBreakdown) {
      platform_breakdown[item.platform] = item._count;
    }

    res.json({
      saved_this_week,
      saved_last_week,
      pending_review,
      top_topic,
      review_streak_weeks: 0,
      platform_breakdown,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /stats/insights — everything the dashboard needs about the user's saving habits.
router.get('/insights', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user, bookmarks, lastDigest] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } }),
      prisma.bookmark.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          url: true,
          platform: true,
          title: true,
          author: true,
          status: true,
          saved_at: true,
          reviewed_at: true,
          deleted_at: true,
          duration_seconds: true,
          topics: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.digestLog.findFirst({
        where: { user_id: userId },
        orderBy: { sent_at: 'desc' },
        select: { id: true, sent_at: true, bookmark_ids: true },
      }),
    ]);

    res.json(computeInsights(bookmarks, lastDigest, new Date(), user?.timezone ?? 'UTC'));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
