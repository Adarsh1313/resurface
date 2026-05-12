'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function StatsSection() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      style={{
        position: 'relative',
        maxWidth: 1060,
        margin: '0 auto',
        padding: '120px 48px 96px',
      }}
    >
      <div
        className="rs-micro"
        style={{ textAlign: 'center', marginBottom: 28, color: 'var(--rs-text-tertiary)' }}
      >
        The Before
      </div>

      <div
        ref={ref}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 56,
        }}
      >
        <StatCard
          target={847}
          inView={isInView}
          delay={0}
          reduced={reduced}
          label="saved tweets you haven&rsquo;t read"
        />
        <StatCard
          target={214}
          suffix="h"
          inView={isInView}
          delay={0.12}
          reduced={reduced}
          label="of Watch Later, mostly untouched"
        />
        <ZeroCard
          inView={isInView}
          delay={0.24}
          reduced={reduced}
          label="reminders from any of it"
        />
      </div>

      {/* Pull-quote with hairline rules */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.4, ease: REVEAL_EASE }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
        }}
      >
        <div style={{ flex: 1, height: '0.5px', background: 'var(--rs-border-subtle)' }} />
        <div
          style={{
            flex: '0 0 auto',
            padding: '0 28px',
            font: '300 italic clamp(16px, 2vw, 22px)/1.4 var(--font-cormorant), serif',
            color: 'var(--rs-text-secondary)',
            textAlign: 'center',
            textWrap: 'balance',
          }}
        >
          &ldquo;Saving something feels like doing something. It isn&rsquo;t.&rdquo;
        </div>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--rs-border-subtle)' }} />
      </motion.div>
    </section>
  );
}

function StatCard({
  target,
  suffix = '',
  label,
  inView,
  delay,
  reduced,
}: {
  target: number;
  suffix?: string;
  label: string;
  inView: boolean;
  delay: number;
  reduced: boolean;
}) {
  const value = useCountUp(target, inView, 1500, reduced);
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay, ease: REVEAL_EASE }}
      style={statCardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--rs-border-default)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--rs-border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          font: '500 clamp(36px, 5vw, 48px)/1 var(--font-geist-sans)',
          letterSpacing: '-0.03em',
          color: 'var(--rs-text-primary)',
          marginBottom: 10,
        }}
      >
        {value}
        {suffix}
      </div>
      <div
        style={{ font: '400 13px/1.5 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </motion.div>
  );
}

function ZeroCard({
  label,
  inView,
  delay,
  reduced,
}: {
  label: string;
  inView: boolean;
  delay: number;
  reduced: boolean;
}) {
  // The "0" appears instantly and flashes from teal-300 → teal-400 over 0.8s.
  const [flashing, setFlashing] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setFlashing(true), reduced ? 0 : 400);
    return () => clearTimeout(t);
  }, [inView, reduced]);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay, ease: REVEAL_EASE }}
      style={statCardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--rs-border-default)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--rs-border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          font: '500 clamp(36px, 5vw, 48px)/1 var(--font-geist-sans)',
          letterSpacing: '-0.03em',
          color: flashing ? 'var(--rs-teal-400)' : 'var(--rs-teal-300)',
          marginBottom: 10,
          transition: 'color 800ms cubic-bezier(0.2,0,0,1)',
        }}
      >
        0
      </div>
      <div style={{ font: '400 13px/1.5 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
        {label}
      </div>
    </motion.div>
  );
}

const statCardStyle: React.CSSProperties = {
  background: 'var(--rs-bg-surface)',
  border: '0.5px solid var(--rs-border-subtle)',
  borderRadius: 'var(--rs-radius-lg)',
  padding: '28px 24px',
  transition:
    'border-color 200ms cubic-bezier(0.2,0,0,1), transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
};

/**
 * rAF-driven count-up — count from 0 to `target` over `durationMs` with an
 * easeOut(0.4) curve. Returns the current integer value.
 */
function useCountUp(target: number, start: boolean, durationMs: number, reduced: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let rafId = 0;
    const t0 = performance.now();
    function tick(now: number) {
      const elapsed = now - t0;
      if (elapsed >= durationMs) {
        setValue(target);
        return;
      }
      const t = elapsed / durationMs;
      const eased = Math.pow(t, 0.4);
      setValue(Math.round(target * eased));
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [start, target, durationMs, reduced]);
  return value;
}
