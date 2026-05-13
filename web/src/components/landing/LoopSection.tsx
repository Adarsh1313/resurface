'use client';

import { useRef } from 'react';
import { Bookmark, LayoutDashboard, RefreshCcw, Zap } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STEPS = [
  { n: '01', icon: Bookmark, title: 'Save', body: 'Bookmark normally on X or YouTube. The extension sees it.' },
  { n: '02', icon: Zap, title: 'Capture', body: 'A quiet 8-second prompt. Pick a topic, set a reminder, or skip.' },
  { n: '03', icon: LayoutDashboard, title: 'Organise', body: 'Everything lands in your dashboard - tagged and filterable.' },
  { n: '04', icon: RefreshCcw, title: 'Resurface', body: 'Five saves come back in your weekly digest. Read. Act. Move on.' },
] as const;

export function LoopSection() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const VB_W = 1000;
  const VB_H = 40;
  const centres = [125, 375, 625, 875];
  const dashPath = `M ${centres[0]} ${VB_H / 2} L ${centres[3]} ${VB_H / 2}`;
  const length = centres[3] - centres[0];

  return (
    <section
      id="how"
      style={{
        maxWidth: 1060,
        margin: '0 auto',
        padding: '96px 48px',
        scrollMarginTop: 80,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
        <h2
          style={{
            flex: 'none',
            font: '500 clamp(28px, 4vw, 40px)/1.1 var(--font-geist-sans)',
            letterSpacing: '-0.025em',
            color: 'var(--rs-text-primary)',
            margin: 0,
            paddingRight: 24,
          }}
        >
          One quiet loop.
        </h2>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--rs-border-subtle)' }} />
      </div>
      <p
        style={{
          font: '400 14px/1.6 var(--font-geist-sans)',
          color: 'var(--rs-text-secondary)',
          margin: '0 0 40px',
          maxWidth: 520,
        }}
      >
        No new habit. No new app to open. The work happens between saves.
      </p>

      <div ref={ref} style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 26,
            width: '100%',
            height: 12,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <motion.path
            d={dashPath}
            stroke="rgba(45,212,191,0.25)"
            strokeWidth={1}
            fill="none"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.4, ease: REVEAL_EASE }}
          />
          {[1, 2, 3].map((i) => {
            const cx = centres[0] + (length * i) / 4;
            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={VB_H / 2}
                r={3}
                fill="var(--rs-teal-400)"
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.6 + i * 0.2, ease: REVEAL_EASE }}
              />
            );
          })}
        </svg>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={reduced ? false : { opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : i * 0.1,
                ease: REVEAL_EASE,
              }}
              data-cursor="pointer"
              className="rs-step-card"
              style={{
                background: 'var(--rs-bg-surface)',
                border: '0.5px solid var(--rs-border-subtle)',
                borderRadius: 'var(--rs-radius-lg)',
                padding: 20,
                cursor: 'default',
                transition:
                  'transform 200ms cubic-bezier(0.34,1.56,0.64,1), border-color 200ms cubic-bezier(0.2,0,0,1), box-shadow 200ms ease',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--rs-radius-sm)',
                  background: 'rgba(45,212,191,0.08)',
                  border: '0.5px solid rgba(45,212,191,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: '500 11px/1 var(--font-geist-sans)',
                  color: 'var(--rs-teal-400)',
                  marginBottom: 14,
                }}
              >
                {s.n}
              </div>
              <s.icon
                aria-hidden
                className="rs-step-icon"
                style={{
                  width: 18,
                  height: 18,
                  display: 'block',
                  marginBottom: 12,
                  color: 'var(--rs-teal-400)',
                  transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
                }}
              />
              <div
                style={{
                  font: '500 14px/1.3 var(--font-geist-sans)',
                  color: 'var(--rs-text-primary)',
                  marginBottom: 6,
                  letterSpacing: '-0.005em',
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  font: '400 12px/1.55 var(--font-geist-sans)',
                  color: 'var(--rs-text-secondary)',
                  textWrap: 'pretty',
                }}
              >
                {s.body}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        :global(.rs-step-card:hover) {
          transform: translateY(-4px);
          border-color: var(--rs-border-focus) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        :global(.rs-step-card:hover .rs-step-icon) {
          transform: scale(1.1);
        }
      `}</style>
    </section>
  );
}
