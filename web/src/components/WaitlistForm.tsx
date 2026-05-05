'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

const API_BASE = API_BASE_URL;

export function WaitlistForm({ source = 'landing' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'loading' || !email.trim()) return;
    setState('loading');
    setMessage('');
    try {
      const resp = await fetch(`${API_BASE}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }
      setState('done');
      setMessage("You're in. We'll email you when the extension ships.");
    } catch (err: unknown) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Could not reach the server.');
    }
  }

  if (state === 'done') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          background: 'rgba(45,212,191,0.10)',
          border: '0.5px solid rgba(45,212,191,0.35)',
          borderRadius: 'var(--rs-radius-md)',
          color: 'var(--rs-teal-300)',
          font: '500 14px/1.4 var(--font-geist-sans)',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rs-teal-400)' }} />
        {message}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'stretch',
        background: 'var(--rs-bg-surface)',
        border: '0.5px solid var(--rs-border-default)',
        borderRadius: 'var(--rs-radius-md)',
        padding: 4,
        minWidth: 360,
      }}
    >
      <input
        type="email"
        required
        placeholder="you@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '8px 12px',
          font: '400 14px/1 var(--font-geist-sans)',
          color: 'var(--rs-text-primary)',
        }}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        style={{
          font: '500 13px/1 var(--font-geist-sans)',
          padding: '8px 16px',
          background: 'var(--rs-teal-400)',
          color: 'var(--rs-teal-900)',
          border: 'none',
          borderRadius: 'var(--rs-radius-sm)',
          cursor: state === 'loading' ? 'wait' : 'pointer',
          opacity: state === 'loading' ? 0.7 : 1,
        }}
      >
        {state === 'loading' ? 'Joining…' : 'Join waitlist'}
      </button>
      {state === 'error' && (
        <div
          style={{
            position: 'absolute',
            marginTop: 48,
            font: '400 12px/1.4 var(--font-geist-sans)',
            color: '#f87171',
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
}
