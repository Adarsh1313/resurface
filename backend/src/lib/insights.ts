// Pure aggregation for GET /v1/stats/insights. No DB access here so it can be
// unit-tested with plain objects; the route loads rows and passes them in.

export interface InsightBookmark {
  id: string;
  url: string;
  platform: string; // 'x' | 'youtube'
  title: string | null;
  author: string | null;
  status: string; // 'pending' | 'reviewed' | 'snoozed'
  saved_at: Date;
  reviewed_at: Date | null;
  deleted_at: Date | null;
  duration_seconds: number | null;
  topics: { id: string; name: string; color: string }[];
}

export interface InsightDigestLog {
  id: string;
  sent_at: Date;
  bookmark_ids: string; // comma-separated
}

// Reading an X post/thread isn't free either — estimate it so backlog debt is honest.
export const POST_READ_SECONDS = 5 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const GRAVEYARD_DAYS = 30;

interface LocalParts {
  ymd: string; // YYYY-MM-DD in the user's timezone
  weekday: number; // 0=Mon .. 6=Sun
  hour: number; // 0..23
}

const WEEKDAYS: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function safeTimeZone(tz: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

export function localParts(date: Date, timeZone: string): LocalParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: WEEKDAYS[get('weekday')] ?? 0,
    hour: Number(get('hour')) % 24,
  };
}

