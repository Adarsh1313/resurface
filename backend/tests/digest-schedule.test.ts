import { describe, expect, it } from 'vitest';
import {
  isDigestDue,
  isValidTimezone,
  localParts,
  patchToDbData,
  rowToDto,
  settingsPatchSchema,
  DueInput,
} from '../src/lib/digest-schedule';
import { pickDigestBookmarks } from '../src/lib/digest-selection';

const base = (over: Partial<DueInput>): DueInput => ({
  now: new Date('2026-10-19T08:30:00Z'), // Monday 08:30 UTC
  timezone: 'UTC',
  frequency: 'weekly',
  days_of_week: [1],
  send_time: '08:00',
  is_active: true,
  last_sent_at: null,
  ...over,
});

describe('localParts', () => {
  it('resolves weekday/date/time in the target timezone', () => {
    // 2026-10-19 02:00 UTC = Sunday 2026-10-18 22:00 in New York (EDT)
    const p = localParts(new Date('2026-10-19T02:00:00Z'), 'America/New_York');
    expect(p).toEqual({ date: '2026-10-18', weekday: 0, minutes: 22 * 60 });
  });

  it('handles positive offsets (Asia/Kolkata +05:30)', () => {
    const p = localParts(new Date('2026-10-19T20:00:00Z'), 'Asia/Kolkata');
    expect(p).toEqual({ date: '2026-10-20', weekday: 2, minutes: 1 * 60 + 30 });
  });

  it('reports midnight as 0 minutes', () => {
    expect(localParts(new Date('2026-10-19T00:00:00Z'), 'UTC').minutes).toBe(0);
  });
});

describe('isDigestDue', () => {
  it('is due on a scheduled day after send_time', () => {
    expect(isDigestDue(base({}))).toBe(true);
  });

  it('is not due before send_time', () => {
    expect(isDigestDue(base({ now: new Date('2026-10-19T07:59:00Z') }))).toBe(false);
  });

  it('is due exactly at send_time', () => {
    expect(isDigestDue(base({ now: new Date('2026-10-19T08:00:00Z') }))).toBe(true);
  });

  it('is not due on a non-scheduled day', () => {
    expect(isDigestDue(base({ now: new Date('2026-10-20T09:00:00Z') }))).toBe(false); // Tue
  });

  it('daily ignores days_of_week', () => {
    expect(
      isDigestDue(base({ frequency: 'daily', days_of_week: [1], now: new Date('2026-10-22T09:00:00Z') })),
    ).toBe(true);
  });

  it('is not due when inactive', () => {
    expect(isDigestDue(base({ is_active: false }))).toBe(false);
  });

  it('is not due if already sent on the same local date', () => {
    expect(isDigestDue(base({ last_sent_at: new Date('2026-10-19T08:05:00Z') }))).toBe(false);
  });

  it('is idempotent for two ticks in the same minute', () => {
    const now = new Date('2026-10-19T08:30:00Z');
    expect(isDigestDue(base({ now }))).toBe(true);
    // after the first tick sets last_sent_at = now
    expect(isDigestDue(base({ now, last_sent_at: now }))).toBe(false);
  });

  it('is due again next scheduled week', () => {
    expect(
      isDigestDue(base({ now: new Date('2026-10-26T08:30:00Z'), last_sent_at: new Date('2026-10-19T08:05:00Z') })),
    ).toBe(true);
  });

  it('uses the user timezone for the day and the time', () => {
    // Monday 08:00 in Kolkata = Monday 02:30 UTC
    const tz = 'Asia/Kolkata';
    expect(isDigestDue(base({ timezone: tz, now: new Date('2026-10-19T02:29:00Z') }))).toBe(false);
    expect(isDigestDue(base({ timezone: tz, now: new Date('2026-10-19T02:30:00Z') }))).toBe(true);
    // Monday 08:30 UTC is still Monday 14:00 IST → due
    expect(isDigestDue(base({ timezone: tz }))).toBe(true);
    // Sunday 23:00 UTC is Monday 04:30 IST → Monday but before 08:00
    expect(isDigestDue(base({ timezone: tz, now: new Date('2026-10-18T23:00:00Z') }))).toBe(false);
  });

  it('negative offsets: Monday 08:00 in Los Angeles = Monday 15:00 UTC', () => {
    const tz = 'America/Los_Angeles';
    expect(isDigestDue(base({ timezone: tz, now: new Date('2026-10-19T14:59:00Z') }))).toBe(false);
    expect(isDigestDue(base({ timezone: tz, now: new Date('2026-10-19T15:00:00Z') }))).toBe(true);
    // Tuesday 06:00 UTC is still Monday 23:00 in LA → due (catch-up)
    expect(isDigestDue(base({ timezone: tz, now: new Date('2026-10-20T06:00:00Z') }))).toBe(true);
  });

  it('already-sent is judged by the local date, not the UTC date', () => {
    const tz = 'America/Los_Angeles';
    // sent Monday 15:10 UTC (Mon 08:10 LA). Tuesday 06:00 UTC is still Monday in LA → not due.
    expect(
      isDigestDue(
        base({ timezone: tz, now: new Date('2026-10-20T06:00:00Z'), last_sent_at: new Date('2026-10-19T15:10:00Z') }),
      ),
    ).toBe(false);
  });

  it('accepts HH:MM:SS send_time from the DB', () => {
    expect(isDigestDue(base({ send_time: '08:00:00' }))).toBe(true);
  });

  it('falls back to UTC for an invalid timezone', () => {
    expect(isDigestDue(base({ timezone: 'Not/AZone' }))).toBe(true);
  });
});

