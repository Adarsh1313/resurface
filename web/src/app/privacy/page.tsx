import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Privacy Policy · Resurface',
  description: 'What the Resurface web app and Chrome extension collect, why, and how to delete it.',
};

const REPO_URL = 'https://github.com/Adarsh1313/resurface';

const h2: React.CSSProperties = {
  font: '500 17px/1.3 var(--font-geist-sans)',
  letterSpacing: '-0.01em',
  color: 'var(--rs-text-primary)',
  margin: '36px 0 10px',
};

const p: React.CSSProperties = {
  font: '400 14px/1.7 var(--font-geist-sans)',
  color: 'var(--rs-text-secondary)',
  margin: '0 0 12px',
};

const ul: React.CSSProperties = {
  ...p,
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const strong: React.CSSProperties = { color: 'var(--rs-text-primary)', fontWeight: 500 };

const link: React.CSSProperties = { color: 'var(--rs-teal-300)', textDecoration: 'underline', textUnderlineOffset: 3 };

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--rs-bg-base)',
        color: 'var(--rs-text-primary)',
        padding: '40px 16px 80px',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/" aria-label="Resurface — Home" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <Logo size={20} wordSize={15} />
        </Link>

        <div className="rs-micro" style={{ marginTop: 48, marginBottom: 12, color: 'var(--rs-teal-400)' }}>
          Last updated October 2026
        </div>
        <h1
          style={{
            font: '500 34px/1.15 var(--font-geist-sans)',
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
          }}
        >
          Privacy Policy
        </h1>
        <p style={p}>
          Resurface helps you come back to the posts and videos you save on X and YouTube. This page explains,
          in plain terms, what the Resurface web app and Chrome extension collect, why, and what control you
          have over it. The short version: we only store what you explicitly save, we use it only to run
          Resurface for you, and we never sell or share it.
        </p>

        <h2 style={h2}>What the Chrome extension collects</h2>
        <p style={p}>
          The extension runs only on <span style={strong}>x.com / twitter.com</span> and{' '}
          <span style={strong}>youtube.com</span>. When — and only when — you bookmark or save an item there, it
          sends the following about <em>that item</em> to your Resurface account:
        </p>
        <ul style={ul}>
          <li>the item&apos;s URL</li>
          <li>its title or text snippet</li>
          <li>the author or channel name</li>
          <li>a thumbnail image URL, if there is one</li>
          <li>any topics or notes you add yourself</li>
        </ul>
        <p style={p}>
          It does <span style={strong}>not</span> read or record your browsing history, the other pages you visit,
          what you type, your cookies, or anything from sites other than X and YouTube. Your sign-in token for the
          extension is kept in the browser&apos;s local extension storage on your device.
        </p>

        <h2 style={h2}>What the web app stores</h2>
        <ul style={ul}>
          <li>
            <span style={strong}>Account details:</span> your name, email address, and a hashed (never plain-text)
            password.
          </li>
          <li>
            <span style={strong}>Your saves:</span> the items above, plus their status (unread, reviewed, snoozed),
            reminder times, topics, and notes.
          </li>
          <li>
            <span style={strong}>Your settings:</span> digest schedule and timezone, and notification preferences.
          </li>
        </ul>
        <p style={p}>All of this is stored in your Resurface account and is visible only to you.</p>

        <h2 style={h2}>How it&apos;s used</h2>
        <p style={p}>Your data is used only to provide Resurface to you:</p>
        <ul style={ul}>
          <li>to show your saves on your dashboard;</li>
          <li>to send the digest and reminder emails you&apos;ve turned on;</li>
          <li>to show Chrome notifications for reminders, if you&apos;ve enabled them;</li>
          <li>to send account emails such as password resets.</li>
        </ul>
        <p style={p}>
          Emails are delivered through <span style={strong}>Resend</span>, our email provider, which receives your
          email address and the contents of the email in order to deliver it. Beyond the infrastructure providers
          that host the app and its database, no third party receives your data.
        </p>

        <h2 style={h2}>What we don&apos;t do</h2>
        <ul style={ul}>
          <li>We don&apos;t sell, rent, or share your data with anyone.</li>
          <li>We don&apos;t show ads.</li>
          <li>We don&apos;t use third-party analytics or tracking scripts in the app or the extension.</li>
          <li>We don&apos;t use your saves to train AI models. Topic suggestions are computed on our own server.</li>
        </ul>

        <h2 style={h2}>Your controls</h2>
        <ul style={ul}>
          <li>
            <span style={strong}>Export:</span> download everything you&apos;ve saved as JSON from{' '}
            <Link href="/dashboard/settings?section=account" style={link}>
              Settings → Account
            </Link>
            .
          </li>
          <li>
            <span style={strong}>Delete:</span> delete your account from the same page. This permanently removes
            your account and everything saved in it. You can also delete individual saves at any time.
          </li>
          <li>
            <span style={strong}>Emails:</span> turn the digest, reminder emails, and product updates on or off in{' '}
            <Link href="/dashboard/settings?section=notifications" style={link}>
              Settings → Notifications
            </Link>
            .
          </li>
          <li>
            <span style={strong}>Extension:</span> removing the extension from Chrome deletes its local token. Saves
            already in your account stay there until you delete them.
          </li>
        </ul>

        <h2 style={h2}>Security</h2>
        <p style={p}>
          Data is sent over HTTPS. Passwords are hashed. Access to your account data requires your sign-in token.
          No system is perfectly secure, but we keep what we collect to the minimum needed to run the product.
        </p>

        <h2 style={h2}>Changes</h2>
        <p style={p}>
          If this policy changes in a way that affects your data, we&apos;ll update the date above and, for material
          changes, let you know by email.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          Questions or requests? Open an issue on the project&apos;s GitHub repository:{' '}
          <a href={REPO_URL} style={link} target="_blank" rel="noopener noreferrer">
            github.com/Adarsh1313/resurface
          </a>
          .
        </p>

        <div style={{ marginTop: 56, paddingTop: 20, borderTop: '0.5px solid var(--rs-border-subtle)' }}>
          <Link href="/" style={{ ...link, color: 'var(--rs-text-tertiary)' }}>
            ← Back to Resurface
          </Link>
        </div>
      </div>
    </main>
  );
}
