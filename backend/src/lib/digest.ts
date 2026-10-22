import prisma from './prisma';
import { sendEmail } from './email';
import { buildDigestEmail, EmailBookmark } from './email-templates';
import { actionUrl } from './action-tokens';
import { DIGEST_SIZE, REMINDER_WINDOW_MS, pickDigestBookmarks } from './digest-selection';

/**
 * Top 5 pending bookmarks: reminders due this week first, then oldest saves.
 * Two small queries so a user with many future reminders can't crowd out
 * old saves (and vice versa).
 */
export async function getDigestBookmarks(userId: string, now = new Date()) {
  const base = { user_id: userId, status: 'pending', deleted_at: null };
  const [soon, oldest] = await Promise.all([
    prisma.bookmark.findMany({
      where: { ...base, reminder_at: { lte: new Date(now.getTime() + REMINDER_WINDOW_MS) } },
      orderBy: { reminder_at: 'asc' },
      take: DIGEST_SIZE,
      include: { topics: true },
    }),
    prisma.bookmark.findMany({
      where: base,
      orderBy: { saved_at: 'asc' },
      take: DIGEST_SIZE * 2,
      include: { topics: true },
    }),
  ]);
  const byId = new Map([...soon, ...oldest].map((b) => [b.id, b]));
  return pickDigestBookmarks([...byId.values()], now);
}

export type DigestBookmark = Awaited<ReturnType<typeof getDigestBookmarks>>[number];

export function displayName(user: { name?: string | null; email: string }): string {
  return user.name?.trim() || user.email.split('@')[0];
}

/**
 * Create the DigestLog, render + send the email with signed action links
 * bound to that log. Deletes the log again if sending fails.
 */
export async function sendDigest(
  user: { id: string; email: string; name?: string | null },
  bookmarks: DigestBookmark[],
): Promise<{ digestLogId: string }> {
  const log = await prisma.digestLog.create({
    data: { user_id: user.id, bookmark_ids: bookmarks.map((b) => b.id).join(',') },
  });
  try {
    const email = buildDigestEmail({
      userName: displayName(user),
      bookmarks: bookmarks as EmailBookmark[],
      linksFor: (b) => {
        const base = { bookmarkId: b.id, userId: user.id, digestLogId: log.id };
        return {
          open: actionUrl({ ...base, action: 'open' }),
          review: actionUrl({ ...base, action: 'review' }),
          snooze: actionUrl({ ...base, action: 'snooze1d' }),
        };
      },
    });
    await sendEmail({ to: user.email, ...email });
    return { digestLogId: log.id };
  } catch (err) {
    await prisma.digestLog.delete({ where: { id: log.id } }).catch(() => {});
    throw err;
  }
}