// Calendar arithmetic on YYYY-MM-DD strings (timezone-free once localised).
function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function weekStart(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  const mondayOffset = (d.getUTCDay() + 6) % 7;
  return addDays(ymd, -mondayOffset);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeInsights(
  all: InsightBookmark[],
  lastDigest: InsightDigestLog | null,
  now: Date,
  timeZoneInput: string,
) {
  const tz = safeTimeZone(timeZoneInput);
  const live = all.filter((b) => !b.deleted_at);
  const trashed = all.length - live.length;
  const reviewed = live.filter((b) => b.status === 'reviewed');
  const pending = live.filter((b) => b.status === 'pending');
  const snoozed = live.filter((b) => b.status === 'snoozed');

  const today = localParts(now, tz).ymd;
  const thisWeek = weekStart(today);
  const lastWeek = addDays(thisWeek, -7);
  const savedYmd = new Map(live.map((b) => [b.id, localParts(b.saved_at, tz).ymd]));
  const reviewedYmd = new Map(
    reviewed.filter((b) => b.reviewed_at).map((b) => [b.id, localParts(b.reviewed_at!, tz).ymd]),
  );

  const inRange = (ymd: string | undefined, from: string, to?: string) =>
    !!ymd && ymd >= from && (to === undefined || ymd < to);

  const saved_this_week = live.filter((b) => inRange(savedYmd.get(b.id), thisWeek)).length;
  const saved_last_week = live.filter((b) => inRange(savedYmd.get(b.id), lastWeek, thisWeek)).length;
  const reviewed_this_week = [...reviewedYmd.values()].filter((d) => d >= thisWeek).length;
  const reviewed_last_week = [...reviewedYmd.values()].filter((d) => d >= lastWeek && d < thisWeek).length;

  // Status share (of everything ever saved, trash included, so it sums to 100).
  const everything = all.length || 1;
  const pct = (n: number) => Math.round((n / everything) * 100);
  const status_share = {
    reviewed: pct(reviewed.length),
    pending: pct(pending.length),
    snoozed: pct(snoozed.length),
    trashed: pct(trashed),
  };

  // Rescue rate + half-life (days from save to review).
  const halfLives = reviewed
    .filter((b) => b.reviewed_at)
    .map((b) => (b.reviewed_at!.getTime() - b.saved_at.getTime()) / DAY_MS)
    .filter((d) => d >= 0);
  const halfLife = median(halfLives);
  const rescue = {
    rate: live.length ? Math.round((reviewed.length / live.length) * 100) : 0,
    reviewed: reviewed.length,
    total: live.length,
    median_half_life_days: halfLife === null ? null : round1(halfLife),
  };

  // Review streak: consecutive weeks with ≥1 review, ending this week
  // (or last week, if nothing has been reviewed yet this week).
  const reviewWeeks = new Set([...reviewedYmd.values()].map(weekStart));
  let streak = 0;
  let cursor = reviewWeeks.has(thisWeek) ? thisWeek : lastWeek;
  while (reviewWeeks.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -7);
  }

  // Rhythm: saved vs reviewed for the current Mon–Sun week.
  const rhythm = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(thisWeek, i);
    return {
      date,
      saved: [...savedYmd.values()].filter((d) => d === date).length,
      reviewed: [...reviewedYmd.values()].filter((d) => d === date).length,
    };
  });

  // Backlog debt: everything not yet reviewed (pending + snoozed).
  const backlog = [...pending, ...snoozed];
  const videoSeconds = backlog
    .filter((b) => b.platform === 'youtube')
    .reduce((sum, b) => sum + (b.duration_seconds ?? 0), 0);
  const postCount = backlog.filter((b) => b.platform === 'x').length;
  const backlog_debt = {
    video_seconds: videoSeconds,
    video_count: backlog.filter((b) => b.platform === 'youtube').length,
    post_count: postCount,
    post_seconds: postCount * POST_READ_SECONDS,
    total_seconds: videoSeconds + postCount * POST_READ_SECONDS,
  };

  // Save clock: 7 weekdays (Mon..Sun) × 12 two-hour blocks, user's local time.
  const save_clock: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
  for (const b of live) {
    const p = localParts(b.saved_at, tz);
    save_clock[p.weekday][Math.floor(p.hour / 2)]++;
  }
  let peak: { weekday: number; block: number; count: number } | null = null;
  save_clock.forEach((row, weekday) =>
    row.forEach((count, block) => {
      if (count > 0 && (!peak || count > peak.count)) peak = { weekday, block, count };
    }),
  );

  // Platform split with per-platform review rate.
  const platformStats = (platform: string) => {
    const items = live.filter((b) => b.platform === platform);
    const done = items.filter((b) => b.status === 'reviewed').length;
    return { saved: items.length, reviewed: done, review_rate: items.length ? Math.round((done / items.length) * 100) : 0 };
  };
  const platforms = { x: platformStats('x'), youtube: platformStats('youtube') };

  // Topic drift: weekly saves for the top 3 topics over the last 8 weeks.
  const driftWeeks = Array.from({ length: 8 }, (_, i) => addDays(thisWeek, -7 * (7 - i)));
  const topicCounts = new Map<string, { id: string; name: string; color: string; total: number; weeks: number[] }>();
  for (const b of live) {
    const wk = weekStart(savedYmd.get(b.id)!);
    const idx = driftWeeks.indexOf(wk);
    for (const t of b.topics) {
      const entry = topicCounts.get(t.id) ?? { id: t.id, name: t.name, color: t.color, total: 0, weeks: Array(8).fill(0) };
      if (idx >= 0) {
        entry.weeks[idx]++;
        entry.total++;
      }
      topicCounts.set(t.id, entry);
    }
  }
  const topic_drift = {
    weeks: driftWeeks,
    series: [...topicCounts.values()]
      .filter((t) => t.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map(({ id, name, color, weeks }) => ({ id, name, color, counts: weeks })),
  };

  // Graveyard: pending saves untouched for 30+ days, oldest first.
  const graveyardAll = pending
    .filter((b) => now.getTime() - b.saved_at.getTime() >= GRAVEYARD_DAYS * DAY_MS)
    .sort((a, b) => a.saved_at.getTime() - b.saved_at.getTime());
  const graveyard = {
    count: graveyardAll.length,
    items: graveyardAll.slice(0, 3).map((b) => ({
      id: b.id,
      url: b.url,
      title: b.title,
      platform: b.platform,
      age_days: Math.floor((now.getTime() - b.saved_at.getTime()) / DAY_MS),
    })),
  };

  // Author loyalty: most-saved authors and how many of their saves were reviewed.
  const authorMap = new Map<string, { author: string; saved: number; reviewed: number }>();
  for (const b of live) {
    if (!b.author) continue;
    const entry = authorMap.get(b.author) ?? { author: b.author, saved: 0, reviewed: 0 };
    entry.saved++;
    if (b.status === 'reviewed') entry.reviewed++;
    authorMap.set(b.author, entry);
  }
  const authors = [...authorMap.values()]
    .sort((a, b) => b.saved - a.saved || a.author.localeCompare(b.author))
    .slice(0, 4);

  // Latest digest and how much of it has been cleared.
  let digest = null;
  if (lastDigest) {
    const ids = lastDigest.bookmark_ids.split(',').filter(Boolean);
    const byId = new Map(all.map((b) => [b.id, b]));
    const items = ids
      .map((id) => byId.get(id))
      .filter((b): b is InsightBookmark => !!b)
      .map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
        author: b.author,
        platform: b.platform,
        duration_seconds: b.duration_seconds,
        saved_at: b.saved_at.toISOString(),
        status: b.deleted_at ? 'trashed' : b.status,
      }));
    digest = {
      sent_at: lastDigest.sent_at.toISOString(),
      total: items.length,
      done: items.filter((i) => i.status !== 'pending').length,
      items,
    };
  }

  return {
    timezone: tz,
    totals: {
      all: all.length,
      live: live.length,
      reviewed: reviewed.length,
      pending: pending.length,
      snoozed: snoozed.length,
      trashed,
      saved_this_week,
      saved_last_week,
      reviewed_this_week,
      reviewed_last_week,
    },
    status_share,
    rescue,
    streak_weeks: streak,
    rhythm,
    backlog_debt,
    save_clock: { grid: save_clock, peak },
    platforms,
    topic_drift,
    graveyard,
    authors,
    digest,
  };
}

export type Insights = ReturnType<typeof computeInsights>;
