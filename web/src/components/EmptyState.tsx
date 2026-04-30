'use client';

import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--rs-bg-surface)',
        border: '0.5px solid var(--rs-border-subtle)',
        borderRadius: 'var(--rs-radius-lg)',
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          margin: '0 auto 16px',
          borderRadius: 'var(--rs-radius-full)',
          background: 'var(--rs-bg-elevated)',
          border: '0.5px solid var(--rs-border-subtle)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--rs-text-tertiary)',
        }}
      >
        <Icon style={{ width: 20, height: 20 }} />
      </div>
      <div
        style={{
          font: '500 16px/1.35 var(--font-geist-sans)',
          letterSpacing: '-0.01em',
          color: 'var(--rs-text-primary)',
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {body && (
        <div
          style={{
            font: '400 13px/1.55 var(--font-geist-sans)',
            color: 'var(--rs-text-secondary)',
            maxWidth: 360,
            margin: '0 auto',
          }}
        >
          {body}
        </div>
      )}
      {cta && <div style={{ marginTop: 18 }}>{cta}</div>}
    </div>
  );
}
