'use client';

import { useRef } from 'react';
import { Bell, Globe, LayoutDashboard, Mail } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Feature = {
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
  cat: string;
  title: string;
  body: string;
  amber?: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: Globe,
    cat: 'Capture Layer',
    title: 'Chrome Extension',
    body: 'Detects your saves on X and YouTube silently. An 8-second prompt, bottom-right. Never interrupts. Never misses.',
  },
  {
    icon: LayoutDashboard,
    cat: 'Organisation Layer',
    title: 'Web Dashboard',
    body: 'Every save in one place - topic-tagged, platform-filtered, sortable by status. Snoozed, reviewed, pending: all visible at once.',
  },
  {
    icon: Mail,
    cat: 'Action Layer',
    title: 'Weekly Digest Email',
    body: 'Five curated saves land in your inbox every Monday. Not a newsletter - your stuff, resurfaced. Three actions per item.',
  },
  {
    icon: Bell,
    cat: 'Reminder Layer',
    title: 'Smart Reminders',
    body: 'Set a date when you bookmark. A reminder email fires at the right moment. Bridge the intention-action gap.',
    amber: true,
  },
];

export function FeaturesSection() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      style={{
        position: 'relative',
        maxWidth: 1060,
        margin: '0 auto',
        padding: '96px 48px',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(45,212,191,0.025) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
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
            What you get.
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
          Four layers, one quiet loop. Every piece earns its place.
        </p>

        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14,
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              data-cursor="pointer"
              className={f.amber ? 'rs-bento-card rs-bento-amber' : 'rs-bento-card'}
              initial={reduced ? false : { opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : i * 0.1,
                ease: REVEAL_EASE,
              }}
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '0.5px solid var(--rs-border-default)',
                borderRadius: 'var(--rs-radius-xl)',
                padding: 24,
                cursor: 'default',
                transition:
                  'transform 200ms cubic-bezier(0.34,1.56,0.64,1), border-color 200ms cubic-bezier(0.2,0,0,1), box-shadow 200ms ease',
              }}
            >
              <f.icon
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  display: 'block',
                  marginBottom: 14,
                  color: f.amber ? 'var(--rs-amber-400)' : 'var(--rs-teal-400)',
                }}
              />
              <div
                style={{
                  font: '500 10px/1 var(--font-geist-sans)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: f.amber ? 'var(--rs-amber-400)' : 'var(--rs-teal-400)',
                  marginBottom: 8,
                }}
              >
                {f.cat}
              </div>
              <div
                style={{
                  font: '500 16px/1.3 var(--font-geist-sans)',
                  color: 'var(--rs-text-primary)',
                  marginBottom: 8,
                  letterSpacing: '-0.005em',
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  font: '400 13px/1.6 var(--font-geist-sans)',
                  color: 'var(--rs-text-secondary)',
                  textWrap: 'pretty',
                }}
              >
                {f.body}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        :global(.rs-bento-card:hover) {
          transform: translateY(-4px);
          border-color: var(--rs-border-focus) !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }
        :global(.rs-bento-amber:hover) {
          border-color: rgba(251, 191, 36, 0.35) !important;
          box-shadow: 0 12px 32px rgba(251, 191, 36, 0.08), 0 12px 32px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </section>
  );
}
