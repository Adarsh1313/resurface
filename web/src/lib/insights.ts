'use client';

// Data + mutations for the redesigned dashboard (GET /v1/stats/insights).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';

export interface InsightItem {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  platform: string;
  duration_seconds: number | null;
  saved_at: string;
  status: string;
}

export interface Insights {
  timezone: string;
  totals: {
    all: number;
    live: number;
    reviewed: number;
    pending: number;
    snoozed: number;
    trashed: number;
    saved_this_week: number;
    saved_last_week: number;
    reviewed_this_week: number;
    reviewed_last_week: number;
  };
  status_share: { reviewed: number; pending: number; snoozed: number; trashed: number };
  rescue: { rate: number; reviewed: number; total: number; median_half_life_days: number | null };
  streak_weeks: number;
  rhythm: { date: string; saved: number; reviewed: number }[];
  backlog_debt: {
    video_seconds: number;
    video_count: number;
    post_count: number;
    post_seconds: number;
    total_seconds: number;
  };
  save_clock: { grid: number[][]; peak: { weekday: number; block: number; count: number } | null };
  platforms: Record<'x' | 'youtube', { saved: number; reviewed: number; review_rate: number }>;
  topic_drift: { weeks: string[]; series: { id: string; name: string; color: string; counts: number[] }[] };
  graveyard: { count: number; items: { id: string; url: string; title: string | null; platform: string; age_days: number }[] };
  authors: { author: string; saved: number; reviewed: number }[];
  digest: { sent_at: string; total: number; done: number; items: InsightItem[] } | null;
}

export interface DigestSettings {
  frequency: 'daily' | 'weekly';
  days_of_week: number[]; // 0=Sun..6=Sat
  send_time: string; // HH:MM
  timezone: string;
  is_active: boolean;
  last_sent_at: string | null;
}

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => apiFetch<Insights>('/stats/insights'),
  });
}

// Used only to show "Next digest · …"; the card works without it.
export function useDigestSchedule() {
  return useQuery({
    queryKey: ['digest-settings'],
    queryFn: () => apiFetch<{ settings: DigestSettings }>('/digest/settings'),
    retry: false,
  });
}

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['insights'] });
    qc.invalidateQueries({ queryKey: ['bookmarks'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };
}

export function useMarkReviewed() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/bookmarks/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'reviewed' }) }),
    onSuccess: invalidate,
  });
}

// "Rescue" = put a reminder on each item for tomorrow morning, so the
// reminder email brings them back instead of leaving them to rot.
export function useRescue() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const when = new Date();
      when.setDate(when.getDate() + 1);
      when.setHours(9, 0, 0, 0);
      await Promise.all(
        ids.map((id) =>
          apiFetch(`/bookmarks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ reminder_at: when.toISOString() }),
          }),
        ),
      );
      return when;
    },
    onSuccess: invalidate,
  });
}

export function useSendDigestNow() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ success: boolean; bookmarks_included: number; message?: string }>('/digest/send-now', {
        method: 'POST',
      }),
    onSuccess: invalidate,
  });
}

// ── Formatting helpers ────────────────────────────────────────────────

export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function hourLabel(h: number): string {
  const hh = ((h + 11) % 12) + 1;
  return `${hh}${h < 12 ? 'am' : 'pm'}`;
}

export function durationClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function durationWords(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// Next send time for a digest schedule, as a Date. Interprets send_time in the
// schedule's timezone by scanning the next 8 days in 1-minute-accurate steps.
export function nextDigestAt(s: DigestSettings, now = new Date()): Date | null {
  if (!s.is_active || s.days_of_week.length === 0) return null;
  const [hh, mm] = s.send_time.split(':').map(Number);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: s.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const dayIdx: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  // Walk forward in 15-minute steps; first slot at/after send_time on an allowed day wins.
  const start = new Date(now.getTime() + 60 * 1000);
  start.setSeconds(0, 0);
  for (let t = start.getTime(); t < now.getTime() + 8 * 86400000; t += 15 * 60 * 1000) {
    const parts = fmt.formatToParts(new Date(t));
    const get = (k: string) => parts.find((p) => p.type === k)?.value ?? '';
    const dow = dayIdx[get('weekday')];
    const h = Number(get('hour'));
    const m = Number(get('minute'));
    if (s.days_of_week.includes(dow) && h === hh && m >= mm && m < mm + 15) return new Date(t);
  }
  return null;
}
