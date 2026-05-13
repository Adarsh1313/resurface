import Link from 'next/link';
import { Logo } from '@/components/Logo';

export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: '0.5px solid var(--rs-border-subtle)',
        background: 'var(--rs-bg-base)',
        padding: '32px 48px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <Link href="/" data-cursor="pointer" style={{ textDecoration: 'none' }} aria-label="Resurface — Home">
          <Logo size={16} wordSize={13} />
        </Link>

        <nav
          style={{
            display: 'flex',
            gap: 22,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <FootLink href="#how">How it works</FootLink>
          <FootLink href="/login">Sign in</FootLink>
          <FootLink href="/privacy">Privacy</FootLink>
          <FootLink href="/terms">Terms</FootLink>
          <FootLink href="mailto:hello@resurface.app">Contact</FootLink>
        </nav>

        <div style={{ display: 'flex', gap: 10 }}>
          <SocialButton href="https://x.com/resurfaceapp" label="X (Twitter)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </SocialButton>
          <SocialButton href="https://github.com/resurfaceapp" label="GitHub">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.77.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 0z" />
            </svg>
          </SocialButton>
          <SocialButton href="https://www.producthunt.com/products/resurface" label="Product Hunt">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm1.5 13.5h-3v4.5h-2v-12h5a3.75 3.75 0 0 1 0 7.5zm0-5.5h-3v3.5h3a1.75 1.75 0 0 0 0-3.5z" />
            </svg>
          </SocialButton>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '20px auto 0',
          textAlign: 'center',
          font: '400 11px/1.4 var(--font-geist-sans)',
          color: 'var(--rs-text-tertiary)',
        }}
      >
        © 2026 Resurface — Built by Adarsh Bharathwaj
      </div>
    </footer>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isInternal = href.startsWith('/');
  const className = 'rs-foot-link';
  const style: React.CSSProperties = {
    font: '400 12px/1 var(--font-geist-sans)',
    color: 'var(--rs-text-tertiary)',
    textDecoration: 'none',
    transition: 'color 150ms cubic-bezier(0.2,0,0,1)',
  };
  if (isInternal) {
    return (
      <Link href={href} data-cursor="pointer" className={className} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} data-cursor="pointer" className={className} style={style}>
      {children}
    </a>
  );
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      data-cursor="pointer"
      className="rs-social-btn"
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: '0.5px solid var(--rs-border-subtle)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--rs-text-tertiary)',
        opacity: 0.4,
        transition:
          'opacity 200ms cubic-bezier(0.2,0,0,1), border-color 200ms cubic-bezier(0.2,0,0,1)',
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}
