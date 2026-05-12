'use client';

import { useEffect, useState } from 'react';

/**
 * Detects `prefers-reduced-motion: reduce` and stays in sync if the user
 * toggles it. Use the returned boolean to collapse durations and disable
 * positional offsets in your Framer Motion animations.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
