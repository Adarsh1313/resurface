import { z } from 'zod';

/**
 * Pure (DB-free) digest scheduling + settings mapping.
 *
 * DB storage (digest_settings):
 *   frequency    Int    1 = weekly, 7 = daily (i.e. "sends per week")
 *   days_of_week String comma-separated 0..6 (0 = Sunday), e.g. "1,4"
 *   send_time    String "HH:MM:SS" in the user's local time
 * Timezone lives on users.timezone.
 */

export type DigestFrequency = 'daily' | 'weekly';

export interface DigestSettingsDto {
  frequency: DigestFrequency;
  days_of_week: number[];
  send_time: string; // 'HH:MM'
  timezone: string;
  is_active: boolean;
  last_sent_at: string | null;
}

export interface DigestSettingRow {
  frequency: number;
  days_of_week: string;
  send_time: string;
  is_active: boolean;
  last_sent_at: Date | null;
}

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const DEFAULT_DIGEST_ROW: Omit<DigestSettingRow, 'last_sent_at'> = {
  frequency: 1,
  days_of_week: '1',
  send_time: '08:00:00',
  is_active: true,
};

export function isValidTimezone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function safeTimezone(tz: string | null | undefined): string {
  return tz && isValidTimezone(tz) ? tz : 'UTC';
}

export function parseDays(raw: string): number[] {
  const days = raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  return [...new Set(days)].sort((a, b) => a - b);
}

export function serializeDays(days: number[]): string {
  return [...new Set(days)].sort((a, b) => a - b).join(',');
}

/** "08:00:00" | "8:00" -> "08:00" */
export function toHHMM(raw: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(raw || '');
  if (!m) return '08:00';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

export function frequencyFromDb(n: number): DigestFrequency {
  return n >= 7 ? 'daily' : 'weekly';
}

export function frequencyToDb(f: DigestFrequency): number {
  return f === 'daily' ? 7 : 1;
}

export function rowToDto(row: DigestSettingRow | null, timezone: string): DigestSettingsDto {
  const r = row ?? { ...DEFAULT_DIGEST_ROW, last_sent_at: null };
  const frequency = frequencyFromDb(r.frequency);
  const days = parseDays(r.days_of_week);
  return {
    frequency,
    days_of_week: frequency === 'daily' ? [...ALL_DAYS] : days.length ? days : [1],
    send_time: toHHMM(r.send_time),
    timezone: safeTimezone(timezone),
    is_active: r.is_active,
    last_sent_at: r.last_sent_at ? r.last_sent_at.toISOString() : null,
  };
}

export const settingsPatchSchema = z
  .object({
    frequency: z.enum(['daily', 'weekly']),
    days_of_week: z
      .array(z.number().int().min(0).max(6))
      .min(1, 'Pick at least one day')
      .max(7),
    send_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM (24h)'),
    timezone: z.string().min(1).max(64).refine(isValidTimezone, 'Invalid IANA timezone'),
    is_active: z.boolean(),
  })
  .partial()
  .strict();

export type SettingsPatch = z.infer<typeof settingsPatchSchema>;

/** Convert a validated patch into DB column updates (excluding timezone). */
export function patchToDbData(patch: SettingsPatch): Partial<Omit<DigestSettingRow, 'last_sent_at'>> {
  const data: Partial<Omit<DigestSettingRow, 'last_sent_at'>> = {};
  if (patch.frequency !== undefined) data.frequency = frequencyToDb(patch.frequency);
  if (patch.days_of_week !== undefined) data.days_of_week = serializeDays(patch.days_of_week);
  if (patch.send_time !== undefined) data.send_time = `${patch.send_time}:00`;
  if (patch.is_active !== undefined) data.is_active = patch.is_active;
  return data;
}

// ─── Due-ness ──────────────────────────────────────────────────────────────

export interface LocalParts {
  date: string; // 'YYYY-MM-DD'
  weekday: number; // 0 = Sunday
  minutes: number; // minutes since local midnight
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function localParts(at: Date, timezone: string): LocalParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimezone(timezone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(at)) parts[p.type] = p.value;
  const hour = Number(parts.hour) % 24;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: WEEKDAYS[parts.weekday] ?? 0,
    minutes: hour * 60 + Number(parts.minute),
  };
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = toHHMM(hhmm).split(':').map(Number);
  return h * 60 + m;
}

export interface DueInput {
  now: Date;
  timezone: string;
  frequency: DigestFrequency;
  days_of_week: number[];
  send_time: string; // 'HH:MM' or 'HH:MM:SS'
  is_active: boolean;
  last_sent_at: Date | null;
}

/**
 * A digest is due when, in the user's timezone: it's a scheduled day, the
 * local time is at/after send_time, and nothing has been sent yet on that
 * local date. A missed slot (server asleep) is caught up later the same day.
 */
export function isDigestDue(input: DueInput): boolean {
  if (!input.is_active) return false;
  const tz = safeTimezone(input.timezone);
  const local = localParts(input.now, tz);
  const days = input.frequency === 'daily' ? ALL_DAYS : input.days_of_week;
  if (!days.includes(local.weekday)) return false;
  if (local.minutes < hhmmToMinutes(input.send_time)) return false;
  if (input.last_sent_at) {
    if (input.last_sent_at.getTime() > input.now.getTime()) return false;
    if (localParts(input.last_sent_at, tz).date === local.date) return false;
  }
  return true;
}
