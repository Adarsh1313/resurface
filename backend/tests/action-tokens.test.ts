import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { signActionToken, verifyActionToken, ACTION_TOKEN_TTL_SECONDS } from '../src/lib/action-tokens';
import { checkCronAuth } from '../src/lib/cron-auth';

const secret = 'test-secret';
const input = { bookmarkId: 'b1', userId: 'u1', action: 'review' as const, digestLogId: 'd1' };

describe('action tokens', () => {
  it('round-trips a signed token', () => {
    const token = signActionToken(input, { secret });
    const res = verifyActionToken(token, { secret });
    expect(res).toEqual({ ok: true, payload: { purpose: 'email-action', ...input } });
  });

  it('expires after ~14 days', () => {
    const token = signActionToken(input, { secret });
    const decoded = jwt.decode(token) as { iat: number; exp: number };
    expect(decoded.exp - decoded.iat).toBe(ACTION_TOKEN_TTL_SECONDS);
    expect(ACTION_TOKEN_TTL_SECONDS).toBe(14 * 24 * 3600);
  });

  it('omits digestLogId when not provided', () => {
    const token = signActionToken({ bookmarkId: 'b', userId: 'u', action: 'snooze1d' }, { secret });
    const res = verifyActionToken(token, { secret });
    expect(res.ok && 'digestLogId' in res.payload).toBe(false);
  });

  it('reports expired tokens (with payload for open links)', () => {
    const token = signActionToken({ ...input, action: 'open' }, { secret, expiresInSeconds: -10 });
    const res = verifyActionToken(token, { secret });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe('expired');
      expect(res.payload?.action).toBe('open');
    }
  });

  it('rejects a wrong signature', () => {
    const token = signActionToken(input, { secret });
    expect(verifyActionToken(token, { secret: 'other' })).toEqual({ ok: false, reason: 'invalid' });
  });

  it('rejects tampered tokens', () => {
    const token = signActionToken(input, { secret });
    const [h, , s] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ ...input, userId: 'attacker', purpose: 'email-action' })).toString('base64url');
    expect(verifyActionToken(`${h}.${forged}.${s}`, { secret }).ok).toBe(false);
  });

  it('rejects normal session JWTs (wrong purpose)', () => {
    const session = jwt.sign({ userId: 'u1' }, secret, { expiresIn: '7d' });
    expect(verifyActionToken(session, { secret })).toEqual({ ok: false, reason: 'invalid' });
  });

  it('rejects unknown actions', () => {
    const t = jwt.sign({ purpose: 'email-action', bookmarkId: 'b', userId: 'u', action: 'delete' }, secret);
    expect(verifyActionToken(t, { secret }).ok).toBe(false);
  });

  it('rejects garbage', () => {
    expect(verifyActionToken('not-a-token', { secret })).toEqual({ ok: false, reason: 'invalid' });
  });
});

describe('cron auth', () => {
  it('accepts the right bearer secret', () => {
    expect(checkCronAuth('Bearer s3cret', 's3cret', 'production')).toEqual({ ok: true });
  });
  it('rejects missing/wrong secrets', () => {
    expect(checkCronAuth(undefined, 's3cret', 'production').ok).toBe(false);
    expect(checkCronAuth('Bearer nope', 's3cret', 'production').ok).toBe(false);
    expect(checkCronAuth('s3cret', 's3cret', 'production').ok).toBe(false);
  });
  it('rejects in production when CRON_SECRET is unset, allows in dev', () => {
    expect(checkCronAuth(undefined, undefined, 'production').ok).toBe(false);
    expect(checkCronAuth(undefined, '', 'development').ok).toBe(true);
    expect(checkCronAuth(undefined, undefined, undefined).ok).toBe(true);
  });
});
