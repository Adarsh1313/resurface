'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Plus, Search, Settings, LogOut, ShieldCheck, Puzzle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuthStore } from '@/lib/store';
import s from './dashboard.module.css';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/saves', label: 'Saves' },
  { href: '/dashboard/reviewed', label: 'Reviewed' },
  { href: '/dashboard/snoozed', label: 'Snoozed' },
  { href: '/dashboard/reminders', label: 'Reminders' },
  { href: '/dashboard/trash', label: 'Trash' },
];

export function TopNav({ onAdd }: { onAdd: () => void }) {
  const router = useRouter();
  const user = useAuthStore((st) => st.user);
  const logout = useAuthStore((st) => st.logout);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <nav className={s.nav} aria-label="Primary">
      <Link href="/dashboard" className={`${s.brand} rs-focus-ring`} aria-label="Resurface home">
        <Logo size={20} wordSize={18} />
      </Link>
      <div className={s.pills}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`${s.pill} ${l.href === '/dashboard' ? s.pillOn : ''} rs-focus-ring`}
            aria-current={l.href === '/dashboard' ? 'page' : undefined}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <span className={s.navSpacer} />
      <button className={`${s.addBtn} rs-focus-ring`} onClick={onAdd}>
        <Plus size={15} /> <span className={s.addLabel}>Add save</span>
      </button>
      <Link href="/dashboard/saves" className={`${s.iconBtn} rs-focus-ring`} aria-label="Search saves" title="Search saves">
        <Search size={16} />
      </Link>
      <Link href="/dashboard/settings" className={`${s.iconBtn} rs-focus-ring`} aria-label="Settings" title="Settings">
        <Settings size={16} />
      </Link>
      <div style={{ position: 'relative' }}>
        <button
          ref={triggerRef}
          className={`${s.avatar} rs-focus-ring`}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          onClick={() => setOpen((v) => !v)}
        >
          {initials}
        </button>
        {open && (
          <div ref={menuRef} className={s.menu} role="menu">
            <div className={s.menuHead}>
              <b>{user?.name || 'You'}</b>
              <span>{user?.email}</span>
            </div>
            <div className={s.menuNav}>
              {links.slice(1).map((l) => (
                <Link key={l.href} href={l.href} className={s.menuItem} role="menuitem">
                  {l.label}
                </Link>
              ))}
            </div>
            <Link href="/dashboard/settings?section=extension" className={s.menuItem} role="menuitem">
              <Puzzle size={14} /> Chrome extension
            </Link>
            <Link href="/dashboard/admin" className={s.menuItem} role="menuitem">
              <ShieldCheck size={14} /> Admin
            </Link>
            <button
              className={s.menuItem}
              role="menuitem"
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
