'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Copy,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useTopics, useSendDigest } from '@/lib/hooks';
import { TopicChips, topicColor } from '@/components/TopicChips';

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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="rs-focus-ring"
      style={{
        width: 36,
        height: 20,
        borderRadius: 100,
        background: value ? 'var(--rs-teal-400)' : 'var(--rs-bg-elevated)',
        border: value ? 'none' : '0.5px solid var(--rs-border-default)',
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
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

// ─── Sections ─────────────────────────────────────────────────────

function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  return (
    <>
      <PageHeader title="Profile" body="Shown in the digest greeting and nowhere else." />
      <Row label="Name">
        <div style={{ font: '400 13px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
          {user?.name || '—'}
        </div>
      </Row>
      <Row label="Email" help="Where your digest is sent.">
        <div style={{ font: '400 13px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
          {user?.email || '—'}
        </div>
      </Row>
    </>
  );
}

function DigestSection() {
  const [active, setActive] = useState(true);
  const [freq, setFreq] = useState(1);
  const [days, setDays] = useState<number[]>([1]); // Mon
  const [time, setTime] = useState('8:00am');
  const [savedMsg, setSavedMsg] = useState('');
  const sendDigest = useSendDigest();

  const saveMutation = useMutation({
    mutationFn: () =>
      api.digest.settings({
        frequency: freq === 1 ? 7 : freq === 2 ? 3 : 1,
        send_time: timeToHHMM(time),
        is_active: active,
      }),
    onSuccess: () => {
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 1500);
    },
    onError: (e) => setSavedMsg((e as Error).message),
  });

  const handleSendNow = async () => {
    try {
      const r = await sendDigest.mutateAsync();
      setSavedMsg(`Digest sent — ${r.bookmarks_included} included.`);
    } catch (e) {
      setSavedMsg((e as Error).message);
    }
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <>
      <PageHeader title="Digest" body="Your weekly curated briefing. Five hand-picked saves. Short, terminal." />

      <Row label="Active" help="Turn the digest on or off entirely.">
        <Toggle value={active} onChange={setActive} />
      </Row>

      <Row label="Frequency" help="Up to three times a week.">
        <Segmented
          options={[
            { value: 1, label: '1× / week' },
            { value: 2, label: '2× / week' },
            { value: 3, label: '3× / week' },
          ]}
          value={freq}
          onChange={setFreq}
        />
      </Row>

      <Row label="Days" help="Which days to send.">
        <div style={{ display: 'flex', gap: 4 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
            const on = days.includes(i);
            return (
              <button
                key={i}
                onClick={() =>
                  setDays((cur) => (on ? cur.filter((x) => x !== i) : [...cur, i].slice(0, freq)))
                }
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
                {d}
              </button>
            );
          })}
        </div>
      </Row>

      <Row label="Time" help="Your local timezone.">
        <Segmented
          options={['8:00am', '12:00pm', '6:00pm', '9:00pm'].map((t) => ({ value: t, label: t }))}
          value={time}
          onChange={setTime}
        />
      </Row>

      <div style={{ display: 'flex', gap: 8, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={primaryBtn}>
          {saveMutation.isPending && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
          Save changes
        </button>
        <button onClick={handleSendNow} disabled={sendDigest.isPending} style={secondaryBtn}>
          {sendDigest.isPending ? (
            <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
          ) : (
            <Send style={{ width: 13, height: 13 }} />
          )}
          Send digest now
        </button>
        <button style={secondaryBtn}>
          <Eye style={{ width: 13, height: 13 }} />
          Preview
        </button>
        {savedMsg && (
          <span style={{ font: '400 12px/1 var(--font-geist-sans)', color: 'var(--rs-teal-300)' }}>{savedMsg}</span>
        )}
      </div>
    </>
  );
}

function timeToHHMM(t: string): string {
  // "8:00am" → "08:00", "12:00pm" → "12:00", "9:00pm" → "21:00"
  const m = t.match(/^(\d+):(\d+)(am|pm)$/i);
  if (!m) return '09:00';
  let h = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = m[3].toLowerCase();
  if (ampm === 'pm' && h !== 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${mm}`;
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
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
            onClick={() => onChange(opt.value)}
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

function TopicsSection() {
  const { data } = useTopics();
  const topics = data?.topics || [];
  return (
    <>
      <PageHeader title="Topics" body="Your own folders. Auto-coloured by name." />
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
          topics.map((t) => {
            const c = topicColor(t.name);
            return (
              <div
                key={t.id}
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
                  }}
                />
                <div style={{ font: '500 13px/1 var(--font-geist-sans)', color: 'var(--rs-text-primary)', flex: 1 }}>
                  {t.name}
                </div>
                <span style={{ font: '400 11px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
                  {t.count} saves
                </span>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function ExtensionSection() {
  const [copied, setCopied] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return (
    <>
      <PageHeader title="Extension" body="Pair the Chrome extension with this account." />
      <Row label="Status">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            font: '500 13px/1 var(--font-geist-sans)',
            color: 'var(--rs-green-300)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--rs-green-400)',
              boxShadow: '0 0 8px rgba(74,222,128,0.4)',
            }}
          />
          Token ready · paste into the extension popup
        </div>
      </Row>
      <Row label="Token" help="Don't share this — it's a session bearer.">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <code
            style={{
              display: 'block',
              padding: '10px 12px',
              background: 'var(--rs-bg-elevated)',
              border: '0.5px solid var(--rs-border-subtle)',
              borderRadius: 'var(--rs-radius-md)',
              font: '400 11px/1.5 var(--font-geist-mono), ui-monospace, monospace',
              color: 'var(--rs-text-secondary)',
              wordBreak: 'break-all',
              maxWidth: 480,
            }}
          >
            {token || 'No token'}
          </code>
          <button
            onClick={() => {
              if (!token) return;
              navigator.clipboard.writeText(token);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            style={{ ...secondaryBtn, alignSelf: 'flex-start' }}
          >
            {copied ? (
              <Check style={{ width: 13, height: 13, color: 'var(--rs-teal-400)' }} />
            ) : (
              <Copy style={{ width: 13, height: 13 }} />
            )}
            {copied ? 'Copied' : 'Copy token'}
          </button>
        </div>
      </Row>
    </>
  );
}

function NotificationsSection() {
  const [digestEmail, setDigestEmail] = useState(true);
  const [reminderEmail, setReminderEmail] = useState(true);
  const [chrome, setChrome] = useState(false);
  const [productUpdates, setProductUpdates] = useState(false);
  return (
    <>
      <PageHeader title="Notifications" />
      <Row label="Digest email" help="Weekly or bi-weekly summary.">
        <Toggle value={digestEmail} onChange={setDigestEmail} />
      </Row>
      <Row label="Reminder emails" help="When a reminder time is reached and your browser is closed.">
        <Toggle value={reminderEmail} onChange={setReminderEmail} />
      </Row>
      <Row label="Chrome notifications" help="When your browser is open at reminder time.">
        <Toggle value={chrome} onChange={setChrome} />
      </Row>
      <Row label="Product updates" help="Occasional. Never more than once a month.">
        <Toggle value={productUpdates} onChange={setProductUpdates} />
      </Row>
    </>
  );
}

function AccountSection() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  return (
    <>
      <PageHeader title="Account" />
      <Row label="Export data" help="JSON. Everything you've saved.">
        <button style={secondaryBtn}>Download</button>
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
      <Row label="Delete account" help="Permanent. Data retained for 12 months for recovery.">
        <button style={dangerBtn}>
          <Trash2 style={{ width: 13, height: 13 }} /> Delete account
        </button>
      </Row>
    </>
  );
}

// ─── Page shell ───────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Section>('digest');

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
