'use client';

export function PlatformPill({ platform, size = 'sm' }: { platform: 'x' | 'youtube'; size?: 'xs' | 'sm' }) {
  const isX = platform === 'x';
  const fontSize = size === 'xs' ? 10 : 11;
  const padY = size === 'xs' ? 2 : 3;
  const padX = size === 'xs' ? 6 : 8;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        font: `600 ${fontSize}px/1 var(--font-geist-sans), sans-serif`,
        letterSpacing: isX ? 0 : '0.02em',
        padding: `${padY}px ${padX}px`,
        borderRadius: 4,
        background: isX ? '#000' : '#ff0000',
        color: '#fff',
      }}
    >
      {isX ? 'X' : 'YouTube'}
    </span>
  );
}
