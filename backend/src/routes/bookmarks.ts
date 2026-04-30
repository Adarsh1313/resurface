import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const createBookmarkSchema = z.object({
  url: z.string().url(),
  platform: z.enum(['x', 'youtube']),
  title: z.string().optional(),
  author: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  duration_seconds: z.number().int().optional(),
  topic_names: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateBookmarkSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'snoozed']).optional(),
  topic_names: z.array(z.string()).optional(),
  notes: z.string().optional(),
  reminder_at: z.string().datetime().nullable().optional(),
});

const snoozeSchema = z.object({
  snoozed_until: z.string().datetime(),
});

const TOPIC_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TOPIC_COLORS[h % TOPIC_COLORS.length];
}

async function resolveTopicIds(userId: string, names?: string[]): Promise<string[] | undefined> {
  if (!names) return undefined;
  const cleaned = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const ids: string[] = [];
  for (const name of cleaned) {
    const existing = await prisma.topic.findUnique({ where: { user_id_name: { user_id: userId, name } } });
    if (existing) {
      ids.push(existing.id);
    } else {
      const created = await prisma.topic.create({ data: { user_id: userId, name, color: colorFor(name) } });
      ids.push(created.id);
    }
  }
  return ids;
}

// Strip common URL patterns, trim whitespace, cap length
function cleanTitle(raw: string, max = 100): string {
  let t = raw.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  if (t.length > max) t = t.slice(0, max - 1).trimEnd() + '…';
  return t;
}

// Turn a profile URL / display name into @handle where we can
function extractHandle(platform: 'x' | 'youtube', authorUrl?: string, authorName?: string): string {
  if (platform === 'x') {
    if (authorUrl) {
      const m = authorUrl.match(/(?:twitter|x)\.com\/([^/?#]+)/i);
      if (m && m[1]) return '@' + m[1];
    }
  } else if (platform === 'youtube') {
    if (authorUrl) {
      const m = authorUrl.match(/youtube\.com\/(@[^/?#]+)/i);
      if (m && m[1]) return m[1];
    }
  }
  return authorName || '';
}

// GET /bookmarks/metadata?url=...
router.get('/metadata', async (req: AuthRequest, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ error: 'url required' });
      return;
    }
    const u = new URL(url);
    let platform: 'x' | 'youtube' | null = null;
    if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') platform = 'youtube';
    else if (u.hostname.includes('x.com') || u.hostname.includes('twitter.com')) platform = 'x';

    if (!platform) {
      res.status(400).json({ error: 'Only X and YouTube URLs are supported' });
      return;
    }

    let title = '';
    let author = '';
    let thumbnail_url = '';
    try {
      const oembedUrl =
        platform === 'youtube'
          ? `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
          : `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
      const r = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const data: any = await r.json();
        const rawTitle = data.title || '';
        const authorName = data.author_name || '';
        const authorUrl = data.author_url || '';

        // For X, tweet text lives in data.html inside <p>...</p>
        if (platform === 'x' && data.html) {
          const match = data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
          if (match) {
            title = match[1]
              .replace(/<[^>]+>/g, ' ')
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ')
              .trim();
          }
        } else {
          title = rawTitle;
        }

        title = cleanTitle(title, platform === 'x' ? 80 : 120);
        author = extractHandle(platform, authorUrl, authorName);
        thumbnail_url = data.thumbnail_url || '';
      }
    } catch {
      // fall through
    }

    res.json({ platform, title, author, thumbnail_url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      platform,
      topic_id,
      status,
      trash,
      sort = 'saved_at',
      order = 'desc',
      page = '1',
      limit = '25',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 25));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { user_id: userId };
    if (trash === 'true') where.deleted_at = { not: null };
    else where.deleted_at = null;
    if (platform) where.platform = platform;
    if (topic_id) where.topics = { some: { id: topic_id } };
    if (status) where.status = status;

    const orderBy: any = {};
    const sortField = sort === 'title' ? 'title' : 'saved_at';
    orderBy[sortField] = order === 'asc' ? 'asc' : 'desc';

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({ where, orderBy, skip, take: limitNum, include: { topics: true } }),
      prisma.bookmark.count({ where }),
    ]);

    res.json({ bookmarks, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createBookmarkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { topic_names, title, ...rest } = parsed.data;
    const topicIds = (await resolveTopicIds(req.user!.id, topic_names)) || [];

    const bookmark = await prisma.bookmark.create({
      data: {
        ...rest,
        title: title ? cleanTitle(title) : undefined,
        user_id: req.user!.id,
        topics: topicIds.length ? { connect: topicIds.map((id) => ({ id })) } : undefined,
      },
      include: { topics: true },
    });

    res.status(201).json({ bookmark });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateBookmarkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const existing = await prisma.bookmark.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    const { topic_names, reminder_at, ...rest } = parsed.data;
    const data: any = { ...rest };

    if (reminder_at === null) data.reminder_at = null;
    else if (reminder_at) data.reminder_at = new Date(reminder_at);

    if (data.status === 'reviewed') data.reviewed_at = new Date();

    // Replace topics entirely if provided
    if (topic_names !== undefined) {
      const topicIds = await resolveTopicIds(req.user!.id, topic_names);
      data.topics = { set: (topicIds || []).map((id) => ({ id })) };
    }

    const bookmark = await prisma.bookmark.update({
      where: { id: req.params.id as string },
      data,
      include: { topics: true },
    });

    res.json({ bookmark });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Soft delete
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.bookmark.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    if (existing.deleted_at) {
      await prisma.bookmark.delete({ where: { id: req.params.id as string } });
    } else {
      await prisma.bookmark.update({
        where: { id: req.params.id as string },
        data: { deleted_at: new Date() },
      });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.bookmark.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }
    const bookmark = await prisma.bookmark.update({
      where: { id: req.params.id as string },
      data: { deleted_at: null },
      include: { topics: true },
    });
    res.json({ bookmark });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/trash/empty', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.bookmark.deleteMany({
      where: { user_id: req.user!.id, deleted_at: { not: null } },
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/snooze', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = snoozeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const existing = await prisma.bookmark.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    const bookmark = await prisma.bookmark.update({
      where: { id: req.params.id as string },
      data: { status: 'snoozed', snoozed_until: new Date(parsed.data.snoozed_until) },
      include: { topics: true },
    });

    res.json({ bookmark });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export async function purgeOldTrash() {
  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.bookmark.deleteMany({
    where: { deleted_at: { lt: cutoff } },
  });
  if (count > 0) console.log(`[trash] Purged ${count} bookmarks older than 15 days`);
}

export default router;
