'use client';

import { useSyncExternalStore } from 'react';

/**
 * Detects `prefers-reduced-motion: reduce` and stays in sync if the user
 * toggles it. Use the returned boolean to collapse durations and disable
 * positional offsets in your Framer Motion animations.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

function getServerSnapshot() {
  return false;
}
