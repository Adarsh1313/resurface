'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { WaitlistForm } from '@/components/WaitlistForm';
import { GhostBookmarkCards } from './GhostBookmarkCards';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HeroSection() {
  const reduced = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);

  // Parallax — driven by document scroll. Lenis patches window.scrollY, so
  // useScroll() with no options reads the smooth-scrolled value.
  const { scrollY } = useScroll();
  const yGlow = useTransform(scrollY, [0, 500], [0, reduced ? 0 : 30]);
  const yType = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -120]);
  const yCard1 = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -60]);
  const yCard2 = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -100]);
  const yCard3 = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -140]);

  // Scanner — one-shot on mount
  const [scanState, setScanState] = useState<'pre' | 'sweep' | 'fade' | 'done'>('pre');
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(() => setScanState('done'), 0);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setScanState('sweep'), 350);
    const t2 = setTimeout(() => setScanState('fade'), 350 + 700);
    const t3 = setTimeout(() => setScanState('done'), 350 + 700 + 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduced]);

  const staggerBase = reduced ? 0 : 0.1;

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        paddingTop: 60, // clear the fixed nav
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Plane 0 — breathing teal glow */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          y: yGlow,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,212,191,0.10) 0%, transparent 70%)',
          animation: reduced ? 'none' : 'rsGlowBreathe 6s ease-in-out infinite',
        }}
      />

      {/* Plane 1 — background RESURFACE wordmark */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          y: yType,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            font: '300 clamp(120px, 18vw, 240px)/1 var(--font-cormorant), serif',
            color: 'rgba(240,237,232,0.035)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          RESURFACE
        </div>
      </motion.div>

      {/* Plane 2 — ghost bookmark cards */}
      <GhostBookmarkCards yA={yCard1} yB={yCard2} yC={yCard3} />

      {/* Plane 3 — one-shot scanner line */}
      {scanState !== 'done' && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            top: '52%',
            height: 1,
            background: 'var(--rs-teal-400)',
            boxShadow: '0 0 8px 2px rgba(45,212,191,0.4)',
            zIndex: 3,
            transformOrigin: 'left center',
            scaleX: scanState === 'pre' ? 0 : 1,
            opacity: scanState === 'fade' ? 0 : scanState === 'pre' ? 0.9 : 0.9,
            transition:
              scanState === 'sweep'
                ? 'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease 700ms'
                : scanState === 'fade'
                  ? 'opacity 300ms ease'
                  : 'none',
          }}
        />
      )}

      {/* Plane 4 — hero copy + CTA */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 720,
          width: '100%',
        }}
      >
        {/* Announcement pill */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: staggerBase * 1, ease: REVEAL_EASE }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px 4px 4px',
            borderRadius: 'var(--rs-radius-full)',
            background: 'var(--rs-bg-elevated)',
            border: '0.5px solid var(--rs-border-subtle)',
            marginBottom: 28,
          }}
        >
          <span
            style={{
              font: '500 10px/1 var(--font-geist-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--rs-teal-300)',
              background: 'rgba(45,212,191,0.10)',
              padding: '3px 8px',
              borderRadius: 'var(--rs-radius-full)',
            }}
          >
            New
          </span>
          <span style={{ font: '400 12px/1 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
            Now capturing YouTube Shorts →
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: staggerBase * 2, ease: REVEAL_EASE }}
          style={{
            font: '500 clamp(40px, 7vw, 64px)/1.02 var(--font-geist-sans)',
            letterSpacing: '-0.035em',
            color: 'var(--rs-text-primary)',
            margin: 0,
            textWrap: 'balance',
          }}
        >
          Your bookmarks
          <br />
          are a graveyard.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: staggerBase * 3, ease: REVEAL_EASE }}
          style={{
            font: '400 17px/1.55 var(--font-geist-sans)',
            color: 'var(--rs-text-secondary)',
            maxWidth: 500,
            margin: '22px auto 32px',
            textWrap: 'pretty',
          }}
        >
          Resurface captures what you save on X and YouTube, then brings it back at the moment it
          matters — so your intentions don&rsquo;t quietly rot.
        </motion.p>

        {/* CTA — WaitlistForm as-is */}
        <motion.div
          id="waitlist"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: staggerBase * 4, ease: REVEAL_EASE }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            scrollMarginTop: 80,
          }}
        >
          <div data-cursor="pointer">
            <WaitlistForm source="landing-hero" />
          </div>
          <a
            href="#how"
            data-cursor="pointer"
            style={{
              font: '500 13px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-tertiary)',
              textDecoration: 'none',
              transition: 'color 200ms cubic-bezier(0.2,0,0,1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rs-text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rs-text-tertiary)')}
          >
            See how it works ↓
          </a>
        </motion.div>
      </div>
    </section>
  );
}
