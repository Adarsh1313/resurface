'use client';

export function Logo({
  size = 20,
  showWord = true,
  wordSize = 15,
}: {
  size?: number;
  showWord?: boolean;
  wordSize?: number;
}) {
  const w = size * 0.75;
  const h = size;
  const r = w * 0.3;
  const notchW = w * 0.4;
  const notchD = h * 0.25;
  const notchX1 = (w - notchW) / 2;
  const notchX2 = notchX1 + notchW;
  const notchMidX = w / 2;
  const path = [
    `M 0 0`,
    `L ${w - r} 0`,
    `Q ${w} 0 ${w} ${r}`,
    `L ${w} ${h}`,
    `L ${notchX2} ${h}`,
    `L ${notchMidX} ${h - notchD}`,
    `L ${notchX1} ${h}`,
    `L 0 ${h}`,
    `Z`,
  ].join(' ');

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-label="Resurface">
        <path d={path} fill="#2dd4bf" />
        <circle cx={w * 0.32} cy={h * 0.3} r={Math.max(1.2, w * 0.09)} fill="#fbbf24" />
      </svg>
      {showWord && (
        <span
          style={{
            font: `500 ${wordSize}px/1 var(--font-geist-sans), sans-serif`,
            letterSpacing: '-0.025em',
            color: 'var(--rs-text-primary)',
          }}
        >
          Resurface
        </span>
      )}
    </span>
  );
}
