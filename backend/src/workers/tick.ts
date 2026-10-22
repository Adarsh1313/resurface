import { processDueReminders, ReminderRunResult } from './reminders';
import { processDueDigests, DigestRunResult } from './digest';
import { purgeOldTrash, wakeSnoozed } from './maintenance';

export interface TickResult {
  reminders: ReminderRunResult;
  digests: DigestRunResult;
  purged: number;
  unsnoozed: number;
  ran_at: string;
  duration_ms: number;
}

let running: Promise<TickResult> | null = null;

/**
 * One scheduler tick: wake elapsed snoozes, send due reminders + digests,
 * purge old trash. Called by POST /v1/cron/tick (production, via cron-job.org)
 * and by the in-process interval (local dev). Overlapping calls in the same
 * process share one run; cross-process overlap is handled by row-level claims.
 */
export function runTick(now = new Date()): Promise<TickResult> {
  if (running) return running;
  running = (async () => {
    const started = Date.now();
    const unsnoozed = await wakeSnoozed(now).catch((e) => {
      console.error('[tick] wakeSnoozed failed:', e);
      return 0;
    });
    const reminders = await processDueReminders(now).catch((e) => {
      console.error('[tick] reminders failed:', e);
      return { sent: 0, skipped: 0, errors: 1 };
    });
    const digests = await processDueDigests(now).catch((e) => {
      console.error('[tick] digests failed:', e);
      return { sent: 0, skipped: 0, failed: 1 };
    });
    const purged = await purgeOldTrash(now).catch((e) => {
      console.error('[tick] purge failed:', e);
      return 0;
    });
    return {
      reminders,
      digests,
      purged,
      unsnoozed,
      ran_at: now.toISOString(),
      duration_ms: Date.now() - started,
    };
  })().finally(() => {
    running = null;
  });
  return running;
}