describe('settings mapping', () => {
  it('returns contract defaults when there is no row', () => {
    expect(rowToDto(null, 'Europe/Berlin')).toEqual({
      frequency: 'weekly',
      days_of_week: [1],
      send_time: '08:00',
      timezone: 'Europe/Berlin',
      is_active: true,
      last_sent_at: null,
    });
  });

  it('round-trips a patch through DB columns', () => {
    const patch = settingsPatchSchema.parse({ frequency: 'weekly', days_of_week: [4, 1, 4], send_time: '19:45' });
    const db = patchToDbData(patch);
    expect(db).toEqual({ frequency: 1, days_of_week: '1,4', send_time: '19:45:00' });
    const dto = rowToDto({ ...db, is_active: true, last_sent_at: null } as any, 'UTC');
    expect(dto.days_of_week).toEqual([1, 4]);
    expect(dto.send_time).toBe('19:45');
    expect(dto.frequency).toBe('weekly');
  });

  it('daily maps to 7 and reports all days', () => {
    const db = patchToDbData({ frequency: 'daily' });
    expect(db).toEqual({ frequency: 7 });
    const dto = rowToDto({ frequency: 7, days_of_week: '1', send_time: '08:00:00', is_active: true, last_sent_at: null }, 'UTC');
    expect(dto.days_of_week).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('serialises last_sent_at as ISO', () => {
    const d = new Date('2026-10-19T08:00:00Z');
    expect(rowToDto({ frequency: 1, days_of_week: '1', send_time: '08:00:00', is_active: false, last_sent_at: d }, 'UTC').last_sent_at).toBe(
      '2026-10-19T08:00:00.000Z',
    );
  });

  it('validates input', () => {
    expect(settingsPatchSchema.safeParse({ send_time: '25:00' }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ send_time: '8:00' }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ days_of_week: [] }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ days_of_week: [7] }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ frequency: 'monthly' }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ timezone: 'Mars/Olympus' }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ unknown: 1 }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ timezone: 'Asia/Kolkata', is_active: false }).success).toBe(true);
    expect(settingsPatchSchema.safeParse({}).success).toBe(true);
  });

  it('isValidTimezone', () => {
    expect(isValidTimezone('UTC')).toBe(true);
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('nope')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
  });
});

describe('pickDigestBookmarks', () => {
  const now = new Date('2026-10-19T08:00:00Z');
  const day = 24 * 60 * 60 * 1000;
  const mk = (id: string, savedDaysAgo: number, reminderInDays: number | null) => ({
    id,
    saved_at: new Date(now.getTime() - savedDaysAgo * day),
    reminder_at: reminderInDays === null ? null : new Date(now.getTime() + reminderInDays * day),
  });

  it('puts reminders due this week first (soonest first), then oldest saves', () => {
    const picked = pickDigestBookmarks(
      [mk('new', 1, null), mk('old', 30, null), mk('rem3', 2, 3), mk('rem1', 5, 1), mk('far', 40, 20), mk('mid', 10, null), mk('x', 0, null)],
      now,
    );
    expect(picked.map((b) => b.id)).toEqual(['rem1', 'rem3', 'far', 'old', 'mid']);
  });

  it('caps at 5', () => {
    const many = Array.from({ length: 12 }, (_, i) => mk(`b${i}`, i, null));
    expect(pickDigestBookmarks(many, now)).toHaveLength(5);
  });
});
