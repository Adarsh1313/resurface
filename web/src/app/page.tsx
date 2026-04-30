import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { WaitlistForm } from '@/components/WaitlistForm';

const steps = [
  { n: '01', title: 'Save', body: 'Bookmark normally on X or YouTube. The extension sees it.' },
  { n: '02', title: 'Capture', body: 'A quiet prompt offers a topic and optional reminder.' },
  { n: '03', title: 'Organise', body: 'It lands in your dashboard, tagged and filterable.' },
  { n: '04', title: 'Resurface', body: 'Five hand-picked saves come back in your weekly digest.' },
];

const problems = [
  { n: '847', label: "saved tweets you haven't read" },
  { n: '214h', label: 'of Watch Later, mostly untouched' },
  { n: '0', label: 'reminders from any of it' },
];

export default function Home() {
  return (
    <div
      className="rs-grain"
      style={{
        background: 'var(--rs-bg-base)',
        minHeight: '100vh',
        position: 'relative',
        color: 'var(--rs-text-primary)',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 48px',
          maxWidth: 1200,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Logo size={22} wordSize={16} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a
            href="#how"
            style={{
              font: '500 13px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-secondary)',
              textDecoration: 'none',
            }}
          >
            How it works
          </a>
          <Link
            href="/login"
            style={{
              font: '500 13px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-secondary)',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <a
            href="#waitlist"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              font: '500 13px/1 var(--font-geist-sans)',
              padding: '8px 14px',
              background: 'var(--rs-teal-400)',
              color: 'var(--rs-teal-900)',
              borderRadius: 'var(--rs-radius-md)',
              textDecoration: 'none',
            }}
          >
            Join waitlist
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1060,
          margin: '0 auto',
          padding: '56px 48px 32px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px 4px 4px',
            borderRadius: 'var(--rs-radius-full)',
            background: 'var(--rs-bg-elevated)',
            border: '0.5px solid var(--rs-border-subtle)',
            marginBottom: 28,
          }}
        >
          <span
            style={{
              font: '500 10px/1 var(--font-geist-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--rs-teal-300)',
              background: 'rgba(45,212,191,0.10)',
              padding: '3px 8px',
              borderRadius: 'var(--rs-radius-full)',
            }}
          >
            New
          </span>
          <span style={{ font: '400 12px/1 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
            Now capturing YouTube Shorts →
          </span>
        </div>
        <h1
          style={{
            font: '500 64px/1.02 var(--font-geist-sans)',
            letterSpacing: '-0.035em',
            margin: 0,
            color: 'var(--rs-text-primary)',
          }}
        >
          Your bookmarks
          <br />
          are a graveyard.
        </h1>
        <p
          style={{
            font: '400 17px/1.55 var(--font-geist-sans)',
            color: 'var(--rs-text-secondary)',
            maxWidth: 520,
            margin: '22px auto 32px',
          }}
        >
          Resurface captures what you save on X and YouTube, then brings it back at the moment it matters — so your
          intentions don&rsquo;t quietly rot.
        </p>
        <div id="waitlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 48, scrollMarginTop: 80 }}>
          <WaitlistForm source="landing-hero" />
          <a
            href="#how"
            style={{
              font: '500 13px/1 var(--font-geist-sans)',
              color: 'var(--rs-text-secondary)',
              textDecoration: 'none',
            }}
          >
            See how it works ↓
          </a>
        </div>
      </section>

      {/* Problem stats */}
      <section
        style={{ maxWidth: 1060, margin: '48px auto', padding: '48px', position: 'relative', zIndex: 1 }}
      >
        <div className="rs-micro" style={{ textAlign: 'center', marginBottom: 24 }}>
          The before
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {problems.map((it) => (
            <div
              key={it.n}
              style={{
                background: 'var(--rs-bg-surface)',
                border: '0.5px solid var(--rs-border-subtle)',
                borderRadius: 'var(--rs-radius-lg)',
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  font: '500 40px/1 var(--font-geist-sans)',
                  letterSpacing: '-0.03em',
                  color: 'var(--rs-text-primary)',
                  marginBottom: 10,
                }}
              >
                {it.n}
              </div>
              <div
                style={{ font: '400 13px/1.5 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}
              >
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Loop */}
      <section
        id="how"
        style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 48px 64px', position: 'relative', zIndex: 1 }}
      >
        <h2 className="rs-display" style={{ textAlign: 'center', margin: '0 0 12px' }}>
          One quiet loop.
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--rs-text-secondary)',
            font: '400 15px/1.55 var(--font-geist-sans)',
            margin: '0 auto 40px',
            maxWidth: 520,
          }}
        >
          No new habit. No new app to open. The work happens between saves.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: 'var(--rs-bg-surface)',
                border: '0.5px solid var(--rs-border-subtle)',
                borderRadius: 'var(--rs-radius-lg)',
                padding: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--rs-radius-sm)',
                    background: 'rgba(45,212,191,0.08)',
                    border: '0.5px solid rgba(45,212,191,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--rs-teal-400)',
                    font: '500 12px/1 var(--font-geist-sans)',
                  }}
                >
                  {s.n}
                </div>
                <span className="rs-micro">Step</span>
              </div>
              <div
                style={{
                  font: '500 16px/1.35 var(--font-geist-sans)',
                  color: 'var(--rs-text-primary)',
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                {s.title}
              </div>
              <div style={{ font: '400 13px/1.55 var(--font-geist-sans)', color: 'var(--rs-text-secondary)' }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inverted CTA */}
      <section
        style={{
          background: '#f5f2ed',
          color: '#0f0f0e',
          padding: '88px 48px',
          margin: '48px 0 0',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h2
          style={{
            font: '500 44px/1.08 var(--font-geist-sans)',
            letterSpacing: '-0.03em',
            margin: '0 auto 16px',
            maxWidth: 640,
            color: '#0f0f0e',
          }}
        >
          Your saves deserve better than a black hole.
        </h2>
        <p
          style={{
            font: '400 16px/1.55 var(--font-geist-sans)',
            color: '#5e5b57',
            maxWidth: 480,
            margin: '0 auto 28px',
          }}
        >
          Two minutes to install. Works silently from there. Free while we&rsquo;re in beta.
        </p>
        <Link
          href="/onboarding"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            font: '500 14px/1 var(--font-geist-sans)',
            padding: '12px 22px',
            background: '#0f0f0e',
            color: '#f0ede8',
            borderRadius: 'var(--rs-radius-md)',
            textDecoration: 'none',
          }}
        >
          Add to Chrome
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '0.5px solid var(--rs-border-subtle)',
          padding: '32px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1200,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Logo size={16} wordSize={13} />
        <div
          style={{
            display: 'flex',
            gap: 18,
            font: '400 12px/1 var(--font-geist-sans)',
            color: 'var(--rs-text-tertiary)',
          }}
        >
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
