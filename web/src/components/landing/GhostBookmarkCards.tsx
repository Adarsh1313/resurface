'use client';

import { motion, type MotionValue } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function GhostBookmarkCards({
  yA,
  yB,
  yC,
}: {
  yA: MotionValue<number> | number;
  yB: MotionValue<number> | number;
  yC: MotionValue<number> | number;
}) {
  const reduced = usePrefersReducedMotion();
  const d = reduced ? 0 : 0.6;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      {/* Card 1 — X thread, Naval (left, rotated -3deg) */}
      <motion.div
        style={{ y: yA, ...cardPos(0) }}
        initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: d, delay: reduced ? 0 : 0.4, ease: REVEAL_EASE }}
      >
        <GhostCard rotate={-3}>
          <XHeader name="Naval Ravikant" handle="@naval · X" />
          <GhostBody>
            &ldquo;Seek wealth, not money or status. Wealth is having assets that earn while you
            sleep…&rdquo;
          </GhostBody>
          <GhostFooter meta="Saved 6 days ago" pill={<NeutralPill>Unread</NeutralPill>} />
        </GhostCard>
      </motion.div>

      {/* Card 2 — YouTube, Y Combinator (centre, rotated +1deg, in front) */}
      <motion.div
        style={{ y: yB, ...cardPos(1) }}
        initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: d, delay: reduced ? 0 : 0.55, ease: REVEAL_EASE }}
      >
        <GhostCard rotate={1} width={240}>
          <YouTubeThumb duration="18:34" />
          <div
            style={{
              font: '500 12px/1.35 var(--font-geist-sans)',
              color: 'var(--rs-text-primary)',
              marginBottom: 4,
            }}
          >
            How to Get Startup Ideas
          </div>
          <div
            style={{
              font: '400 10px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-tertiary)',
              marginBottom: 10,
            }}
          >
            Y Combinator
          </div>
          <GhostFooter meta="Saved 14 days ago" pill={<SnoozePill>Snoozed</SnoozePill>} />
        </GhostCard>
      </motion.div>

      {/* Card 3 — X thread, PG (right, rotated +4deg) */}
      <motion.div
        style={{ y: yC, ...cardPos(2) }}
        initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: d, delay: reduced ? 0 : 0.7, ease: REVEAL_EASE }}
      >
        <GhostCard rotate={4}>
          <XHeader name="Paul Graham" handle="@paulg · X" />
          <GhostBody>
            &ldquo;The most important thing is to be in a position to take advantage of
            opportunities…&rdquo;
          </GhostBody>
          <GhostFooter meta="Saved 23 days ago" pill={<AmberPill>Reminder</AmberPill>} />
        </GhostCard>
      </motion.div>
    </div>
  );
}

// Position the wrapper for each card. The motion.div applies the `y` parallax;
// inner GhostCard handles the rotation via a nested transform so parallax y
// and rotation can coexist.
function cardPos(i: 0 | 1 | 2): React.CSSProperties {
  if (i === 0) return { position: 'absolute', left: '6%', top: '22%' };
  if (i === 1) return { position: 'absolute', left: '50%', top: '10%', marginLeft: -120 };
  return { position: 'absolute', right: '6%', top: '26%' };
}

function GhostCard({
  children,
  rotate,
  width = 230,
}: {
  children: React.ReactNode;
  rotate: number;
  width?: number;
}) {
  return (
    <div
      className="rs-ghost-card"
      style={{
        width,
        background: 'rgba(22,22,20,0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '0.5px solid var(--rs-border-default)',
        borderRadius: 'var(--rs-radius-lg)',
        padding: 14,
        font: '400 11px/1.5 var(--font-geist-sans)',
        color: 'var(--rs-text-secondary)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'center center',
        transition:
          'transform 200ms cubic-bezier(0.34,1.56,0.64,1), border-color 200ms cubic-bezier(0.2,0,0,1)',
        pointerEvents: 'auto',
        cursor: 'default',
      }}
      data-rotate={rotate}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `rotate(${rotate}deg) translateY(-6px)`;
        e.currentTarget.style.borderColor = 'var(--rs-border-focus)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rotate}deg)`;
        e.currentTarget.style.borderColor = 'var(--rs-border-default)';
      }}
    >
      {children}
    </div>
  );
}

function XHeader({ name, handle }: { name: string; handle: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ font: '500 12px/1.1 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>
          {name}
        </div>
        <div style={{ font: '400 10px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)', marginTop: 3 }}>
          {handle}
        </div>
      </div>
    </div>
  );
}

function GhostBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: '400 11px/1.5 var(--font-geist-sans)',
        color: 'var(--rs-text-secondary)',
        margin: '8px 0',
      }}
    >
      {children}
    </div>
  );
}

function GhostFooter({ meta, pill }: { meta: string; pill: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ font: '400 10px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>{meta}</div>
      {pill}
    </div>
  );
}

function YouTubeThumb({ duration }: { duration: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: 72,
        background: 'var(--rs-bg-elevated)',
        borderRadius: 'var(--rs-radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        position: 'relative',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--rs-yt-red)">
        <path d="M23.5 6.2s-.2-1.6-1-2.3c-.9-1-2-1-2.4-1C17.2 2.7 12 2.7 12 2.7s-5.2 0-8.1.2c-.5.1-1.5.1-2.4 1-.7.7-1 2.3-1 2.3S.3 7.9.3 9.6v1.6c0 1.7.2 3.4.2 3.4s.3 1.6 1 2.3c.9 1 2.2.9 2.7 1C5.9 18.1 12 18.1 12 18.1s5.2 0 8.1-.3c.5 0 1.5-.1 2.4-1 .7-.7 1-2.3 1-2.3s.2-1.7.2-3.4V9.6c0-1.7-.2-3.4-.2-3.4z" />
        <polygon points="9.7,14.8 9.7,8.8 16.1,11.8" fill="#0f0f0e" />
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 5,
          right: 5,
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          font: '500 9px/1 var(--font-geist-sans)',
          padding: '2px 4px',
          borderRadius: 3,
        }}
      >
        {duration}
      </div>
    </div>
  );
}

const pillBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 9px',
  borderRadius: 'var(--rs-radius-full)',
  font: '500 10px/1 var(--font-geist-sans)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

function NeutralPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        ...pillBase,
        background: 'var(--rs-bg-elevated)',
        border: '0.5px solid var(--rs-border-subtle)',
        color: 'var(--rs-text-tertiary)',
      }}
    >
      {children}
    </span>
  );
}

function SnoozePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        ...pillBase,
        background: 'var(--rs-snooze-bg)',
        border: '0.5px solid var(--rs-snooze-border)',
        color: 'var(--rs-snooze-text)',
      }}
    >
      {children}
    </span>
  );
}

function AmberPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        ...pillBase,
        background: 'rgba(251,191,36,0.10)',
        border: '0.5px solid rgba(251,191,36,0.22)',
        color: 'var(--rs-amber-200)',
      }}
    >
      {children}
    </span>
  );
}
