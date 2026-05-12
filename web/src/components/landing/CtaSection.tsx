'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { WaitlistForm } from '@/components/WaitlistForm';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function CtaSection() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      style={{
        position: 'relative',
        padding: '120px 24px 140px',
        background: 'var(--rs-bg-base)',
        borderTop: '0.5px solid var(--rs-border-subtle)',
        overflow: 'hidden',
      }}
    >
      <div
        ref={ref}
        style={{
          position: 'relative',
          maxWidth: 1060,
          margin: '0 auto',
          minHeight: 460,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ghost dashboard table — the backdrop content the glass panel blurs */}
        <motion.div
          aria-hidden="true"
          initial={reduced ? false : { opacity: 0 }}
          animate={isInView ? { opacity: 0.22 } : {}}
          transition={{ duration: reduced ? 0 : 1, ease: REVEAL_EASE }}
          style={{
            position: 'absolute',
            inset: 0,
            filter: 'blur(1.5px)',
            pointerEvents: 'none',
          }}
        >
          <GhostDashboard />
        </motion.div>

        {/* Glass form panel */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: reduced ? 0 : 0.7, ease: REVEAL_EASE }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 480,
            background: 'rgba(20,20,18,0.88)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '0.5px solid var(--rs-border-default)',
            borderRadius: 'var(--rs-radius-xl)',
            padding: 'clamp(28px, 4vw, 48px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              font: '500 10px/1 var(--font-geist-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--rs-teal-400)',
              textAlign: 'center',
              marginBottom: 14,
            }}
          >
            Join the Private Beta
          </div>
          <h2
            style={{
              font: '300 italic clamp(28px, 4vw, 40px)/1.15 var(--font-cormorant), serif',
              color: 'var(--rs-text-primary)',
              textAlign: 'center',
              margin: '0 0 12px',
              textWrap: 'balance',
            }}
          >
            Stop saving.
            <br />
            Start doing.
          </h2>
          <p
            style={{
              font: '400 14px/1.6 var(--font-geist-sans)',
              color: 'var(--rs-text-secondary)',
              textAlign: 'center',
              margin: '0 auto 28px',
              maxWidth: 360,
              textWrap: 'pretty',
            }}
          >
            Two minutes to install. Works silently from there. Free while we&rsquo;re in beta.
          </p>

          <div
            data-cursor="pointer"
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}
          >
            <WaitlistForm source="landing-cta" />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Check>Works on Chrome</Check>
            <Check>X &amp; YouTube</Check>
            <Check>No credit card</Check>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'var(--rs-teal-400)', font: '500 11px/1 var(--font-geist-sans)' }}>✓</span>
      <span style={{ font: '400 11px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
        {children}
      </span>
    </span>
  );
}

/**
 * Ghost dashboard table — a faux dashboard rendered as the background content
 * for the glass panel's backdrop-filter. Real DOM, not an image.
 */
function GhostDashboard() {
  const rows = [
    { title: 0.85, plat: 'rgba(255,255,255,0.06)', topic: 'rgba(45,212,191,0.15)', status: 'rgba(255,255,255,0.06)' },
    { title: 0.7, plat: 'rgba(255,64,64,0.20)', topic: 'rgba(251,191,36,0.15)', status: 'rgba(168,138,94,0.15)' },
    { title: 0.6, plat: 'rgba(255,255,255,0.06)', topic: 'rgba(45,212,191,0.15)', status: 'rgba(74,222,128,0.12)' },
    { title: 0.78, plat: 'rgba(255,64,64,0.20)', topic: 'rgba(45,212,191,0.15)', status: 'rgba(255,255,255,0.06)' },
    { title: 0.55, plat: 'rgba(255,255,255,0.06)', topic: 'rgba(251,191,36,0.15)', status: 'rgba(168,138,94,0.15)' },
    { title: 0.9, plat: 'rgba(255,64,64,0.20)', topic: 'rgba(45,212,191,0.15)', status: 'rgba(74,222,128,0.12)' },
    { title: 0.65, plat: 'rgba(255,255,255,0.06)', topic: 'rgba(45,212,191,0.15)', status: 'rgba(255,255,255,0.06)' },
  ];
  const cols = '3fr 1fr 1fr 1fr 1fr';
  const labels = ['Title', 'Platform', 'Topic', 'Date', 'Status'];

  return (
    <div style={{ padding: 32, height: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: 16,
          padding: '10px 0',
          borderBottom: '0.5px solid rgba(255,255,255,0.05)',
          marginBottom: 6,
        }}
      >
        {labels.map((l) => (
          <div
            key={l}
            style={{
              font: '500 9px/1 var(--font-geist-sans)',
              color: 'rgba(240,237,232,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {l}
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: cols,
            gap: 16,
            padding: '12px 0',
            borderBottom: '0.5px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}
        >
          <div
            style={{ height: 8, width: `${r.title * 100}%`, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}
          />
          <div style={{ height: 8, width: 50, background: r.plat, borderRadius: 4 }} />
          <div style={{ height: 8, width: 60, background: r.topic, borderRadius: 4 }} />
          <div style={{ height: 8, width: 50, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
          <div style={{ height: 16, width: 55, background: r.status, borderRadius: 100 }} />
        </div>
      ))}
    </div>
  );
}
