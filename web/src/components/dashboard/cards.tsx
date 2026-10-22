'use client';

import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import type { Insights, DigestSettings } from '@/lib/insights';
import {
  WEEKDAY_NAMES,
  durationClock,
  durationWords,
  hourLabel,
  nextDigestAt,
  useMarkReviewed,
  useRescue,
  useSendDigestNow,
} from '@/lib/insights';
import s from './dashboard.module.css';

const TEAL = '#2dd4bf';
const AMBER = '#fbbf24';
const CREAM = '#f0ede8';
const YT = '#ff4040';
const TRACK = 'rgba(255,255,255,0.07)';

function CardArrow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={`${s.arrow} rs-focus-ring`} aria-label={label} title={label}>
      <ArrowUpRight size={15} />
    </Link>
  );
}

function Ring({ size, r, stroke, pct, color }: { size: number; r: number; stroke: number; pct: number; color: string }) {
  const c = 2 * Math.PI * r;
  const half = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={half} cy={half} r={r} fill="none" stroke={TRACK} strokeWidth={stroke} />
      {pct > 0 && (
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(Math.min(pct, 100) / 100) * c} ${c}`}
          transform={`rotate(-90 ${half} ${half})`}
        />
      )}
    </svg>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────

export function Hero({ name, data }: { name: string; data: Insights }) {
  const { totals, status_share: share } = data;
  const diff = totals.reviewed_this_week - totals.reviewed_last_week;
  const subtitle =
    totals.all === 0
      ? 'Nothing saved yet. Bookmark something on X or YouTube and it lands here.'
      : `You rescued ${totals.reviewed_this_week} save${totals.reviewed_this_week === 1 ? '' : 's'} this week${
          diff === 0 ? ' — same as last week.' : ` — ${Math.abs(diff)} ${diff > 0 ? 'more' : 'fewer'} than last week.`
        }`;
  const segs = [
    { key: 'reviewed', label: 'Reviewed', value: share.reviewed, cls: s.barRev },
    { key: 'pending', label: 'Pending', value: share.pending, cls: s.barPen },
    { key: 'snoozed', label: 'Snoozed', value: share.snoozed, cls: s.barSnz },
    { key: 'trashed', label: 'Trashed', value: share.trashed, cls: s.barTrs },
  ];

  return (
    <section className={s.hero}>
      <div className={s.heroLeft}>
        <h1 className={s.h1}>
          Hello {name}
          <span>.</span>
        </h1>
        <p className={s.sub}>{subtitle}</p>
        {totals.all > 0 && (
          <div className={s.statusbar} role="img" aria-label={segs.map((g) => `${g.label} ${g.value}%`).join(', ')}>
            {segs.map((g) => (
              <div key={g.key} className={s.seg} style={{ flex: Math.max(g.value, 6) }}>
                <label>{g.label}</label>
                <div className={`${s.bar} ${g.cls}`}>{g.value}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={s.numerals}>
        <Numeral icon="▮" value={totals.live} label="Total saves" />
        <Numeral icon="↑" value={totals.reviewed} label="Rescued" />
        <Numeral icon="◆" value={data.streak_weeks} label="Week streak" />
      </div>
    </section>
  );
}

function Numeral({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className={s.num}>
      <div className={s.numRow}>
        <span className={s.numIc} aria-hidden="true">
          {icon}
        </span>
        <b>{value}</b>
      </div>
      <small>{label}</small>
    </div>
  );
}

// ── Rescue rate ─────────────────────────────────────────────────────────

export function RescueCard({ data }: { data: Insights }) {
  const { rescue } = data;
  return (
    <article className={s.card}>
      <h3>Rescue rate</h3>
      <p className={s.hint}>Saves you came back to</p>
      <CardArrow href="/dashboard/reviewed" label="See reviewed saves" />
      <div className={s.ringwrap}>
        <Ring size={150} r={60} stroke={12} pct={rescue.rate} color={TEAL} />
        <div className={s.ringlabel}>
          <b>{rescue.rate}%</b>
          <span>
            {rescue.reviewed} of {rescue.total}
          </span>
        </div>
      </div>
      <p className={s.insight}>
        {rescue.median_half_life_days === null ? (
          'Review a save to see how long things sit before you get to them.'
        ) : (
          <>
            Median <em>half-life: {formatDays(rescue.median_half_life_days)}</em> from save to review.
          </>
        )}
      </p>
    </article>
  );
}

function formatDays(d: number) {
  if (d < 1) return `${Math.max(1, Math.round(d * 24))} hours`;
  const r = Math.round(d);
  return `${r} day${r === 1 ? '' : 's'}`;
}

// ── Rhythm ──────────────────────────────────────────────────────────────

export function RhythmCard({ data }: { data: Insights }) {
  const max = Math.max(1, ...data.rhythm.flatMap((d) => [d.saved, d.reviewed]));
  const todayIdx = data.rhythm.findIndex((d) => d.date === todayYmd(data.timezone));
  const h = (v: number) => Math.max(4, (v / max) * 86);
  return (
    <article className={s.card}>
      <h3>Rhythm</h3>
      <p className={s.hint}>Saved vs reviewed this week</p>
      <CardArrow href="/dashboard/saves" label="See all saves" />
      <div className={s.big}>
        {data.totals.saved_this_week} <span>/</span> {data.totals.reviewed_this_week}
      </div>
      <div className={s.bars} role="img" aria-label="Saves and reviews per day this week">
        {data.rhythm.map((d, i) => (
          <div key={d.date} className={`${s.day} ${i === todayIdx ? s.dayToday : ''}`}>
            <div className={s.pair}>
              <i className={s.barSaved} style={{ height: h(d.saved), opacity: d.saved ? 1 : 0.25 }} />
              <i className={s.barReviewed} style={{ height: h(d.reviewed), opacity: d.reviewed ? 1 : 0.25 }} />
            </div>
            <span>{'MTWTFSS'[i]}</span>
          </div>
        ))}
      </div>
      <div className={s.legend}>
        <span>
          <i style={{ background: AMBER }} />
          Saved
        </span>
        <span>
          <i style={{ background: TEAL }} />
          Reviewed
        </span>
      </div>
    </article>
  );
}

function todayYmd(tz: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// ── Backlog debt ────────────────────────────────────────────────────────

export function BacklogCard({ data }: { data: Insights }) {
  const d = data.backlog_debt;
  const size = 160;
  const half = size / 2;
  const r = 58;
  const c = 2 * Math.PI * r;
  // Dial face = 24h; overflow just fills the ring.
  const frac = Math.min(1, d.total_seconds / (24 * 3600));
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const r1 = 74;
    const r2 = i % 5 === 0 ? 66 : 70;
    return (
      <line
        key={i}
        x1={half + Math.cos(a) * r1}
        y1={half + Math.sin(a) * r1}
        x2={half + Math.cos(a) * r2}
        y2={half + Math.sin(a) * r2}
        stroke={`rgba(255,255,255,${i % 5 ? 0.12 : 0.28})`}
        strokeWidth={1.5}
      />
    );
  });
  return (
    <article className={s.card}>
      <h3>Backlog debt</h3>
      <p className={s.hint}>What your unreviewed saves cost to clear</p>
      <CardArrow href="/dashboard/saves" label="See pending saves" />
      <div className={s.dial}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {ticks}
          <circle cx={half} cy={half} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
          {frac > 0 && (
            <circle
              cx={half}
              cy={half}
              r={r}
              fill="none"
              stroke={AMBER}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${c * frac} ${c}`}
              transform={`rotate(-90 ${half} ${half})`}
            />
          )}
        </svg>
        <div className={s.dialCenter}>
          <b>{durationClock(d.total_seconds)}</b>
          <span>hours owed</span>
        </div>
      </div>
      <div className={s.debtSplit}>
        <span>
          <b>{durationWords(d.video_seconds)}</b> video
        </span>
        <span>
          <b>{d.post_count}</b> posts ≈ {durationWords(d.post_seconds)}
        </span>
      </div>
    </article>
  );
}

