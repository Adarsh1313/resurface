'use client';

import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Logo } from '@/components/Logo';
import { ExtensionTokenPanel } from '@/components/ExtensionTokenPanel';

/**
 * Extension bridge page.
 * - If the user is logged in, lets them generate a long-lived extension token to paste into the popup.
 * - If not, sends them to /login.
 */
export default function ExtensionBridgePage() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    hydrate();
    startTransition(() => {
      setSignedIn(!!localStorage.getItem('token'));
    });
  }, [hydrate]);

  return (
    <main
      className="rs-grain"
      style={{
        minHeight: '100vh',
        background: 'var(--rs-bg-base)',
        color: 'var(--rs-text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Link href="/" aria-label="Resurface — Home" style={{ textDecoration: 'none' }}>
            <Logo size={22} wordSize={16} />
          </Link>
        </div>

        <div
          style={{
            background: 'var(--rs-bg-surface)',
            border: '0.5px solid var(--rs-border-subtle)',
            borderRadius: 'var(--rs-radius-xl)',
            padding: '28px 28px 24px',
          }}
        >
          {signedIn === null ? (
            <div style={{ font: '400 13px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>Loading…</div>
          ) : !signedIn ? (
            <div style={{ textAlign: 'center' }}>
              <h1 style={titleStyle}>Sign in to connect</h1>
              <p style={bodyStyle}>You need to be logged in to pair the Chrome extension with your account.</p>
              <Link href="/login" className="rs-focus-ring" style={primaryLink}>
                Log in
              </Link>
            </div>
          ) : (
            <>
              <h1 style={titleStyle}>Connect the Chrome extension</h1>
              <p style={bodyStyle}>
                Signed in as <strong style={{ color: 'var(--rs-text-primary)', fontWeight: 500 }}>{user?.email}</strong>.
              </p>

              <ol
                style={{
                  margin: '0 0 20px',
                  paddingLeft: 18,
                  font: '400 13px/1.65 var(--font-geist-sans)',
                  color: 'var(--rs-text-secondary)',
                }}
              >
                <li>
                  Install the extension. It isn&apos;t on the Chrome Web Store yet, so load it unpacked: build it with{' '}
                  <code style={inlineCode}>cd extension &amp;&amp; npm install &amp;&amp; npm run build</code>, open{' '}
                  <code style={inlineCode}>chrome://extensions</code>, enable Developer mode, click{' '}
                  <em>Load unpacked</em> and choose the <code style={inlineCode}>extension</code> folder.
                </li>
                <li>Generate a token below and copy it.</li>
                <li>Open the Resurface extension popup, paste the token, and click Save token.</li>
              </ol>

              <ExtensionTokenPanel />
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              font: '400 13px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-tertiary)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft style={{ width: 12, height: 12 }} /> Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

const titleStyle: React.CSSProperties = {
  font: '500 22px/1.25 var(--font-geist-sans)',
  letterSpacing: '-0.02em',
  margin: '0 0 8px',
  color: 'var(--rs-text-primary)',
};

const bodyStyle: React.CSSProperties = {
  font: '400 14px/1.55 var(--font-geist-sans)',
  color: 'var(--rs-text-secondary)',
  margin: '0 0 20px',
};

const inlineCode: React.CSSProperties = {
  font: '400 11px/1.4 var(--font-geist-mono), ui-monospace, monospace',
  padding: '1px 5px',
  background: 'var(--rs-bg-elevated)',
  border: '0.5px solid var(--rs-border-subtle)',
  borderRadius: 4,
  color: 'var(--rs-text-primary)',
};

const primaryLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 18px',
  background: 'var(--rs-teal-400)',
  color: 'var(--rs-teal-900)',
  borderRadius: 'var(--rs-radius-md)',
  font: '500 13px/1 var(--font-geist-sans)',
  textDecoration: 'none',
};
