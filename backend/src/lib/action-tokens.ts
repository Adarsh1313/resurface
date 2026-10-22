import jwt from 'jsonwebtoken';
import { getJwtSecret } from './env';
import { getPublicApiUrl } from './urls';

export const EMAIL_ACTION_PURPOSE = 'email-action';
export const EMAIL_ACTIONS = ['review', 'snooze1d', 'open'] as const;
export type EmailAction = (typeof EMAIL_ACTIONS)[number];

export const ACTION_TOKEN_TTL_SECONDS = 14 * 24 * 60 * 60;

export interface ActionTokenPayload {
  purpose: typeof EMAIL_ACTION_PURPOSE;
  bookmarkId: string;
  userId: string;
  action: EmailAction;
  digestLogId?: string;
}

export type VerifyResult =
  | { ok: true; payload: ActionTokenPayload }
  | { ok: false; reason: 'expired' | 'invalid'; payload?: ActionTokenPayload };

export function signActionToken(
  input: { bookmarkId: string; userId: string; action: EmailAction; digestLogId?: string },
  opts: { secret?: string; expiresInSeconds?: number } = {},
): string {
  const payload: ActionTokenPayload = {
    purpose: EMAIL_ACTION_PURPOSE,
    bookmarkId: input.bookmarkId,
    userId: input.userId,
    action: input.action,
    ...(input.digestLogId ? { digestLogId: input.digestLogId } : {}),
  };
  return jwt.sign(payload, opts.secret ?? getJwtSecret(), {
    expiresIn: opts.expiresInSeconds ?? ACTION_TOKEN_TTL_SECONDS,
  });
}

function asPayload(decoded: unknown): ActionTokenPayload | null {
  if (!decoded || typeof decoded !== 'object') return null;
  const d = decoded as Record<string, unknown>;
  if (d.purpose !== EMAIL_ACTION_PURPOSE) return null;
  if (typeof d.bookmarkId !== 'string' || typeof d.userId !== 'string') return null;
  if (!EMAIL_ACTIONS.includes(d.action as EmailAction)) return null;
  if (d.digestLogId !== undefined && typeof d.digestLogId !== 'string') return null;
  return {
    purpose: EMAIL_ACTION_PURPOSE,
    bookmarkId: d.bookmarkId,
    userId: d.userId,
    action: d.action as EmailAction,
    ...(d.digestLogId ? { digestLogId: d.digestLogId as string } : {}),
  };
}

/**
 * Verify an action token. On expiry the (signature-checked) payload is still
 * returned so that "open" links can keep redirecting to the bookmark.
 */
export function verifyActionToken(token: string, opts: { secret?: string } = {}): VerifyResult {
  const secret = opts.secret ?? getJwtSecret();
  try {
    const payload = asPayload(jwt.verify(token, secret, { algorithms: ['HS256'] }));
    return payload ? { ok: true, payload } : { ok: false, reason: 'invalid' };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      try {
        const payload = asPayload(
          jwt.verify(token, secret, { algorithms: ['HS256'], ignoreExpiration: true }),
        );
        if (payload) return { ok: false, reason: 'expired', payload };
      } catch {
        /* fall through */
      }
      return { ok: false, reason: 'expired' };
    }
    return { ok: false, reason: 'invalid' };
  }
}

export function actionUrl(
  input: { bookmarkId: string; userId: string; action: EmailAction; digestLogId?: string },
): string {
  return `${getPublicApiUrl()}/v1/actions/${signActionToken(input)}`;
}
