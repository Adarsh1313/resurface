import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import bookmarkRoutes from './routes/bookmarks';
import topicRoutes from './routes/topics';
import statsRoutes from './routes/stats';
import aiRoutes from './routes/ai';
import digestRoutes from './routes/digest';
import reminderRoutes from './routes/reminders';
import waitlistRoutes from './routes/waitlist';
import adminRoutes from './routes/admin';
import cronRoutes from './routes/cron';
import preferencesRoutes from './routes/preferences';
import actionRoutes from './routes/actions';
import { runTick } from './workers/tick';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS allow-list: localhost + any *.vercel.app + domains in ALLOWED_ORIGINS.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (origin === 'http://localhost:3000') return true;
  if (origin.startsWith('chrome-extension://')) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    return new URL(origin).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/same-origin
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/v1/auth', authRoutes);
app.use('/v1/bookmarks', bookmarkRoutes);
app.use('/v1/topics', topicRoutes);
app.use('/v1/stats', statsRoutes);
app.use('/v1/ai', aiRoutes);
app.use('/v1/digest', digestRoutes);
app.use('/v1/reminders', reminderRoutes);
app.use('/v1/waitlist', waitlistRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/cron', cronRoutes);
app.use('/v1/preferences', preferencesRoutes);
app.use('/v1/actions', actionRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`select 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Production scheduling is driven externally: cron-job.org calls
  // POST /v1/cron/tick every 10 min (Render free sleeps, so timers here are
  // unreliable — see docs/cron-setup.md). This in-process timer is a harmless
  // fallback for local dev / while awake; the jobs are idempotent and
  // overlap-safe, so running both is fine. Set DISABLE_INTERNAL_SCHEDULER=true to turn it off.
  if (process.env.DISABLE_INTERNAL_SCHEDULER !== 'true') {
    const tick = () => runTick().catch((e) => console.error('[scheduler] tick failed:', e));
    tick();
    setInterval(tick, 60 * 1000);
  }
});

export default app;
