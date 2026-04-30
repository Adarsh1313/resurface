import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { processDueReminders } from '../workers/reminders';

const router = Router();
router.use(authMiddleware);

// POST /v1/reminders/run — manually trigger the worker (dev/testing).
router.post('/run', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await processDueReminders();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
