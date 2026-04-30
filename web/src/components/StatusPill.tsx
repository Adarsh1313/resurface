'use client';

type Status = 'pending' | 'reviewed' | 'snoozed';

const styles: Record<Status, { bg: string; color: string; border: string }> = {
  pending: {
    bg: 'rgba(251,191,36,0.10)',
    color: 'var(--rs-amber-200)',
    border: '0.5px solid rgba(251,191,36,0.22)',
  },
  reviewed: {
    bg: 'rgba(74,222,128,0.10)',
    color: 'var(--rs-green-300)',
    border: '0.5px solid rgba(74,222,128,0.22)',
  },
  snoozed: {
    bg: 'var(--rs-snooze-bg)',
    color: 'var(--rs-snooze-text)',
    border: '0.5px solid var(--rs-snooze-border)',
  },
};

export function StatusPill({ status, size = 'sm' }: { status: Status; size?: 'xs' | 'sm' }) {
  const s = styles[status] || styles.pending;
  const fontSize = size === 'xs' ? 10 : 11;
  const padY = size === 'xs' ? 2 : 3;
  const padX = size === 'xs' ? 7 : 8;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        font: `500 ${fontSize}px/1 var(--font-geist-sans), sans-serif`,
        textTransform: 'capitalize',
        padding: `${padY}px ${padX}px`,
        borderRadius: 'var(--rs-radius-full)',
        background: s.bg,
        color: s.color,
        border: s.border,
      }}
    >
      {status}
    </span>
  );
}
