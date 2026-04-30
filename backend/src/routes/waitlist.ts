import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const router = Router();

// Public — no auth middleware. This is the landing-page form endpoint.
const schema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(50).optional(),
  referrer: z.string().max(500).optional(),
});

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
    const entry = await prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, source, referrer, user_agent, ip },
      update: {}, // keep original created_at + source
    });
    res.json({ success: true, id: entry.id });
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
