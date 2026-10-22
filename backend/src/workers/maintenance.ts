import prisma from '../lib/prisma';

export const TRASH_RETENTION_DAYS = 15;

/** Hard-delete bookmarks that have sat in the trash longer than the retention window. */
export async function purgeOldTrash(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.bookmark.deleteMany({ where: { deleted_at: { lt: cutoff } } });
  if (count > 0) console.log(`[trash] purged ${count} bookmarks older than ${TRASH_RETENTION_DAYS} days`);
  return count;
}

/** Move snoozed bookmarks whose snooze has elapsed back to pending (so digests see them again). */
export async function wakeSnoozed(now = new Date()): Promise<number> {
  const { count } = await prisma.bookmark.updateMany({
    where: { status: 'snoozed', snoozed_until: { lte: now }, deleted_at: null },
    data: { status: 'pending', snoozed_until: null },
  });
  return count;
}
