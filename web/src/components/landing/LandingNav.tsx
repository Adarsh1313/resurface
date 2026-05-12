'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from '@/components/Logo';

export function LandingNav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 40], ['rgba(15,15,14,0)', 'rgba(15,15,14,0.85)']);
  const blur = useTransform(scrollY, [0, 40], [0, 12]);
  const borderOpacity = useTransform(scrollY, [0, 40], [0, 1]);

  return (
    <motion.nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 60,
        background: bg,
        backdropFilter: useTransform(blur, (v) => `blur(${v}px)`),
        WebkitBackdropFilter: useTransform(blur, (v) => `blur(${v}px)`),
        borderBottom: '0.5px solid transparent',
      }}
    >
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '0.5px',
          background: 'var(--rs-border-subtle)',
          opacity: borderOpacity,
        }}
      />
      <div
        style={{
          height: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          data-cursor="pointer"
          aria-label="Resurface — Home"
          style={{ textDecoration: 'none' }}
        >
          <Logo size={22} wordSize={16} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="/login">Sign in</NavLink>
          <span
            aria-hidden
            style={{
              width: 1,
              height: 14,
              background: 'rgba(255,255,255,0.10)',
              display: 'inline-block',
            }}
          />
          <Link
            href="#waitlist"
            data-cursor="pointer"
            className="rs-landing-pill"
            style={{
              font: '500 13px/1 var(--font-geist-sans)',
              padding: '8px 16px',
              borderRadius: 'var(--rs-radius-full)',
              background: 'var(--rs-teal-400)',
              color: 'var(--rs-teal-900)',
              textDecoration: 'none',
              transition: 'background 200ms cubic-bezier(0.2,0,0,1)',
            }}
          >
            Join waitlist
          </Link>
        </div>
      </div>

      <style jsx>{`
        :global(.rs-landing-pill:hover) {
          background: var(--rs-teal-300);
        }
      `}</style>
    </motion.nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isInternal = href.startsWith('/');
  const Comp = isInternal ? Link : 'a';
  return (
    <Comp
      href={href}
      data-cursor="pointer"
      className="rs-nav-link"
      style={{
        font: '500 13px/1 var(--font-geist-sans)',
        color: 'var(--rs-text-secondary)',
        textDecoration: 'none',
        position: 'relative',
        padding: '4px 0',
        transition: 'color 200ms cubic-bezier(0.2,0,0,1)',
      }}
    >
      {children}
      <style jsx>{`
        :global(.rs-nav-link) {
          position: relative;
        }
        :global(.rs-nav-link::after) {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2px;
          height: 1px;
          background: var(--rs-teal-400);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
        }
        :global(.rs-nav-link:hover) {
          color: var(--rs-text-primary);
        }
        :global(.rs-nav-link:hover::after) {
          transform: scaleX(1);
        }
      `}</style>
    </Comp>
  );
}
