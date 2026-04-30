import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const createTopicSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

const updateTopicSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      where: { user_id: req.user!.id },
      include: { _count: { select: { bookmarks: { where: { deleted_at: null } } } } },
      orderBy: { name: 'asc' },
    });

    const result = topics.map(({ _count, ...topic }) => ({
      ...topic,
      count: _count.bookmarks,
    }));

    res.json({ topics: result });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTopicSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const topic = await prisma.topic.create({
      data: { ...parsed.data, user_id: req.user!.id },
    });

    res.status(201).json({ topic });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      res.status(400).json({ error: 'Topic with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateTopicSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const existing = await prisma.topic.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const topic = await prisma.topic.update({
      where: { id: req.params.id as string },
      data: parsed.data,
    });

    res.json({ topic });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      res.status(400).json({ error: 'Topic with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.topic.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    await prisma.topic.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
