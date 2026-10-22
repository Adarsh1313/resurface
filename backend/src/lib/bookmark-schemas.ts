import { z } from 'zod';

// POST /v1/bookmarks — used by the extension at capture time and by
// "Add bookmark" in the dashboard.
export const createBookmarkSchema = z.object({
  url: z.string().url(),
  platform: z.enum(['x', 'youtube']),
  title: z.string().optional(),
  author: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  duration_seconds: z.number().int().optional(),
  topic_names: z.array(z.string()).optional(),
  notes: z.string().optional(),
  // The capture prompt lets you set a reminder; without this field zod
  // silently stripped it and the reminder was never stored.
  reminder_at: z.iso
    .datetime({ offset: true })
    .transform((s) => new Date(s))
    .optional(),
});
