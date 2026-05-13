'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ProductSection() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <section
      style={{
        background: 'var(--rs-bg-surface)',
        borderTop: '0.5px solid var(--rs-border-subtle)',
        borderBottom: '0.5px solid var(--rs-border-subtle)',
        padding: '96px 0',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: 1060,
          margin: '0 auto',
          padding: '0 48px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 48,
          alignItems: 'center',
        }}
      >
        {/* Left — copy */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: reduced ? 0 : 0.6, ease: REVEAL_EASE }}
        >
          <div
            style={{
              font: '500 10px/1 var(--font-geist-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--rs-teal-400)',
              marginBottom: 16,
            }}
          >
            The Capture Moment
          </div>
          <h2
            style={{
              font: '500 clamp(24px, 3vw, 32px)/1.1 var(--font-geist-sans)',
              letterSpacing: '-0.025em',
              color: 'var(--rs-text-primary)',
              margin: '0 0 18px',
              textWrap: 'balance',
            }}
          >
            The 8-second moment that changes everything.
          </h2>
          <p
            style={{
              font: '400 15px/1.6 var(--font-geist-sans)',
              color: 'var(--rs-text-secondary)',
              margin: '0 0 22px',
              textWrap: 'pretty',
            }}
          >
            You bookmark a thread on X. The extension sees it instantly. A quiet prompt appears —
            bottom-right, never blocking your scroll. Pick a topic. Set a reminder. It disappears
            in 8 seconds.
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Bullet>Works on X (Twitter) and YouTube — no other tabs to open</Bullet>
            <Bullet>Topic is AI-suggested — you just confirm or override</Bullet>
            <Bullet>Reminder is optional — set it and forget the setting</Bullet>
          </ul>
        </motion.div>

        {/* Right — extension prompt over faux X feed */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.15, ease: REVEAL_EASE }}
          style={{
            position: 'relative',
            background: 'var(--rs-bg-base)',
            border: '0.5px solid var(--rs-border-default)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            height: 400,
          }}
          aria-hidden="true"
        >
          <FauxXFeed />
          <ExtensionPrompt />
        </motion.div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--rs-teal-400)',
          flexShrink: 0,
          marginTop: 8,
        }}
        aria-hidden
      />
      <span style={{ font: '400 14px/1.55 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
        {children}
      </span>
    </li>
  );
}

function FauxXFeed() {
  // Five faux tweet rows at low opacity. Pure CSS — no images.
  const rows = Array.from({ length: 5 });
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: 0.28,
        pointerEvents: 'none',
      }}
    >
      {rows.map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            paddingBottom: 12,
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                height: 8,
                width: `${50 + ((i * 13) % 30)}%`,
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 4,
              }}
            />
            <div
              style={{
                height: 6,
                width: `${70 + ((i * 7) % 25)}%`,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 4,
              }}
            />
            <div
              style={{
                height: 6,
                width: `${55 + ((i * 11) % 30)}%`,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ExtensionPrompt() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 260,
        background: 'var(--rs-bg-overlay)',
        border: '0.5px solid var(--rs-border-default)',
        borderRadius: 'var(--rs-radius-xl)',
        padding: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        font: '400 12px/1.5 var(--font-geist-sans)',
        zIndex: 2,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="11" height="15" viewBox="0 0 15 20" fill="none" aria-hidden>
            <path
              d="M0 0 L12.5 0 Q15 0 15 2.5 L15 20 L9.5 20 L7.5 15 L5.5 20 L0 20 Z"
              fill="var(--rs-teal-400)"
            />
            <circle cx="4.8" cy="6" r="1.4" fill="var(--rs-amber-400)" />
          </svg>
          <span style={{ font: '500 11px/1 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
            resurface
          </span>
        </div>
        <span
          style={{
            font: '500 10px/1 var(--font-geist-sans)',
            color: 'var(--rs-teal-400)',
            background: 'rgba(45,212,191,0.08)',
            border: '0.5px solid rgba(45,212,191,0.18)',
            padding: '2px 7px',
            borderRadius: 'var(--rs-radius-full)',
          }}
        >
          8s
        </span>
      </div>

      {/* Captured item */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: 'var(--rs-bg-elevated)',
            borderRadius: 'var(--rs-radius-sm)',
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              font: '500 9px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            Captured from X
          </div>
          <div
            style={{ font: '500 11px/1.35 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}
          >
            Naval Ravikant thread on building wealth
          </div>
        </div>
      </div>

      <PromptLabel>Topic</PromptLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        <Chip active>Finance</Chip>
        <Chip>Business</Chip>
        <Chip>+ Add</Chip>
      </div>

      <PromptLabel>Reminder</PromptLabel>
      <div
        style={{
          background: 'var(--rs-bg-elevated)',
          border: '0.5px solid var(--rs-border-subtle)',
          borderRadius: 'var(--rs-radius-sm)',
          padding: '7px 10px',
          font: '400 11px/1 var(--font-geist-sans)',
          color: 'var(--rs-text-tertiary)',
          marginBottom: 10,
        }}
      >
        No reminder set
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          style={{
            flex: 1,
            background: 'var(--rs-teal-400)',
            color: 'var(--rs-teal-900)',
            border: 'none',
            borderRadius: 'var(--rs-radius-sm)',
            padding: 7,
            font: '500 11px/1 var(--font-geist-sans)',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        <button
          type="button"
          style={{
            background: 'transparent',
            color: 'var(--rs-text-tertiary)',
            border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 'var(--rs-radius-sm)',
            padding: '7px 10px',
            font: '400 11px/1 var(--font-geist-sans)',
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function PromptLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: '500 9px/1 var(--font-geist-sans)',
        color: 'var(--rs-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      style={{
        font: '500 10px/1 var(--font-geist-sans)',
        padding: '3px 8px',
        borderRadius: 'var(--rs-radius-full)',
        background: active ? 'rgba(45,212,191,0.10)' : 'var(--rs-bg-elevated)',
        border: active
          ? '0.5px solid rgba(45,212,191,0.25)'
          : '0.5px solid var(--rs-border-subtle)',
        color: active ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
      }}
    >
      {children}
    </span>
  );
}
