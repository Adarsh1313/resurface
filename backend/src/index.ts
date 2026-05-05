import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import bookmarkRoutes, { purgeOldTrash } from './routes/bookmarks';
import topicRoutes from './routes/topics';
import statsRoutes from './routes/stats';
import aiRoutes from './routes/ai';
import digestRoutes from './routes/digest';
import reminderRoutes from './routes/reminders';
import waitlistRoutes from './routes/waitlist';
import { processDueReminders } from './workers/reminders';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS allow-list: localhost + any domain listed in ALLOWED_ORIGINS (comma-separated).
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
  purgeOldTrash().catch(() => {});
  setInterval(() => purgeOldTrash().catch(() => {}), 6 * 60 * 60 * 1000); // every 6h

  // Reminder worker: check every 60s for due reminders and email them.
  processDueReminders().catch((e) => console.error('[reminders] initial run failed:', e));
  setInterval(
    () => processDueReminders().catch((e) => console.error('[reminders] tick failed:', e)),
    60 * 1000,
  );
});

export default app;
