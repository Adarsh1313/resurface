'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Two-layer custom cursor:
 *   • dot — small, follows the mouse sharply
 *   • ring — slightly slower (trailing) and expands on any element
 *            carrying `data-cursor="pointer"`
 *
 * Only renders on pointer:fine devices.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [mounted] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Targets follow the actual mouse position; rendered positions lerp
    // toward the targets every animation frame.
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { x: target.x, y: target.y };
    const ring = { x: target.x, y: target.y };
    let hovering = false;
    let rafId = 0;

    function onMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as Element | null;
      hovering = !!el?.closest?.('[data-cursor="pointer"]');
    }

    function tick() {
      // Dot — quick lerp
      dot.x += (target.x - dot.x) * 0.25;
      dot.y += (target.y - dot.y) * 0.25;
      // Ring — slower lerp for trailing feel
      ring.x += (target.x - ring.x) * 0.12;
      ring.y += (target.y - ring.y) * 0.12;

      const dotEl = dotRef.current;
      const ringEl = ringRef.current;
      if (dotEl) {
        dotEl.style.transform = `translate3d(${dot.x - 3}px, ${dot.y - 3}px, 0)`;
      }
      if (ringEl) {
        const size = hovering ? 32 : 6;
        const offset = size / 2;
        ringEl.style.transform = `translate3d(${ring.x - offset}px, ${ring.y - offset}px, 0)`;
        ringEl.style.width = `${size}px`;
        ringEl.style.height = `${size}px`;
        ringEl.style.opacity = hovering ? '1' : '0';
      }
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--rs-teal-400)',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          border: '1px solid var(--rs-teal-400)',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          transition:
            'width 200ms cubic-bezier(0.34,1.56,0.64,1), height 200ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms ease',
          willChange: 'transform, width, height, opacity',
        }}
      />
    </>
  );
}
