'use client';

import type { Topic } from '@/lib/types';

// 12-color palette in dark-mode-friendly translucent fills.
// Each entry: bg, text, border. Auto-assigned by hashing topic name,
// so the same topic always gets the same color across the app.
const PALETTE: { bg: string; color: string; border: string }[] = [
  { bg: 'rgba(45,212,191,0.10)',  color: '#5eead4', border: '0.5px solid rgba(45,212,191,0.22)' },  // teal
  { bg: 'rgba(251,191,36,0.10)',  color: '#fde68a', border: '0.5px solid rgba(251,191,36,0.22)' },  // amber
  { bg: 'rgba(167,139,250,0.10)', color: '#c4b5fd', border: '0.5px solid rgba(167,139,250,0.22)' }, // violet
  { bg: 'rgba(96,165,250,0.10)',  color: '#93c5fd', border: '0.5px solid rgba(96,165,250,0.22)' },  // blue
  { bg: 'rgba(244,114,182,0.10)', color: '#f9a8d4', border: '0.5px solid rgba(244,114,182,0.22)' }, // pink
  { bg: 'rgba(110,231,183,0.10)', color: '#6ee7b7', border: '0.5px solid rgba(110,231,183,0.22)' }, // emerald
  { bg: 'rgba(252,165,165,0.10)', color: '#fca5a5', border: '0.5px solid rgba(252,165,165,0.22)' }, // rose
  { bg: 'rgba(165,180,252,0.10)', color: '#a5b4fc', border: '0.5px solid rgba(165,180,252,0.22)' }, // indigo
  { bg: 'rgba(253,186,116,0.10)', color: '#fdba74', border: '0.5px solid rgba(253,186,116,0.22)' }, // orange
  { bg: 'rgba(125,211,252,0.10)', color: '#7dd3fc', border: '0.5px solid rgba(125,211,252,0.22)' }, // sky
  { bg: 'rgba(212,184,150,0.10)', color: '#d4b896', border: '0.5px solid rgba(212,184,150,0.22)' }, // sand
  { bg: 'rgba(190,242,100,0.10)', color: '#bef264', border: '0.5px solid rgba(190,242,100,0.22)' }, // lime
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function topicColor(name: string) {
  return PALETTE[hashString(name.toLowerCase()) % PALETTE.length];
}

export function TopicChips({ topics, size = 'sm' }: { topics: Topic[]; size?: 'xs' | 'sm' }) {
  if (!topics || topics.length === 0) {
    return (
      <span style={{ color: 'var(--rs-text-tertiary)', font: '400 11px/1 var(--font-geist-sans)' }}>—</span>
    );
  }
  const padY = size === 'xs' ? 2 : 3;
  const padX = size === 'xs' ? 7 : 8;
  const fontSize = size === 'xs' ? 10 : 11;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {topics.map((t) => {
        const c = topicColor(t.name);
        return (
          <span
            key={t.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              font: `500 ${fontSize}px/1 var(--font-geist-sans), sans-serif`,
              padding: `${padY}px ${padX}px`,
              borderRadius: 'var(--rs-radius-full)',
              background: c.bg,
              color: c.color,
              border: c.border,
            }}
          >
            {t.name}
          </span>
        );
      })}
    </div>
  );
}
