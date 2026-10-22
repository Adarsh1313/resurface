import { Router, Request, Response } from 'express';
import { checkCronAuth } from '../lib/cron-auth';
import { runTick } from '../workers/tick';

const router = Router();

// POST|GET /v1/cron/tick — called every ~10 min by cron-job.org (see docs/cron-setup.md).
// Not user-authenticated; requires Authorization: Bearer <CRON_SECRET>.
async function tick(req: Request, res: Response) {
  const auth = checkCronAuth(req.headers.authorization, process.env.CRON_SECRET, process.env.NODE_ENV);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }
  try {
    const result = await runTick();
    res.json(result);
  } catch (err) {
    console.error('[cron] tick failed:', err);
    res.status(500).json({ error: 'Tick failed' });
  }
}

router.post('/tick', tick);
router.get('/tick', tick);

export default router;
