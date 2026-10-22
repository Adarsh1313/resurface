'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LogOut,
  Loader2,
  Check,
  User as UserIcon,
  Mail,
  Tag,
  Puzzle,
  Bell,
  Settings as SettingsIcon,
  Send,
  Eye,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';
import { api, apiFetch } from '@/lib/api';
import {
  useTopics,
  useSendDigest,
  useRenameTopic,
  useDeleteTopic,
  useDigestSettings,
  useUpdateDigestSettings,
  usePreferences,
  useUpdatePreferences,
  detectTimezone,
  supportedTimezones,
} from '@/lib/hooks';
import type { DigestFrequency, DigestSettings, NotificationPreferences } from '@/lib/types';
import { topicColor } from '@/components/TopicChips';
import { ExtensionTokenPanel } from '@/components/ExtensionTokenPanel';

type Section = 'profile' | 'digest' | 'topics' | 'extension' | 'notifications' | 'account';

const sections: { id: Section; label: string; icon: React.ComponentType<{ style?: React.CSSProperties }> }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'digest', label: 'Digest', icon: Mail },
  { id: 'topics', label: 'Topics', icon: Tag },
  { id: 'extension', label: 'Extension', icon: Puzzle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account', icon: SettingsIcon },
];

// ─── Shared layout primitives ─────────────────────────────────────

function Row({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: 24,
        alignItems: 'flex-start',
        padding: '18px 0',
        borderBottom: '0.5px solid var(--rs-border-subtle)',
      }}
    >
      <div>
        <div style={{ font: '500 13px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-primary)', marginBottom: 2 }}>
          {label}
        </div>
        {help && (
          <div style={{ font: '400 12px/1.45 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>{help}</div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
  label,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className="rs-focus-ring"
      style={{
        opacity: disabled ? 0.5 : 1,
        width: 36,
        height: 20,
        borderRadius: 100,
        background: value ? 'var(--rs-teal-400)' : 'var(--rs-bg-elevated)',
        border: value ? 'none' : '0.5px solid var(--rs-border-default)',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: value ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: value ? '#042f2e' : 'var(--rs-text-tertiary)',
          transition: 'left 150ms var(--rs-ease-default)',
        }}
      />
    </button>
  );
}

function PageHeader({ title, body }: { title: string; body?: string }) {
  return (
    <>
      <h2
        style={{
          font: '500 20px/1.25 var(--font-geist-sans)',
          letterSpacing: '-0.02em',
          color: 'var(--rs-text-primary)',
          margin: '0 0 6px',
        }}
      >
        {title}
      </h2>
      {body && (
        <p style={{ font: '400 13px/1.55 var(--font-geist-sans)', color: 'var(--rs-text-secondary)', margin: '0 0 28px' }}>
          {body}
        </p>
      )}
    </>
  );
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'var(--rs-teal-400)',
  color: 'var(--rs-teal-900)',
  border: 'none',
  borderRadius: 'var(--rs-radius-md)',
  font: '500 13px/1 var(--font-geist-sans)',
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  background: 'var(--rs-bg-elevated)',
  color: 'var(--rs-text-primary)',
  border: '0.5px solid var(--rs-border-default)',
  borderRadius: 'var(--rs-radius-md)',
  font: '500 13px/1 var(--font-geist-sans)',
  cursor: 'pointer',
};

const dangerBtn: React.CSSProperties = {
  ...secondaryBtn,
  color: 'var(--rs-red-400)',
  borderColor: 'rgba(239,68,68,0.30)',
};

const ghostIconBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  color: 'var(--rs-text-tertiary)',
};

// ─── Sections ─────────────────────────────────────────────────────

function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  const storeLogin = useAuthStore((s) => s.login);
  const token = useAuthStore((s) => s.token);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (name: string) => api.auth.updateProfile({ name }),
    onSuccess: (data) => {
      if (token) {
        storeLogin({ user: data.user, token });
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      setEditing(false);
      setFeedback('Saved');
      setIsError(false);
      setTimeout(() => setFeedback(''), 2000);
    },
    onError: (e) => {
      setFeedback((e as Error).message);
      setIsError(true);
      setTimeout(() => setFeedback(''), 3000);
    },
  });

  const handleEdit = () => {
    setNameInput(user?.name || '');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setNameInput(user?.name || '');
  };

  const handleSave = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    updateMutation.mutate(trimmed);
  };

  return (
    <>
      <PageHeader title="Profile" body="Shown in the digest greeting and nowhere else." />
      <Row label="Name">
        {editing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              style={{
                padding: '6px 10px',
                background: 'var(--rs-bg-elevated)',
                border: '0.5px solid var(--rs-border-default)',
                borderRadius: 'var(--rs-radius-md)',
                font: '400 13px/1.4 var(--font-geist-sans)',
                color: 'var(--rs-text-primary)',
                outline: 'none',
                minWidth: 180,
              }}
            />
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !nameInput.trim()}
              style={primaryBtn}
            >
              {updateMutation.isPending ? (
                <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
              ) : (
                <Check style={{ width: 13, height: 13 }} />
              )}
              Save
            </button>
            <button onClick={handleCancel} style={secondaryBtn}>
              <X style={{ width: 13, height: 13 }} />
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ font: '400 13px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
              {user?.name || '—'}
            </div>
            <button onClick={handleEdit} style={ghostIconBtn} title="Edit name">
              <Pencil style={{ width: 13, height: 13 }} />
            </button>
            {feedback && (
              <span
                style={{
                  font: '400 12px/1 var(--font-geist-sans)',
                  color: isError ? 'var(--rs-red-400)' : 'var(--rs-teal-300)',
                }}
              >
                {feedback}
              </span>
            )}
          </div>
        )}
      </Row>
      <Row label="Email" help="Where your digest is sent.">
        <div style={{ font: '400 13px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
          {user?.email || '—'}
        </div>
      </Row>
    </>
  );
}

