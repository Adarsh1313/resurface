'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Mail, Heart, Bookmark, Puzzle } from 'lucide-react';

const Chrome = Puzzle;
import { Logo } from '@/components/Logo';

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
              Chrome Web Store
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
          Reads only the page URL and title when you save. Stores nothing else locally.
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

function DigestVisual() {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Mail style={{ width: 18, height: 18, color: 'var(--rs-teal-400)' }} />
        <div style={{ font: '500 13px/1 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
          Weekly digest
        </div>
        <div
          style={{
            marginLeft: 'auto',
            font: '400 11px/1 var(--font-geist-sans)',
            color: 'var(--rs-text-tertiary)',
          }}
        >
          Mon · 8:00am
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 16 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div
            key={i}
            style={{
              height: 32,
              background: i === 0 ? 'rgba(45,212,191,0.12)' : 'var(--rs-bg-elevated)',
              borderLeft: i === 0 ? '2px solid var(--rs-teal-400)' : '0.5px solid transparent',
              border: i === 0 ? undefined : '0.5px solid var(--rs-border-subtle)',
              borderRadius: i === 0 ? '0 6px 6px 0' : 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: '500 11px/1 var(--font-geist-sans)',
              color: i === 0 ? 'var(--rs-teal-300)' : 'var(--rs-text-tertiary)',
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['8:00am', '12:00pm', '6:00pm', '9:00pm'].map((t, i) => (
          <div
            key={t}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              background: i === 0 ? 'rgba(45,212,191,0.07)' : 'transparent',
              borderLeft: i === 0 ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
              borderRadius: i === 0 ? '0 6px 6px 0' : 6,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: i === 0 ? '3px solid var(--rs-teal-400)' : '1px solid var(--rs-border-strong)',
                background: i === 0 ? 'var(--rs-bg-base)' : 'transparent',
              }}
            />
            <span
              style={{
                font: '400 12px/1 var(--font-geist-sans)',
                color: i === 0 ? 'var(--rs-text-primary)' : 'var(--rs-text-secondary)',
              }}
            >
              {t}
            </span>
            {i === 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  font: '400 10px/1 var(--font-geist-sans)',
                  color: 'var(--rs-text-tertiary)',
                }}
              >
                in your timezone
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps: StepDef[] = [
    {
      eyebrow: 'Step 1 of 3',
      title: 'Install the extension.',
      body: 'It runs silently on X and YouTube. It asks for the minimum permissions a Chrome extension can ask for.',
      cta: (
        <button style={primaryBtn} onClick={() => setStep(1)}>
          <Chrome style={{ width: 14, height: 14 }} /> Add to Chrome
        </button>
      ),
      visual: <InstallVisual />,
    },
    {
      eyebrow: 'Step 2 of 3',
      title: 'Bookmark something. Anything.',
      body:
        "Save a tweet or a YouTube video like you normally would. We'll take it from there — a small prompt appears in the corner.",
      cta: (
        <button style={secondaryBtn} onClick={() => setStep(2)}>
          I&rsquo;ve saved something
        </button>
      ),
      visual: <SaveVisual />,
    },
    {
      eyebrow: 'Step 3 of 3',
      title: 'Set your digest.',
      body:
        'Five hand-picked saves, once a week. Monday morning is the default. You can change when, how often, and whether.',
      cta: (
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn} onClick={() => router.push('/dashboard')}>
            Use defaults
          </button>
          <button style={primaryBtn} onClick={() => router.push('/dashboard')}>
            Finish setup
          </button>
        </div>
      ),
      visual: <DigestVisual />,
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
        <Link
          href="/dashboard"
          style={{
            font: '500 12px/1 var(--font-geist-sans)',
            color: 'var(--rs-text-tertiary)',
            textDecoration: 'none',
          }}
        >
          Skip setup
        </Link>
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
