import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { preferencesPatchSchema, resolvePreferences } from '../lib/preferences';

const router = Router();
router.use(authMiddleware);

// GET /v1/preferences
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { preferences: true },
    });
    res.json({ preferences: resolvePreferences(user?.preferences) });
  } catch (err) {
    console.error('[preferences] get failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /v1/preferences — any subset of the four booleans.
router.patch('/', async (req: AuthRequest, res: Response) => {
  const parsed = preferencesPatchSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { preferences: true },
    });
    const next = { ...resolvePreferences(user?.preferences), ...parsed.data };
    await prisma.user.update({ where: { id: req.user!.id }, data: { preferences: next } });
    res.json({ preferences: next });
  } catch (err) {
    console.error('[preferences] patch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
