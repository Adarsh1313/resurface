/** Pure ordering logic for which bookmarks go into a digest. */

export const DIGEST_SIZE = 5;
export const REMINDER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface Selectable {
  id: string;
  reminder_at: Date | null;
  saved_at: Date;
}

/**
 * Reminders due within the next 7 days (or already overdue) first, soonest
 * first; then everything else oldest-saved first. Top `size` items.
 */
export function pickDigestBookmarks<T extends Selectable>(
  candidates: T[],
  now: Date,
  size = DIGEST_SIZE,
): T[] {
  const horizon = now.getTime() + REMINDER_WINDOW_MS;
  const soon = candidates
    .filter((b) => b.reminder_at && b.reminder_at.getTime() <= horizon)
    .sort((a, b) => a.reminder_at!.getTime() - b.reminder_at!.getTime());
  const soonIds = new Set(soon.map((b) => b.id));
  const rest = candidates
    .filter((b) => !soonIds.has(b.id))
    .sort((a, b) => a.saved_at.getTime() - b.saved_at.getTime());
  return [...soon, ...rest].slice(0, size);
}
