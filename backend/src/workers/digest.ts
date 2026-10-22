import prisma from '../lib/prisma';
import { getDigestBookmarks, sendDigest } from '../lib/digest';
import { isDigestDue, rowToDto, DEFAULT_DIGEST_ROW } from '../lib/digest-schedule';
import { resolvePreferences } from '../lib/preferences';

export interface DigestRunResult {
  sent: number;
  skipped: number;
  failed: number;
}

/**
 * Atomically claim today's digest slot for a user by moving last_sent_at from
 * the value we read to `now`. Two overlapping ticks can't both win.
 */
async function claimSlot(userId: string, settingId: string | null, prev: Date | null, now: Date) {
  if (settingId) {
    const { count } = await prisma.digestSetting.updateMany({
      where: { id: settingId, last_sent_at: prev },
      data: { last_sent_at: now },
    });
    return count === 1;
  }
  try {
    await prisma.digestSetting.create({
      data: { user_id: userId, ...DEFAULT_DIGEST_ROW, last_sent_at: now },
    });
    return true;
  } catch {
    return false; // unique(user_id) — another tick created it first
  }
}

async function releaseSlot(userId: string, prev: Date | null, claimedAt: Date) {
  await prisma.digestSetting
    .updateMany({ where: { user_id: userId, last_sent_at: claimedAt }, data: { last_sent_at: prev } })
    .catch(() => {});
}

/**
 * Send every digest that is due right now (in each user's local timezone).
 * Users without a settings row get the defaults (weekly, Monday 08:00).
 */
export async function processDueDigests(now = new Date()): Promise<DigestRunResult> {
  const result: DigestRunResult = { sent: 0, skipped: 0, failed: 0 };

  const users = await prisma.user.findMany({
    where: { OR: [{ digest_setting: { is: { is_active: true } } }, { digest_setting: { is: null } }] },
    select: { id: true, email: true, name: true, timezone: true, preferences: true, digest_setting: true },
  });

  for (const user of users) {
    if (resolvePreferences(user.preferences).digest_email === false) continue;

    const row = user.digest_setting;
    const dto = rowToDto(row, user.timezone);
    const prev = row?.last_sent_at ?? null;
    if (!isDigestDue({ ...dto, now, last_sent_at: prev })) continue;

    try {
      const bookmarks = await getDigestBookmarks(user.id, now);
      if (bookmarks.length === 0) {
        result.skipped++;
        continue;
      }
      if (!(await claimSlot(user.id, row?.id ?? null, prev, now))) {
        result.skipped++;
        continue;
      }
      try {
        await sendDigest(user, bookmarks);
        result.sent++;
      } catch (err) {
        await releaseSlot(user.id, prev, now);
        throw err;
      }
    } catch (err) {
      result.failed++;
      console.error(`[digest] failed for user ${user.id}:`, err);
    }
  }

  if (result.sent || result.failed) {
    console.log(`[digest] sent=${result.sent} skipped=${result.skipped} failed=${result.failed}`);
  }
  return result;
}
