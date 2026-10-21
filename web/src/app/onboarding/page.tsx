'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Mail, Heart, Bookmark, Puzzle, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useUpdateDigestSettings, detectTimezone } from '@/lib/hooks';
import type { DigestFrequency } from '@/lib/types';

const Chrome = Puzzle;

type StepDef = {
  eyebrow: string;
  title: string;
  body: string;
  cta: React.ReactNode;
  visual: React.ReactNode;
};

function InstallVisual() {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div
        style={{
          background: 'var(--rs-bg-elevated)',
          border: '0.5px solid var(--rs-border-subtle)',
          borderRadius: 'var(--rs-radius-lg)',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Chrome style={{ width: 24, height: 24, color: 'var(--rs-teal-400)' }} />
          <div>
            <div style={{ font: '500 13px/1.3 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
              Resurface
            </div>
            <div style={{ font: '400 11px/1.3 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
              Developer build · load unpacked
            </div>
          </div>
        </div>
        <div
          style={{
            font: '400 12px/1.5 var(--font-geist-sans)',
            color: 'var(--rs-text-secondary)',
            marginBottom: 14,
          }}
        >
          Only sends the URL, title, author and thumbnail of things you save. Nothing else from your browsing.
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: '10px 12px',
            background: 'var(--rs-bg-base)',
            border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 'var(--rs-radius-md)',
          }}
        >
          {['activeTab', 'storage', 'notifications'].map((p) => (
            <div
              key={p}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                font: '400 11px/1 var(--font-geist-sans)',
                color: 'var(--rs-text-secondary)',
              }}
            >
              <Check style={{ width: 11, height: 11, color: 'var(--rs-teal-400)' }} />
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveVisual() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 340 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--rs-bg-base)',
          borderRadius: 'var(--rs-radius-md)',
          border: '0.5px solid var(--rs-border-subtle)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--rs-bg-elevated)',
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  font: '500 12px/1 var(--font-geist-sans)',
                  color: 'var(--rs-text-primary)',
                  marginBottom: 4,
                }}
              >
                Hamel Husain
              </div>
              <div style={{ font: '400 11px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
                @HamelHusain · 2h
              </div>
            </div>
          </div>
          <div style={{ font: '400 12px/1.5 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
            The unreasonable effectiveness of writing your LLM eval set by hand before you build anything.
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, color: 'var(--rs-text-tertiary)' }}>
            <Heart style={{ width: 14, height: 14 }} />
            <Bookmark style={{ width: 14, height: 14, color: 'var(--rs-teal-400)' }} />
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          width: 220,
          padding: 12,
          background: 'var(--rs-bg-elevated)',
          border: '0.5px solid var(--rs-border-default)',
          borderRadius: 'var(--rs-radius-xl)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--rs-teal-400)',
              boxShadow: '0 0 8px rgba(45,212,191,0.6)',
            }}
          />
          <div style={{ font: '500 11px/1 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
            Saved to Resurface
          </div>
        </div>
        <div style={{ font: '400 11px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
          The unreasonable effectiveness of writing your LLM eval set…
        </div>
      </div>
    </div>
  );
}

// Monday-first display; values follow the API (0 = Sunday … 6 = Saturday).
const DAY_CHIPS = [
  { value: 1, short: 'M', long: 'Monday' },
  { value: 2, short: 'T', long: 'Tuesday' },
  { value: 3, short: 'W', long: 'Wednesday' },
  { value: 4, short: 'T', long: 'Thursday' },
  { value: 5, short: 'F', long: 'Friday' },
  { value: 6, short: 'S', long: 'Saturday' },
  { value: 0, short: 'S', long: 'Sunday' },
];

const TIME_PRESETS = [
  { value: '08:00', label: '8:00am' },
  { value: '12:00', label: '12:00pm' },
  { value: '18:00', label: '6:00pm' },
  { value: '21:00', label: '9:00pm' },
];

type DigestChoice = {
  frequency: DigestFrequency;
  days: number[];
  time: string;
  timezone: string;
};

const fieldLabel: React.CSSProperties = {
  font: '500 11px/1 var(--font-geist-sans)',
  color: 'var(--rs-text-tertiary)',
  marginBottom: 8,
};

function DigestPicker({ value, onChange }: { value: DigestChoice; onChange: (v: DigestChoice) => void }) {
  const set = (patch: Partial<DigestChoice>) => onChange({ ...value, ...patch });
  const toggleDay = (d: number) =>
    set({ days: value.days.includes(d) ? value.days.filter((x) => x !== d) : [...value.days, d] });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Mail style={{ width: 18, height: 18, color: 'var(--rs-teal-400)' }} />
        <div style={{ font: '500 13px/1 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>Your digest</div>
      </div>

      <div>
        <div style={fieldLabel}>How often</div>
        <div role="radiogroup" aria-label="Digest frequency" style={{ display: 'flex', gap: 6 }}>
          {(['daily', 'weekly'] as DigestFrequency[]).map((f) => {
            const on = value.frequency === f;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set({ frequency: f })}
                className="rs-focus-ring"
                style={choiceStyle(on, { flex: 1 })}
              >
                {f === 'daily' ? 'Daily' : 'Weekly'}
              </button>
            );
          })}
        </div>
      </div>

      {value.frequency === 'weekly' && (
        <div>
          <div style={fieldLabel}>On</div>
          <div role="group" aria-label="Digest days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {DAY_CHIPS.map((d) => {
              const on = value.days.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={on}
                  aria-label={d.long}
                  title={d.long}
                  onClick={() => toggleDay(d.value)}
                  className="rs-focus-ring"
                  style={choiceStyle(on, { height: 32, padding: 0 })}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div style={fieldLabel}>At</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {TIME_PRESETS.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={value.time === t.value}
              onClick={() => set({ time: t.value })}
              className="rs-focus-ring"
              style={choiceStyle(value.time === t.value)}
            >
              {t.label}
            </button>
          ))}
          <input
            type="time"
            aria-label="Custom send time"
            value={value.time}
            onChange={(e) => e.target.value && set({ time: e.target.value })}
            className="rs-focus-ring"
            style={{
              padding: '6px 8px',
              background: 'var(--rs-bg-elevated)',
              border: '0.5px solid var(--rs-border-subtle)',
              borderRadius: 6,
              font: '400 12px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-primary)',
              colorScheme: 'dark',
            }}
          />
        </div>
        <div style={{ marginTop: 10, font: '400 11px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
          In your timezone: {value.timezone.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
}

function choiceStyle(on: boolean, extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    padding: '8px 12px',
    background: on ? 'rgba(45,212,191,0.10)' : 'var(--rs-bg-elevated)',
    border: '0.5px solid var(--rs-border-subtle)',
    borderLeft: on ? '2px solid var(--rs-teal-400)' : '0.5px solid var(--rs-border-subtle)',
    borderRadius: on ? '0 6px 6px 0' : 6,
    font: '500 12px/1 var(--font-geist-sans)',
    color: on ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
    cursor: 'pointer',
    ...extra,
  };
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  font: '500 14px/1 var(--font-geist-sans)',
  padding: '12px 20px',
  borderRadius: 'var(--rs-radius-md)',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
};

const primaryBtn: React.CSSProperties = {
  ...btnBase,
  background: 'var(--rs-teal-400)',
  color: 'var(--rs-teal-900)',
};

const secondaryBtn: React.CSSProperties = {
  ...btnBase,
  background: 'var(--rs-bg-elevated)',
  color: 'var(--rs-text-primary)',
  border: '0.5px solid var(--rs-border-default)',
};

const ghostBtn: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: 'var(--rs-text-secondary)',
};

const ONBOARDING_COMPLETE_KEY = 'resurface:onboarding-complete';

function markOnboardingComplete() {
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, new Date().toISOString());
  } catch {
    // Storage can be unavailable (private mode); finishing onboarding shouldn't depend on it.
  }
}

const DEFAULT_CHOICE: Omit<DigestChoice, 'timezone'> = { frequency: 'weekly', days: [1], time: '08:00' };

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<DigestChoice>(() => ({ ...DEFAULT_CHOICE, timezone: detectTimezone() }));
  const [saveError, setSaveError] = useState('');
  const updateDigest = useUpdateDigestSettings();

  const finish = () => {
    markOnboardingComplete();
    router.push('/dashboard');
  };

  const saveAndFinish = (c: DigestChoice) => {
    if (c.frequency === 'weekly' && c.days.length === 0) {
      setSaveError('Pick at least one day, or switch to daily.');
      return;
    }
    setSaveError('');
    updateDigest.mutate(
      {
        frequency: c.frequency,
        days_of_week: c.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : [...c.days].sort((a, b) => a - b),
        send_time: c.time,
        timezone: c.timezone,
        is_active: true,
      },
      {
        onSuccess: finish,
        onError: (e) => setSaveError((e as Error).message || 'Could not save your digest settings.'),
      }
    );
  };

  const steps: StepDef[] = [
    {
      eyebrow: 'Step 1 of 3',
      title: 'Install the extension.',
      body: 'It runs silently on X and YouTube. It asks for the minimum permissions a Chrome extension can ask for.',
      cta: (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/extension" target="_blank" className="rs-focus-ring" style={primaryBtn}>
            <Chrome style={{ width: 14, height: 14 }} /> Connect extension
          </Link>
          <button type="button" className="rs-focus-ring" style={ghostBtn} onClick={() => setStep(1)}>
            Done, next
          </button>
        </div>
      ),
      visual: <InstallVisual />,
    },
    {
      eyebrow: 'Step 2 of 3',
      title: 'Bookmark something. Anything.',
      body:
        "Save a tweet or a YouTube video like you normally would. We'll take it from there — a small prompt appears in the corner.",
      cta: (
        <button type="button" className="rs-focus-ring" style={secondaryBtn} onClick={() => setStep(2)}>
          I&rsquo;ve saved something
        </button>
      ),
      visual: <SaveVisual />,
    },
    {
      eyebrow: 'Step 3 of 3',
      title: 'Set your digest.',
      body:
        'Five hand-picked saves, delivered by email. Monday morning is the default. You can change when, how often, and whether in Settings.',
      cta: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="rs-focus-ring"
              style={ghostBtn}
              disabled={updateDigest.isPending}
              onClick={() => saveAndFinish({ ...DEFAULT_CHOICE, timezone: choice.timezone })}
            >
              Use defaults
            </button>
            <button
              type="button"
              className="rs-focus-ring"
              style={{ ...primaryBtn, opacity: updateDigest.isPending ? 0.7 : 1 }}
              disabled={updateDigest.isPending}
              onClick={() => saveAndFinish(choice)}
            >
              {updateDigest.isPending && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
              Finish setup
            </button>
          </div>
          {saveError && (
            <div role="alert" style={{ font: '400 13px/1.5 var(--font-geist-sans)', color: 'var(--rs-red-400)' }}>
              {saveError}{' '}
              <button
                type="button"
                onClick={finish}
                className="rs-focus-ring"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  color: 'var(--rs-teal-300)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Continue to dashboard anyway
              </button>
            </div>
          )}
        </div>
      ),
      visual: <DigestPicker value={choice} onChange={setChoice} />,
    },
  ];

  const s = steps[step];

  return (
    <div
      className="rs-grain"
      style={{
        minHeight: '100vh',
        background: 'var(--rs-bg-base)',
        color: 'var(--rs-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 48px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 40,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Logo size={22} wordSize={16} />
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: 3,
                borderRadius: 2,
                background: i <= step ? 'var(--rs-teal-400)' : 'var(--rs-border-subtle)',
                transition: 'background 300ms',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={finish}
          className="rs-focus-ring"
          style={{
            font: '500 12px/1 var(--font-geist-sans)',
            color: 'var(--rs-text-tertiary)',
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
          }}
        >
          Skip setup
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
          maxWidth: 1040,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <div
            className="rs-micro"
            style={{ marginBottom: 14, color: 'var(--rs-teal-400)' }}
          >
            {s.eyebrow}
          </div>
          <h1
            style={{
              font: '500 40px/1.1 var(--font-geist-sans)',
              letterSpacing: '-0.03em',
              margin: '0 0 18px',
              color: 'var(--rs-text-primary)',
            }}
          >
            {s.title}
          </h1>
          <p
            style={{
              font: '400 16px/1.55 var(--font-geist-sans)',
              color: 'var(--rs-text-secondary)',
              maxWidth: 420,
              margin: '0 0 28px',
            }}
          >
            {s.body}
          </p>
          {s.cta}
        </div>
        <div
          style={{
            background: 'var(--rs-bg-surface)',
            border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 'var(--rs-radius-xl)',
            padding: 24,
            minHeight: 380,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {s.visual}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          maxWidth: 1040,
          margin: '24px auto 0',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          style={{ ...ghostBtn, opacity: step === 0 ? 0.4 : 1 }}
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ArrowLeft style={{ width: 12, height: 12 }} /> Back
        </button>
        <button
          style={{ ...secondaryBtn, opacity: step === steps.length - 1 ? 0.4 : 1 }}
          disabled={step === steps.length - 1}
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
        >
          Next <ArrowRight style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  );
}