// ── Digest queue (inverted) ─────────────────────────────────────────────

export function DigestQueueCard({
  data,
  schedule,
  onMessage,
}: {
  data: Insights;
  schedule: DigestSettings | undefined;
  onMessage: (m: string) => void;
}) {
  const review = useMarkReviewed();
  const sendNow = useSendDigestNow();
  const digest = data.digest;
  const next = schedule ? nextDigestAt(schedule) : null;
  const nextPending = digest?.items.find((i) => i.status === 'pending');

  const sendLabel = digest
    ? `Sent ${new Date(digest.sent_at).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}.`
    : 'No digest yet.';

  const handleSend = async () => {
    try {
      const r = await sendNow.mutateAsync();
      onMessage(r.bookmarks_included ? `Digest sent with ${r.bookmarks_included} saves.` : r.message || 'Nothing pending to send.');
    } catch (e) {
      onMessage((e as Error).message || 'Could not send the digest.');
    }
  };

  return (
    <article className={`${s.card} ${s.queue} ${s.row2}`}>
      <div className={s.queueTop}>
        <h3>{schedule?.frequency === 'daily' ? "Today's digest" : "This week's digest"}</h3>
        {digest && (
          <span className={s.queueCount}>
            {digest.done}/{digest.total}
          </span>
        )}
      </div>
      <p className={s.hint}>
        {sendLabel} {digest && digest.done < digest.total ? 'Clear it before the next one.' : digest ? 'All cleared. Nice.' : ''}
      </p>
      {digest ? (
        <>
          <div className={s.progress} aria-hidden="true">
            {digest.items.map((i) => (
              <i key={i.id} className={i.status !== 'pending' ? s.done : ''} />
            ))}
          </div>
          <ul className={s.q}>
            {digest.items.map((i) => {
              const done = i.status !== 'pending';
              return (
                <li key={i.id} className={done ? s.qDone : ''}>
                  <span className={`${s.pf} ${i.platform === 'youtube' ? s.pfYt : s.pfX}`} aria-hidden="true">
                    {i.platform === 'youtube' ? '▶' : '𝕏'}
                  </span>
                  <a className={s.qt} href={i.url} target="_blank" rel="noreferrer">
                    <b>{i.title || i.url}</b>
                    <span>
                      {i.author || (i.platform === 'youtube' ? 'YouTube' : 'X')}
                      {i.duration_seconds ? ` · ${durationWords(i.duration_seconds)}` : ''}
                      {i.status === 'snoozed' ? ' · snoozed' : ''}
                    </span>
                  </a>
                  {done ? (
                    <span className={`${s.chk} ${s.chkOn}`} aria-label="Done">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  ) : (
                    <button
                      className={`${s.chk} rs-focus-ring`}
                      aria-label={`Mark "${i.title || 'this save'}" reviewed`}
                      disabled={review.isPending}
                      onClick={() => review.mutate(i.id)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className={s.queueEmpty}>
          Your digest picks the 5 saves most worth your time. Send one now to see how it looks in your inbox.
        </p>
      )}
      <div className={s.queueFoot}>
        <button
          className={`${s.pillBtn} ${s.pillDark} rs-focus-ring`}
          disabled={!nextPending}
          onClick={() => nextPending && window.open(nextPending.url, '_blank', 'noopener')}
        >
          Review next
        </button>
        <button className={`${s.pillBtn} ${s.pillGhost} rs-focus-ring`} disabled={sendNow.isPending} onClick={handleSend}>
          {sendNow.isPending ? 'Sending…' : 'Send now'}
        </button>
      </div>
      <p className={s.nextSend}>
        {schedule && !schedule.is_active ? (
          <>Digest paused · <Link href="/dashboard/settings?section=digest">turn on</Link></>
        ) : next ? (
          `Next digest · ${next.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}, ${formatSendTime(schedule!.send_time)}`
        ) : (
          <Link href="/dashboard/settings?section=digest" style={{ color: 'inherit' }}>
            Digest schedule
          </Link>
        )}
      </p>
    </article>
  );
}

function formatSendTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

// ── Save clock ──────────────────────────────────────────────────────────

const CLOCK_SHADES = ['rgba(255,255,255,0.06)', 'rgba(251,191,36,0.25)', 'rgba(251,191,36,0.5)', 'rgba(251,191,36,0.78)', AMBER];

export function SaveClockCard({ data }: { data: Insights }) {
  const { grid, peak } = data.save_clock;
  const max = Math.max(1, ...grid.flat());
  const shade = (v: number) => (v === 0 ? CLOCK_SHADES[0] : CLOCK_SHADES[Math.min(4, Math.ceil((v / max) * 4))]);
  const rows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <article className={`${s.card} ${s.span2}`}>
      <h3>Save clock</h3>
      <p className={s.hint}>When you hit bookmark, in your timezone. Brighter = more saves.</p>
      <div className={s.clock} role="img" aria-label="Saves by weekday and time of day">
        <span />
        {Array.from({ length: 12 }, (_, b) => (
          <span key={b} className={s.clockHr}>
            {hourLabel(b * 2).replace('am', 'a').replace('pm', 'p')}
          </span>
        ))}
        {grid.map((row, d) => [
          <span key={`l${d}`} className={s.clockLbl}>
            {rows[d]}
          </span>,
          ...row.map((v, b) => (
            <span key={`${d}-${b}`} className={s.dot} style={{ background: shade(v) }} title={`${rows[d]} ${hourLabel(b * 2)}–${hourLabel((b * 2 + 2) % 24)}: ${v}`} />
          )),
        ])}
      </div>
      <p className={s.insight}>
        {peak ? (
          <>
            You save most on <em>{WEEKDAY_NAMES[peak.weekday]}s, {hourLabel(peak.block * 2)}–{hourLabel((peak.block * 2 + 2) % 24)}</em>
            {isLateNight(peak.block) ? ' — late-night scrolling is where your saves come from.' : '.'}
          </>
        ) : (
          'Save a few things and your pattern shows up here.'
        )}
      </p>
    </article>
  );
}

const isLateNight = (block: number) => block >= 10 || block <= 1;

// ── Platform split ──────────────────────────────────────────────────────

export function PlatformCard({ data }: { data: Insights }) {
  const { x, youtube } = data.platforms;
  const total = x.saved + youtube.saved;
  const r = 58;
  const c = 2 * Math.PI * r;
  const xFrac = total ? x.saved / total : 0;
  const gap = total && x.saved && youtube.saved ? 8 : 0;
  const xPct = Math.round(xFrac * 100);
  let insight = 'Save from X and YouTube to compare.';
  if (x.saved && youtube.saved) {
    const [hi, lo, hiName, loName] =
      youtube.review_rate >= x.review_rate
        ? [youtube.review_rate, x.review_rate, 'YouTube', 'X']
        : [x.review_rate, youtube.review_rate, 'X', 'YouTube'];
    insight =
      lo === 0
        ? `You review ${hiName} saves; ${loName} saves mostly sit.`
        : `You review ${hiName} ${(hi / lo).toFixed(hi / lo >= 2 ? 0 : 1)}× more than ${loName}.`;
  }
  return (
    <article className={s.card}>
      <h3>Platform split</h3>
      <CardArrow href="/dashboard/saves" label="See all saves" />
      <div className={s.donutwrap}>
        <svg width={150} height={150} viewBox="0 0 150 150" aria-hidden="true">
          <circle cx={75} cy={75} r={r} fill="none" stroke={TRACK} strokeWidth={14} />
          {x.saved > 0 && (
            <circle cx={75} cy={75} r={r} fill="none" stroke={CREAM} strokeWidth={14} strokeLinecap="round"
              strokeDasharray={`${Math.max(0, c * xFrac - gap)} ${c}`} transform="rotate(-90 75 75)" />
          )}
          {youtube.saved > 0 && (
            <circle cx={75} cy={75} r={r} fill="none" stroke={YT} strokeWidth={14} strokeLinecap="round"
              strokeDasharray={`${Math.max(0, c * (1 - xFrac) - gap)} ${c}`} strokeDashoffset={-(c * xFrac)}
              transform="rotate(-90 75 75)" />
          )}
        </svg>
        <div className={s.donutCenter}>
          <b>{total}</b>
          <span>saves</span>
        </div>
      </div>
      <div className={s.split}>
        <span>
          <i style={{ background: CREAM }} />
          {xPct}%<small>X</small>
        </span>
        <span>
          <i style={{ background: YT }} />
          {total ? 100 - xPct : 0}%<small>YouTube</small>
        </span>
      </div>
      <p className={s.insight} style={{ textAlign: 'center' }}>
        {insight}
      </p>
    </article>
  );
}

// ── Topic drift ─────────────────────────────────────────────────────────

const SERIES_COLORS = [AMBER, TEAL, '#9b9690'];

export function TopicDriftCard({ data }: { data: Insights }) {
  const { weeks, series } = data.topic_drift;
  const W = 560;
  const H = 140;
  const padL = 26;
  const padB = 20;
  const maxV = Math.max(2, ...series.flatMap((t) => t.counts));
  const top = Math.ceil(maxV / 2) * 2;
  const x = (i: number) => padL + i * ((W - padL - 10) / (weeks.length - 1));
  const y = (v: number) => H - padB - v * ((H - padB - 10) / top);
  const path = (d: number[]) =>
    d
      .map((v, i) => {
        if (i === 0) return `M${x(0)},${y(v)}`;
        const cx = (x(i - 1) + x(i)) / 2;
        return `C${cx},${y(d[i - 1])} ${cx},${y(v)} ${x(i)},${y(v)}`;
      })
      .join(' ');
  const gridLines = [0, top / 2, top];

  let insight = 'Tag a few saves and your interests over time show up here.';
  if (series.length) {
    const lead = series[0];
    const recent = lead.counts.slice(4).reduce((a, b) => a + b, 0);
    const before = lead.counts.slice(0, 4).reduce((a, b) => a + b, 0);
    if (before === 0) insight = `${lead.name} is new for you: ${recent} saves in the last 4 weeks.`;
    else if (recent >= before * 1.5) insight = `${lead.name} saves are up ${(recent / before).toFixed(1)}× versus the month before.`;
    else if (recent <= before * 0.6) insight = `${lead.name} saves have cooled off: ${recent} in the last 4 weeks, ${before} before.`;
    else insight = `${lead.name} is your steady interest: about ${Math.round(recent / 4)} saves a week.`;
  }

  return (
    <article className={`${s.card} ${s.span2}`}>
      <h3>Topic drift</h3>
      <div className={s.tabs}>
        {series.map((t, i) => (
          <span key={t.id}>
            <i style={{ background: SERIES_COLORS[i] }} />
            {t.name}
          </span>
        ))}
      </div>
      <CardArrow href="/dashboard/settings?section=topics" label="Manage topics" />
      {series.length > 0 && (
        <svg className={s.chart} viewBox={`0 0 ${W} ${H + 10}`} width="100%" height={H + 10} role="img"
          aria-label={`Weekly saves for ${series.map((t) => t.name).join(', ')} over the last 8 weeks`}>
          {gridLines.map((v) => (
            <g key={v}>
              <text x={0} y={y(v) + 3}>{v}</text>
              <line x1={padL} x2={W} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.05)" />
            </g>
          ))}
          {weeks.map((w, i) => (
            <text key={w} x={x(i)} y={H + 6} textAnchor="middle">
              {new Date(`${w}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          ))}
          {series.map((t, i) => (
            <path key={t.id} d={path(t.counts)} fill="none" stroke={SERIES_COLORS[i]} strokeWidth={2}
              strokeDasharray={i === 2 ? '4 5' : undefined} />
          ))}
          {series[0] && (
            <circle cx={x(weeks.length - 1)} cy={y(series[0].counts[weeks.length - 1])} r={4} fill={SERIES_COLORS[0]} />
          )}
        </svg>
      )}
      <p className={s.insight}>{insight}</p>
    </article>
  );
}

// ── Graveyard ───────────────────────────────────────────────────────────

export function GraveyardCard({ data, onMessage }: { data: Insights; onMessage: (m: string) => void }) {
  const rescue = useRescue();
  const g = data.graveyard;
  const handleRescue = async () => {
    try {
      const when = await rescue.mutateAsync(g.items.map((i) => i.id));
      onMessage(
        `Reminders set for ${when.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}.`,
      );
    } catch (e) {
      onMessage((e as Error).message || 'Could not set reminders.');
    }
  };
  return (
    <article className={s.card}>
      <h3>Graveyard</h3>
      <p className={s.hint}>
        Untouched for 30+ days · {g.count} save{g.count === 1 ? '' : 's'}
      </p>
      <CardArrow href="/dashboard/saves" label="See pending saves" />
      {g.items.length ? (
        <>
          <ul className={s.list}>
            {g.items.map((i) => (
              <li key={i.id}>
                <span className={`${s.tag} ${i.platform === 'youtube' ? s.tagYt : s.tagX}`}>
                  {i.platform === 'youtube' ? 'YT' : 'X'}
                </span>
                <a className={s.ttl} href={i.url} target="_blank" rel="noreferrer">
                  {i.title || i.url}
                </a>
                <span className={s.age}>{i.age_days}d</span>
              </li>
            ))}
          </ul>
          <button className={`${s.rescue} rs-focus-ring`} disabled={rescue.isPending} onClick={handleRescue}>
            {rescue.isPending ? 'Setting reminders…' : `Rescue ${g.items.length} with a reminder tomorrow`}
          </button>
        </>
      ) : (
        <p className={s.empty}>Nothing has been left behind for a month. Keep it that way.</p>
      )}
    </article>
  );
}

// ── Author loyalty ──────────────────────────────────────────────────────

export function AuthorsCard({ data }: { data: Insights }) {
  return (
    <article className={s.card}>
      <h3>Who you save</h3>
      <p className={s.hint}>Saved vs actually reviewed</p>
      {data.authors.length ? (
        <ul className={s.list}>
          {data.authors.map((a) => (
            <li key={a.author}>
              <span className={s.authorName}>{a.author}</span>
              <span className={s.meter}>
                <span className={s.track}>
                  <i style={{ width: `${Math.round((a.reviewed / a.saved) * 100)}%` }} />
                </span>
                <span className={s.frac}>
                  {a.reviewed}/{a.saved}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.empty}>Authors you save most often will show up here.</p>
      )}
    </article>
  );
}
