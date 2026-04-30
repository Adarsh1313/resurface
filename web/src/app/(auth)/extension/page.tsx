'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

/**
 * Extension bridge page.
 * - If the user is logged in, shows their token + instructions to paste into the extension.
 * - If not, sends them to /login.
 */
export default function ExtensionBridgePage() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    hydrate();
    setToken(localStorage.getItem('token'));
  }, [hydrate]);

  if (token === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading…</div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to connect</h1>
          <p className="text-sm text-gray-500 mb-4">You need to be logged in to pair the extension.</p>
          <Link href="/login" className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Connect Chrome extension</h1>
        <p className="text-sm text-gray-600">
          Signed in as <strong>{user?.email}</strong>. Copy the token below and paste it into the Resurface extension popup to pair it with your account.
        </p>
        <code className="block w-full p-3 bg-gray-50 rounded-lg text-xs text-gray-700 break-all font-mono">
          {token}
        </code>
        <button
          onClick={onCopy}
          className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          {copied ? 'Copied!' : 'Copy token'}
        </button>
        <Link href="/dashboard" className="block text-center text-sm text-gray-500 hover:text-gray-900">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
