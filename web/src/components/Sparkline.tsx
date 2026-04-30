'use client';

export function Sparkline({
  values,
  width = 84,
  height = 28,
  stroke = 'var(--rs-teal-400)',
  fill = 'rgba(45,212,191,0.12)',
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Synthesizes a 7-point series from week totals so the chart looks
// alive until the backend exposes daily counts. Distributes evenly with
// jitter, anchored to current week total.
export function fakeWeekSeries(thisWeek: number, lastWeek: number): number[] {
  const total = Math.max(0, thisWeek);
  const base = total / 7;
  const trend = thisWeek - lastWeek;
  const out: number[] = [];
  for (let i = 0; i < 7; i++) {
    const drift = (i / 6) * (trend / 7);
    const jitter = ((i * 13) % 7) / 10 - 0.3;
    out.push(Math.max(0, base + drift + jitter));
  }
  // Re-scale so the sum is close to thisWeek (visual fidelity).
  const sum = out.reduce((a, b) => a + b, 0) || 1;
  const scale = total / sum;
  return out.map((v) => v * scale);
}
