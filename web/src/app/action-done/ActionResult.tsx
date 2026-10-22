'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowRight, Check, Clock, TimerOff } from 'lucide-react';
import { Logo } from '@/components/Logo';

type Result = 'reviewed' | 'snoozed' | 'expired' | 'error';

const COPY: Record<
  Result,
  {
    title: string;
    body: string;
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
    tone: 'teal' | 'amber' | 'red';
  }
> = {
  reviewed: {
    title: 'Marked as reviewed',
    body: 'Nice. That save is off your list and won’t show up in future digests.',
    icon: Check,
    tone: 'teal',
  },
  snoozed: {
    title: 'Snoozed for a day',
    body: 'We’ll bring it back tomorrow. Out of sight until then.',
    icon: Clock,
    tone: 'amber',
  },
  expired: {
    title: 'This link has expired',
    body: 'Email action links only work for a limited time. You can still review or snooze it from your dashboard.',
    icon: TimerOff,
    tone: 'amber',
  },
  error: {
    title: 'Something went wrong',
    body: 'We couldn’t complete that action. Try again from your dashboard.',
    icon: AlertTriangle,
    tone: 'red',
  },
};

const TONES = {
  teal: { fg: 'var(--rs-teal-400)', bg: 'rgba(45,212,191,0.10)', border: 'rgba(45,212,191,0.30)' },
  amber: { fg: 'var(--rs-amber-400)', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.30)' },
  red: { fg: 'var(--rs-red-400)', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)' },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="rs-grain"
      style={{
        minHeight: '100vh',
        background: 'var(--rs-bg-base)',
        color: 'var(--rs-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link href="/" aria-label="Resurface — Home" style={{ textDecoration: 'none' }}>
            <Logo size={22} wordSize={16} />
          </Link>
        </div>
        {children}
      </div>
    </main>
  );
}

export function ActionResultFallback() {
  return (
    <Shell>
      <div style={{ textAlign: 'center', font: '400 13px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
        Loading…
      </div>
    </Shell>
  );
}

export function ActionResult() {
  const params = useSearchParams();
  const raw = params.get('result');
  const result: Result = raw && Object.prototype.hasOwnProperty.call(COPY, raw) ? (raw as Result) : 'error';
  const copy = COPY[result];
  const tone = TONES[copy.tone];
  const Icon = copy.icon;

  return (
    <Shell>
      <div
        style={{
          background: 'var(--rs-bg-surface)',
          border: '0.5px solid var(--rs-border-subtle)',
          borderRadius: 'var(--rs-radius-xl)',
          padding: '32px 28px',
          textAlign: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 44,
            height: 44,
            margin: '0 auto 18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: tone.bg,
            border: `0.5px solid ${tone.border}`,
          }}
        >
          <Icon style={{ width: 20, height: 20, color: tone.fg }} />
        </div>
        <h1
          style={{
            font: '500 22px/1.25 var(--font-geist-sans)',
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
            color: 'var(--rs-text-primary)',
          }}
        >
          {copy.title}
        </h1>
        <p
          style={{
            font: '400 14px/1.55 var(--font-geist-sans)',
            color: 'var(--rs-text-secondary)',
            margin: '0 0 24px',
          }}
        >
          {copy.body}
        </p>
        <Link
          href="/dashboard"
          className="rs-focus-ring"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            background: 'var(--rs-teal-400)',
            color: 'var(--rs-teal-900)',
            borderRadius: 'var(--rs-radius-md)',
            font: '500 13px/1 var(--font-geist-sans)',
            textDecoration: 'none',
          }}
        >
          Open dashboard <ArrowRight style={{ width: 13, height: 13 }} />
        </Link>
      </div>
      <p
        style={{
          textAlign: 'center',
          marginTop: 18,
          font: '400 12px/1.5 var(--font-geist-sans)',
          color: 'var(--rs-text-tertiary)',
        }}
      >
        You can close this tab.
      </p>
    </Shell>
  );
}
