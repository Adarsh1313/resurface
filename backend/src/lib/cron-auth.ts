import { timingSafeEqual, createHash } from 'crypto';

export type CronAuthResult = { ok: true } | { ok: false; status: 401 | 503; error: string };

function digest(s: string): Buffer {
  return createHash('sha256').update(s).digest();
}

/**
 * Validate `Authorization: Bearer <CRON_SECRET>`.
 * If CRON_SECRET is unset: rejected in production, allowed in dev.
 */
export function checkCronAuth(
  authorization: string | undefined,
  secret: string | undefined,
  nodeEnv: string | undefined,
): CronAuthResult {
  const expected = secret?.trim();
  if (!expected) {
    if (nodeEnv === 'production') {
      return { ok: false, status: 401, error: 'CRON_SECRET is not configured' };
    }
    return { ok: true };
  }
  const match = /^Bearer\s+(.+)$/i.exec(authorization?.trim() || '');
  if (!match) return { ok: false, status: 401, error: 'Missing bearer token' };
  // Hash both sides so lengths match for timingSafeEqual.
  if (!timingSafeEqual(digest(match[1].trim()), digest(expected))) {
    return { ok: false, status: 401, error: 'Invalid cron secret' };
  }
  return { ok: true };
}
