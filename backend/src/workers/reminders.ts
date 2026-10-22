import prisma from '../lib/prisma';
import { sendEmail } from '../lib/email';
import { buildReminderEmail } from '../lib/email-templates';
import { actionUrl } from '../lib/action-tokens';
import { displayName } from '../lib/digest';
import { resolvePreferences } from '../lib/preferences';

export interface ReminderRunResult {
  sent: number;
  skipped: number;
  errors: number;
}

/**
 * Email every bookmark whose reminder is due, then mark it sent.
 *
 * Idempotent + overlap-safe: each row is claimed with a conditional update
 * (reminder_sent false -> true) before sending, and released on failure so the
 * next tick retries. Reminders for users who turned reminder emails off, or for
 * bookmarks already reviewed, are marked sent without emailing.
 */
export async function processDueReminders(now = new Date()): Promise<ReminderRunResult> {
  const result: ReminderRunResult = { sent: 0, skipped: 0, errors: 0 };

  const due = await prisma.bookmark.findMany({
    where: { reminder_at: { lte: now, not: null }, reminder_sent: false, deleted_at: null },
    include: {
      topics: true,
      user: { select: { id: true, email: true, name: true, preferences: true } },
    },
    orderBy: { reminder_at: 'asc' },
    take: 100,
  });

  for (const b of due) {
    const claim = await prisma.bookmark.updateMany({
      where: { id: b.id, reminder_sent: false },
      data: { reminder_sent: true },
    });
    if (claim.count !== 1) continue; // another tick got it

    if (b.status === 'reviewed' || resolvePreferences(b.user.preferences).reminder_email === false) {
      result.skipped++;
      continue;
    }

    try {
      const base = { bookmarkId: b.id, userId: b.user.id };
      const email = buildReminderEmail({
        userName: displayName(b.user),
        bookmark: b,
        links: {
          open: actionUrl({ ...base, action: 'open' }),
          review: actionUrl({ ...base, action: 'review' }),
          snooze: actionUrl({ ...base, action: 'snooze1d' }),
        },
      });
      await sendEmail({ to: b.user.email, ...email });
      result.sent++;
    } catch (err) {
      result.errors++;
      console.error(`[reminders] failed for bookmark ${b.id}:`, err);
      await prisma.bookmark
        .update({ where: { id: b.id }, data: { reminder_sent: false } })
        .catch(() => {});
    }
  }

  if (result.sent || result.errors) {
    console.log(`[reminders] sent=${result.sent} skipped=${result.skipped} errors=${result.errors}`);
  }
  return result;
}