// ─── Digest ───────────────────────────────────────────────────────

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
// Displayed Monday-first; values follow the API (0 = Sunday … 6 = Saturday).
const DAY_CHIPS: { value: number; short: string; long: string }[] = [
  { value: 1, short: 'M', long: 'Monday' },
  { value: 2, short: 'T', long: 'Tuesday' },
  { value: 3, short: 'W', long: 'Wednesday' },
  { value: 4, short: 'T', long: 'Thursday' },
  { value: 5, short: 'F', long: 'Friday' },
  { value: 6, short: 'S', long: 'Saturday' },
  { value: 0, short: 'S', long: 'Sunday' },
];

const DEFAULT_DIGEST: DigestSettings = {
  frequency: 'weekly',
  days_of_week: [1],
  send_time: '08:00',
  timezone: 'UTC',
  is_active: true,
  last_sent_at: null,
};

const inputStyle: React.CSSProperties = {
  padding: '7px 10px',
  background: 'var(--rs-bg-elevated)',
  border: '0.5px solid var(--rs-border-default)',
  borderRadius: 'var(--rs-radius-md)',
  font: '400 13px/1.4 var(--font-geist-sans)',
  color: 'var(--rs-text-primary)',
  colorScheme: 'dark',
};

function DigestSection() {
  const { data, isPending, isError, error, refetch } = useDigestSettings();

  if (isPending) {
    return (
      <>
        <PageHeader title="Digest" body="Your curated briefing. Five hand-picked saves. Short, terminal." />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...mutedText }}>
          <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> Loading digest settings…
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Digest" body="Your curated briefing. Five hand-picked saves. Short, terminal." />
      {isError && (
        <div role="alert" style={errorBanner}>
          <span>
            Couldn&apos;t load your digest settings ({(error as Error)?.message || 'unknown error'}). Showing defaults.
          </span>
          <button onClick={() => refetch()} style={{ ...secondaryBtn, padding: '5px 10px' }} className="rs-focus-ring">
            Retry
          </button>
        </div>
      )}
      {/* Keyed so the form re-initialises when server data arrives. */}
      <DigestForm key={data ? 'loaded' : 'defaults'} initial={data ?? DEFAULT_DIGEST} />
    </>
  );
}

