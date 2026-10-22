import { z } from 'zod';

export interface NotificationPreferences {
  digest_email: boolean;
  reminder_email: boolean;
  browser_notifications: boolean;
  product_updates: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  digest_email: true,
  reminder_email: true,
  browser_notifications: true,
  product_updates: false,
};

export const preferencesPatchSchema = z
  .object({
    digest_email: z.boolean(),
    reminder_email: z.boolean(),
    browser_notifications: z.boolean(),
    product_updates: z.boolean(),
  })
  .partial()
  .strict();

/** Merge whatever is stored in users.preferences (JSON, possibly junk) with defaults. */
export function resolvePreferences(stored: unknown): NotificationPreferences {
  const out = { ...DEFAULT_PREFERENCES };
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    const s = stored as Record<string, unknown>;
    for (const key of Object.keys(DEFAULT_PREFERENCES) as (keyof NotificationPreferences)[]) {
      if (typeof s[key] === 'boolean') out[key] = s[key] as boolean;
    }
  }
  return out;
}
