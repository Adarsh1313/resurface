'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound, Loader2 } from 'lucide-react';
import { useExtensionToken } from '@/lib/hooks';

const btn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 'var(--rs-radius-md)',
  font: '500 13px/1 var(--font-geist-sans)',
  cursor: 'pointer',
};

const primaryBtn: React.CSSProperties = {
  ...btn,
  background: 'var(--rs-teal-400)',
  color: 'var(--rs-teal-900)',
  border: 'none',
};

const secondaryBtn: React.CSSProperties = {
  ...btn,
  background: 'var(--rs-bg-elevated)',
  color: 'var(--rs-text-primary)',
  border: '0.5px solid var(--rs-border-default)',
};

function formatExpiry(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Generates a long-lived (~6 month) token for the Chrome extension and lets the
 * user copy it. The token is only held in memory — it is shown once.
 */
export function ExtensionTokenPanel() {
  const generate = useExtensionToken();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const token = generate.data?.token;

  const onCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
      <p style={{ margin: 0, font: '400 12px/1.55 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
        Generate a token and paste it into the Resurface extension popup. It lasts about 6 months — when it
        expires, come back here and generate a new one. Treat it like a password.
      </p>

      {!token && (
        <button
          type="button"
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="rs-focus-ring"
          style={{ ...primaryBtn, alignSelf: 'flex-start', opacity: generate.isPending ? 0.7 : 1 }}
        >
          {generate.isPending ? (
            <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
          ) : (
            <KeyRound style={{ width: 13, height: 13 }} />
          )}
          Generate extension token
        </button>
      )}

      {generate.isError && (
        <div role="alert" style={{ font: '400 12px/1.45 var(--font-geist-sans)', color: 'var(--rs-red-400)' }}>
          Couldn&apos;t generate a token: {(generate.error as Error).message || 'unknown error'}
        </div>
      )}

      {token && generate.data && (
        <>
          <code
            aria-label="Extension token"
            style={{
              display: 'block',
              padding: '10px 12px',
              background: 'var(--rs-bg-elevated)',
              border: '0.5px solid var(--rs-border-subtle)',
              borderRadius: 'var(--rs-radius-md)',
              font: '400 11px/1.5 var(--font-geist-mono), ui-monospace, monospace',
              color: 'var(--rs-text-secondary)',
              wordBreak: 'break-all',
              userSelect: 'all',
            }}
          >
            {token}
          </code>
          <div style={{ font: '400 12px/1.4 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}>
            Expires {formatExpiry(generate.data.expires_at)}. This is shown only once.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={onCopy} className="rs-focus-ring" style={primaryBtn}>
              {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
              {copied ? 'Copied' : 'Copy token'}
            </button>
            <button
              type="button"
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="rs-focus-ring"
              style={secondaryBtn}
            >
              {generate.isPending && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
              Generate another
            </button>
            {copyError && (
              <span style={{ font: '400 12px/1 var(--font-geist-sans)', color: 'var(--rs-red-400)' }}>
                Copy failed — select the token and copy it manually.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
