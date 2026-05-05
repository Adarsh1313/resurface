const LOCAL_API_BASE = ['http://localhost:4000', 'v1'].join('/');
const PRODUCTION_API_BASE = 'https://resurface-nclr.onrender.com/v1';

function normalizeApiBase(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, '');
}

function isLocalApiBase(value: string): boolean {
  try {
    const url = new URL(value);
    return url.hostname === 'localhost' && url.pathname === '/v1';
  } catch {
    return false;
  }
}

export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? (() => {
        const configured = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
        return configured && !isLocalApiBase(configured) ? configured : PRODUCTION_API_BASE;
      })()
    : normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE_URL) ?? LOCAL_API_BASE;
