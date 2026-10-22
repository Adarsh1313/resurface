import { describe, expect, it } from 'vitest';
import { createBookmarkSchema } from '../src/lib/bookmark-schemas';

const base = { url: 'https://x.com/naval/status/1', platform: 'x' as const };

describe('createBookmarkSchema', () => {
  it('keeps reminder_at sent by the extension at capture time', () => {
    const parsed = createBookmarkSchema.parse({ ...base, reminder_at: '2026-10-22T15:40:00.000Z' });
    expect(parsed.reminder_at).toEqual(new Date('2026-10-22T15:40:00.000Z'));
  });

  it('accepts an ISO time with an offset', () => {
    const parsed = createBookmarkSchema.parse({ ...base, reminder_at: '2026-10-22T21:10:00+05:30' });
    expect(parsed.reminder_at).toEqual(new Date('2026-10-22T15:40:00.000Z'));
  });

  it('leaves reminder_at unset when omitted', () => {
    expect(createBookmarkSchema.parse(base).reminder_at).toBeUndefined();
  });

  it('rejects a reminder_at that is not a datetime', () => {
    expect(createBookmarkSchema.safeParse({ ...base, reminder_at: 'tomorrow' }).success).toBe(false);
  });
});