function DigestForm({ initial }: { initial: DigestSettings }) {
  const browserTz = useMemo(() => detectTimezone(), []);
  const timezones = useMemo(() => supportedTimezones(browserTz), [browserTz]);
  // A stored 'UTC' is the server default — treat it as "not chosen yet" and suggest the browser zone.
  const tzWasDefaulted = initial.timezone === 'UTC' && browserTz !== 'UTC';

  const [active, setActive] = useState(initial.is_active);
  const [frequency, setFrequency] = useState<DigestFrequency>(initial.frequency);
  const [days, setDays] = useState<number[]>(
    initial.frequency === 'weekly' && initial.days_of_week.length ? initial.days_of_week : [1]
  );
  const [time, setTime] = useState(initial.send_time || '08:00');
  const [timezone, setTimezone] = useState(tzWasDefaulted ? browserTz : initial.timezone);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const update = useUpdateDigestSettings();
  const sendDigest = useSendDigest();
  const preview = useMutation({ mutationFn: () => api.digest.preview() });

  const flash = (kind: 'ok' | 'error', text: string, ms = 2500) => {
    setStatus({ kind, text });
    setTimeout(() => setStatus(null), ms);
  };

  const handleSave = () => {
    if (frequency === 'weekly' && days.length === 0) {
      flash('error', 'Pick at least one day.');
      return;
    }
    update.mutate(
      {
        is_active: active,
        frequency,
        days_of_week: frequency === 'daily' ? ALL_DAYS : [...days].sort((a, b) => a - b),
        send_time: time,
        timezone,
      },
      {
        onSuccess: () => flash('ok', 'Saved'),
        onError: (e) => flash('error', (e as Error).message || 'Save failed', 4000),
      }
    );
  };

  const handleSendNow = async () => {
    try {
      const r = await sendDigest.mutateAsync();
      flash('ok', r.message || `Digest sent — ${r.bookmarks_included} included.`, 3500);
    } catch (e) {
      flash('error', (e as Error).message || 'Send failed', 4000);
    }
  };

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <>
      <Row label="Active" help="Turn the digest on or off entirely.">
        <Toggle value={active} onChange={setActive} label="Digest active" />
      </Row>

      <Row label="Frequency" help="Every day, or only on the days you pick.">
        <Segmented
          label="Digest frequency"
          options={[
            { value: 'daily' as DigestFrequency, label: 'Daily' },
            { value: 'weekly' as DigestFrequency, label: 'Weekly' },
          ]}
          value={frequency}
          onChange={setFrequency}
        />
      </Row>

      {frequency === 'weekly' && (
        <Row label="Days" help="Which days to send.">
          <div role="group" aria-label="Digest days" style={{ display: 'flex', gap: 4 }}>
            {DAY_CHIPS.map((d) => {
              const on = days.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  aria-pressed={on}
                  aria-label={d.long}
                  title={d.long}
                  className="rs-focus-ring"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: on ? '0 6px 6px 0' : 6,
                    background: on ? 'rgba(45,212,191,0.07)' : 'var(--rs-bg-elevated)',
                    border: '0.5px solid var(--rs-border-subtle)',
                    borderLeft: on ? '2px solid var(--rs-teal-400)' : '0.5px solid var(--rs-border-subtle)',
                    font: '500 11px/1 var(--font-geist-sans)',
                    color: on ? 'var(--rs-teal-300)' : 'var(--rs-text-tertiary)',
                    cursor: 'pointer',
                  }}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </Row>
      )}

      <Row label="Send time" help="In the timezone below.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="time"
            aria-label="Send time"
            value={time}
            onChange={(e) => e.target.value && setTime(e.target.value)}
            className="rs-focus-ring"
            style={inputStyle}
          />
          <span style={mutedText}>{friendlyTime(time)}</span>
        </div>
      </Row>

      <Row
        label="Timezone"
        help={tzWasDefaulted && timezone === browserTz ? 'Detected from your browser — save to keep it.' : undefined}
      >
        <select
          aria-label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="rs-focus-ring"
          style={{ ...inputStyle, maxWidth: 320, width: '100%' }}
        >
          {(timezones.includes(timezone) ? timezones : [timezone, ...timezones]).map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </Row>

      {initial.last_sent_at && (
        <Row label="Last sent">
          <div style={{ font: '400 13px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
            {new Date(initial.last_sent_at).toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        </Row>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={handleSave} disabled={update.isPending} style={primaryBtn} className="rs-focus-ring">
          {update.isPending && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
          Save changes
        </button>
        <button onClick={handleSendNow} disabled={sendDigest.isPending} style={secondaryBtn} className="rs-focus-ring">
          {sendDigest.isPending ? (
            <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
          ) : (
            <Send style={{ width: 13, height: 13 }} />
          )}
          Send digest now
        </button>
        <button onClick={() => preview.mutate()} disabled={preview.isPending} style={secondaryBtn} className="rs-focus-ring">
          {preview.isPending ? (
            <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
          ) : (
            <Eye style={{ width: 13, height: 13 }} />
          )}
          Preview
        </button>
        {status && (
          <span
            role="status"
            style={{
              font: '400 12px/1 var(--font-geist-sans)',
              color: status.kind === 'ok' ? 'var(--rs-teal-300)' : 'var(--rs-red-400)',
            }}
          >
            {status.text}
          </span>
        )}
      </div>

      {(preview.data || preview.isError) && (
        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            background: 'var(--rs-bg-elevated)',
            border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 'var(--rs-radius-md)',
          }}
        >
          {preview.isError ? (
            <div style={{ font: '400 12px/1.5 var(--font-geist-sans)', color: 'var(--rs-red-400)' }}>
              {(preview.error as Error).message || 'Preview failed'}
            </div>
          ) : preview.data && preview.data.bookmarks.length === 0 ? (
            <div style={mutedText}>Nothing to send yet — your next digest would be empty.</div>
          ) : (
            <>
              <div className="rs-micro" style={{ marginBottom: 8 }}>
                Next digest
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {preview.data?.bookmarks.map((b) => (
                  <li key={b.id} style={{ font: '400 13px/1.45 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
                    {b.title || b.url}
                    {b.author && <span style={{ color: 'var(--rs-text-tertiary)' }}> · {b.author}</span>}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </>
  );
}

const mutedText: React.CSSProperties = {
  font: '400 12px/1.4 var(--font-geist-sans)',
  color: 'var(--rs-text-tertiary)',
};

const errorBanner: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 12px',
  marginBottom: 12,
  background: 'rgba(239,68,68,0.08)',
  border: '0.5px solid rgba(239,68,68,0.30)',
  borderRadius: 'var(--rs-radius-md)',
  font: '400 12px/1.45 var(--font-geist-sans)',
  color: 'var(--rs-red-300)',
};

function friendlyTime(hhmm: string): string {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  const h = parseInt(m[1], 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 2,
        background: 'var(--rs-bg-elevated)',
        border: '0.5px solid var(--rs-border-subtle)',
        borderRadius: 8,
      }}
    >
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(opt.value)}
            className="rs-focus-ring"
            style={{
              padding: '6px 14px',
              background: on ? 'var(--rs-bg-hover)' : 'transparent',
              border: 'none',
              borderLeft: on ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
              borderRadius: on ? '0 6px 6px 0' : 6,
              font: '500 12px/1 var(--font-geist-sans)',
              color: on ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TopicRow({ topic }: { topic: { id: string; name: string; color: string; count: number } }) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(topic.name);
  const renameMutation = useRenameTopic();
  const deleteMutation = useDeleteTopic();
  const c = topicColor(topic.name);

  const handleSave = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === topic.name) {
      setEditing(false);
      return;
    }
    renameMutation.mutate(
      { id: topic.id, name: trimmed },
      { onSuccess: () => setEditing(false), onError: () => setEditing(false) }
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete topic "${topic.name}"? This won't delete the bookmarks.`)) return;
    deleteMutation.mutate(topic.id);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 6,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: c.color,
          flexShrink: 0,
        }}
      />
      {editing ? (
        <>
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setNameInput(topic.name);
                setEditing(false);
              }
            }}
            style={{
              flex: 1,
              padding: '4px 8px',
              background: 'var(--rs-bg-elevated)',
              border: '0.5px solid var(--rs-border-default)',
              borderRadius: 'var(--rs-radius-md)',
              font: '500 13px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-primary)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSave}
            disabled={renameMutation.isPending}
            style={{ ...ghostIconBtn, color: 'var(--rs-teal-400)' }}
            title="Save"
          >
            {renameMutation.isPending ? (
              <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
            ) : (
              <Check style={{ width: 13, height: 13 }} />
            )}
          </button>
          <button
            onClick={() => { setNameInput(topic.name); setEditing(false); }}
            style={ghostIconBtn}
            title="Cancel"
          >
            <X style={{ width: 13, height: 13 }} />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => { setNameInput(topic.name); setEditing(true); }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: 0,
              font: '500 13px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-primary)',
              cursor: 'text',
              textAlign: 'left',
            }}
            title="Click to rename"
          >
            {topic.name}
          </button>
          <span style={{ font: '400 11px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
            {topic.count} saves
          </span>
          <button onClick={handleDelete} disabled={deleteMutation.isPending} style={ghostIconBtn} title="Delete topic">
            {deleteMutation.isPending ? (
              <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
            ) : (
              <Trash2 style={{ width: 13, height: 13 }} />
            )}
          </button>
        </>
      )}
    </div>
  );
}

function TopicsSection() {
  const { data } = useTopics();
  const topics = data?.topics || [];
  return (
    <>
      <PageHeader title="Topics" body="Your own folders. Auto-coloured by name. Click a name to rename." />
      <div
        style={{
          background: 'var(--rs-bg-surface)',
          border: '0.5px solid var(--rs-border-subtle)',
          borderRadius: 'var(--rs-radius-lg)',
          padding: 4,
        }}
      >
        {topics.length === 0 ? (
          <div
            style={{ padding: '24px 14px', font: '400 13px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}
          >
            No topics yet &mdash; they&apos;ll appear here as you tag your saves.
          </div>
        ) : (
          topics.map((t) => <TopicRow key={t.id} topic={t} />)
        )}
      </div>
    </>
  );
}

function ExtensionSection() {
  return (
    <>
      <PageHeader title="Extension" body="Pair the Chrome extension with this account." />
      <Row label="Install" help="Not on the Chrome Web Store yet.">
        <ol
          style={{
            margin: 0,
            paddingLeft: 18,
            font: '400 12px/1.6 var(--font-geist-sans)',
            color: 'var(--rs-text-secondary)',
          }}
        >
          <li>
            Build it: <code style={inlineCode}>cd extension &amp;&amp; npm install &amp;&amp; npm run build</code>
          </li>
          <li>
            Open <code style={inlineCode}>chrome://extensions</code> and turn on Developer mode.
          </li>
          <li>
            Click <strong style={{ color: 'var(--rs-text-primary)', fontWeight: 500 }}>Load unpacked</strong> and pick the{' '}
            <code style={inlineCode}>extension</code> folder.
          </li>
        </ol>
      </Row>
      <Row label="Token" help="Pastes into the extension popup. Valid for about 6 months.">
        <ExtensionTokenPanel />
      </Row>
    </>
  );
}

const inlineCode: React.CSSProperties = {
  font: '400 11px/1.4 var(--font-geist-mono), ui-monospace, monospace',
  padding: '1px 5px',
  background: 'var(--rs-bg-elevated)',
  border: '0.5px solid var(--rs-border-subtle)',
  borderRadius: 4,
  color: 'var(--rs-text-primary)',
};

const NOTIFICATION_ROWS: { key: keyof NotificationPreferences; label: string; help: string }[] = [
  { key: 'digest_email', label: 'Digest email', help: 'Your scheduled digest of saves.' },
  { key: 'reminder_email', label: 'Reminder emails', help: 'When a reminder time is reached and your browser is closed.' },
  { key: 'browser_notifications', label: 'Chrome notifications', help: 'When your browser is open at reminder time.' },
  { key: 'product_updates', label: 'Product updates', help: 'Occasional. Never more than once a month.' },
];

function NotificationsSection() {
  const { data, isPending, isError, error, refetch } = usePreferences();
  const update = useUpdatePreferences();
  const [saveError, setSaveError] = useState('');

  const onToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setSaveError('');
    update.mutate(
      { [key]: value },
      {
        onError: (e) => {
          setSaveError((e as Error).message || 'Could not save');
          setTimeout(() => setSaveError(''), 4000);
        },
      }
    );
  };

  return (
    <>
      <PageHeader title="Notifications" body="Changes save as you toggle." />
      {isError && (
        <div role="alert" style={errorBanner}>
          <span>Couldn&apos;t load notification preferences ({(error as Error)?.message || 'unknown error'}).</span>
          <button onClick={() => refetch()} style={{ ...secondaryBtn, padding: '5px 10px' }} className="rs-focus-ring">
            Retry
          </button>
        </div>
      )}
      {saveError && (
        <div role="alert" style={errorBanner}>
          <span>Couldn&apos;t save: {saveError}. Your change was reverted.</span>
        </div>
      )}
      {NOTIFICATION_ROWS.map((row) => (
        <Row key={row.key} label={row.label} help={row.help}>
          <Toggle
            label={row.label}
            value={data?.[row.key] ?? false}
            disabled={isPending || isError}
            onChange={(v) => onToggle(row.key, v)}
          />
        </Row>
      ))}
    </>
  );
}

function AccountSection() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = await apiFetch<unknown>('/bookmarks?limit=1000');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resurface-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? This is permanent.')) return;
    setDeleteLoading(true);
    try {
      await api.auth.deleteAccount();
      logout();
      router.push('/login');
    } catch (e) {
      alert((e as Error).message || 'Delete failed');
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Account" />
      <Row label="Export data" help="JSON. Everything you've saved.">
        <button onClick={handleExport} disabled={exportLoading} style={secondaryBtn}>
          {exportLoading && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
          Download
        </button>
      </Row>
      <Row label="Log out">
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          style={secondaryBtn}
        >
          <LogOut style={{ width: 13, height: 13 }} /> Log out
        </button>
      </Row>
      <Row label="Delete account" help="Permanent. Removes your account and all saves.">
        <button onClick={handleDelete} disabled={deleteLoading} style={dangerBtn}>
          {deleteLoading ? (
            <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
          ) : (
            <Trash2 style={{ width: 13, height: 13 }} />
          )}
          Delete account
        </button>
      </Row>
    </>
  );
}

// ─── Page shell ───────────────────────────────────────────────────

const validSections = new Set<Section>(['profile', 'digest', 'topics', 'extension', 'notifications', 'account']);

function SettingsPageInner() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<Section>(() => {
    const section = searchParams.get('section');
    return section && validSections.has(section as Section) ? (section as Section) : 'digest';
  });

  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--rs-bg-surface)',
        border: '0.5px solid var(--rs-border-subtle)',
        borderRadius: 'var(--rs-radius-lg)',
        overflow: 'hidden',
        minHeight: 600,
      }}
    >
      <div
        style={{
          width: 200,
          padding: '24px 14px',
          borderRight: '0.5px solid var(--rs-border-subtle)',
        }}
      >
        <div className="rs-micro" style={{ padding: '0 10px 8px' }}>
          Settings
        </div>
        {sections.map((s) => {
          const isActive = active === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="rs-focus-ring"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                height: 32,
                padding: isActive ? '0 10px 0 8px' : '0 10px',
                background: isActive ? 'rgba(45,212,191,0.07)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
                border: 'none',
                borderRadius: isActive ? '0 6px 6px 0' : 6,
                color: isActive ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
                font: '500 13px/1 var(--font-geist-sans)',
                cursor: 'pointer',
                marginBottom: 2,
                textAlign: 'left',
              }}
            >
              <Icon
                style={{
                  width: 14,
                  height: 14,
                  color: isActive ? 'var(--rs-teal-400)' : 'var(--rs-text-tertiary)',
                }}
              />
              {s.label}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, padding: '32px 40px', maxWidth: 760 }}>
        {active === 'profile' && <ProfileSection />}
        {active === 'digest' && <DigestSection />}
        {active === 'topics' && <TopicsSection />}
        {active === 'extension' && <ExtensionSection />}
        {active === 'notifications' && <NotificationsSection />}
        {active === 'account' && <AccountSection />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: 'var(--rs-text-tertiary)', font: '400 13px/1 var(--font-geist-sans)' }}>Loading…</div>}>
      <SettingsPageInner />
    </Suspense>
  );
}
