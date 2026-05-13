'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  Clock,
  Bell,
  Trash2,
  Search,
  Settings,
  PanelLeft,
  Tag,
  Plus,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useTopics, useBookmarks, normalizeBookmark } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import { SearchProvider, useSearch } from '@/lib/search-context';
import { AuthGuard } from '@/components/AuthGuard';
import { Logo } from '@/components/Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/saves', label: 'All saves', icon: Inbox },
  { href: '/dashboard/reviewed', label: 'Reviewed', icon: CheckCircle2 },
  { href: '/dashboard/snoozed', label: 'Snoozed', icon: Clock },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
  { href: '/dashboard/trash', label: 'Trash', icon: Trash2 },
  { href: '/dashboard/admin', label: 'Admin', icon: ShieldCheck },
];

function NavItem({
  href,
  label,
  icon: Icon,
  count,
  active,
  collapsed,
  muted,
  onClick,
}: {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  count?: number;
  active?: boolean;
  collapsed?: boolean;
  muted?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <Icon
        className="shrink-0"
        style={{
          width: 16,
          height: 16,
          color: active ? 'var(--rs-teal-400)' : 'var(--rs-text-tertiary)',
        }}
      />
      {!collapsed && (
        <>
          <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>
          {count !== undefined && (
            <span
              style={{
                font: '400 10px/1 var(--font-geist-sans), sans-serif',
                background: 'var(--rs-bg-hover)',
                color: 'var(--rs-text-tertiary)',
                padding: '2px 6px',
                borderRadius: 'var(--rs-radius-full)',
              }}
            >
              {count}
            </span>
          )}
        </>
      )}
    </>
  );

  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 32,
    padding: collapsed ? 0 : active ? '0 10px 0 8px' : '0 10px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    background: active ? 'rgba(45,212,191,0.07)' : 'transparent',
    borderLeft: active && !collapsed ? '2px solid var(--rs-teal-400)' : '2px solid transparent',
    borderRadius: active && !collapsed ? '0 6px 6px 0' : '6px',
    font: `500 ${muted ? 12 : 13}px/1 var(--font-geist-sans), sans-serif`,
    color: active ? 'var(--rs-teal-300)' : 'var(--rs-text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 120ms, color 120ms',
    border: 'none',
    marginBottom: 2,
  };

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="rs-focus-ring" style={style}>
        {body}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className="rs-focus-ring" style={style}>
      {body}
    </button>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: topicsData } = useTopics();
  const { data: bookmarksData } = useBookmarks({ limit: '500' });
  const topics = topicsData?.topics || [];
  // Count bookmarks with no topic — surfaces the "Unlabelled" bucket
  // and reconciles the sidebar count with reality (topic.count from the
  // backend can lag if the user has just-saved/just-untagged items).
  const allBookmarks = (bookmarksData?.bookmarks || []).map(normalizeBookmark);
  const unlabelledCount = allBookmarks.filter((b) => !b.topics || b.topics.length === 0).length;
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { query, setQuery } = useSearch();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const width = collapsed ? 52 : 220;
  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div
      className="rs-grain"
      style={{
        minHeight: '100vh',
        background: 'var(--rs-bg-base)',
        color: 'var(--rs-text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — 52px sticky */}
      <header
        style={{
          height: 52,
          flexShrink: 0,
          background: 'var(--rs-bg-surface)',
          borderBottom: '0.5px solid var(--rs-border-subtle)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Logo size={20} />
        </Link>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 34,
              padding: '0 12px',
              background: 'var(--rs-bg-elevated)',
              border: '0.5px solid var(--rs-border-default)',
              borderRadius: 'var(--rs-radius-md)',
              maxWidth: 360,
              width: '100%',
            }}
          >
            <Search style={{ width: 14, height: 14, color: 'var(--rs-text-tertiary)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saves, topics, authors…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                font: '400 13px/1 var(--font-geist-sans), sans-serif',
                color: 'var(--rs-text-primary)',
              }}
            />
          </label>
        </div>
        <Link
          href="/dashboard/settings"
          className="rs-focus-ring"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--rs-radius-xs)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rs-text-tertiary)',
            textDecoration: 'none',
          }}
          title="Settings"
        >
          <Settings style={{ width: 16, height: 16 }} />
        </Link>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="rs-focus-ring"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
              color: '#042f2e',
              font: '500 11px/1 var(--font-geist-sans), sans-serif',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={user?.email}
          >
            {initials}
          </button>
          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: 224,
                background: 'var(--rs-bg-overlay)',
                border: '0.5px solid var(--rs-border-default)',
                borderRadius: 'var(--rs-radius-lg)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.40)',
                zIndex: 40,
                padding: 4,
              }}
            >
              <div
                style={{
                  padding: '8px 10px',
                  borderBottom: '0.5px solid var(--rs-border-subtle)',
                  marginBottom: 4,
                }}
              >
                <div className="rs-caption" style={{ color: 'var(--rs-text-tertiary)' }}>
                  Signed in as
                </div>
                <div
                  className="rs-label"
                  style={{
                    color: 'var(--rs-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email || 'Unknown'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rs-focus-ring"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  height: 32,
                  padding: '0 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--rs-radius-sm)',
                  font: '500 13px/1 var(--font-geist-sans), sans-serif',
                  color: 'var(--rs-text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          style={{
            width,
            flexShrink: 0,
            background: 'var(--rs-bg-surface)',
            borderRight: '0.5px solid var(--rs-border-subtle)',
            padding: collapsed ? '16px 6px' : '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 200ms var(--rs-ease-default)',
            overflow: 'hidden',
            position: 'sticky',
            top: 52,
            height: 'calc(100vh - 52px)',
          }}
        >
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}

          {!collapsed && (topics.length > 0 || unlabelledCount > 0) && (
            <div className="rs-micro" style={{ padding: '16px 10px 6px' }}>
              Topics
            </div>
          )}
          {!collapsed &&
            topics.map((t) => (
              <NavItem
                key={t.id}
                label={t.name}
                icon={Tag}
                count={t.count}
                muted
                collapsed={collapsed}
                onClick={() => setQuery(t.name)}
              />
            ))}
          {!collapsed && unlabelledCount > 0 && (
            <NavItem
              label="Unlabelled"
              icon={Tag}
              count={unlabelledCount}
              muted
              collapsed={collapsed}
              onClick={() => setQuery('__unlabelled__')}
            />
          )}
          {!collapsed && (
            <button
              className="rs-focus-ring"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 30,
                padding: '0 10px',
                font: '400 12px/1 var(--font-geist-sans), sans-serif',
                color: 'var(--rs-text-tertiary)',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--rs-radius-sm)',
                cursor: 'pointer',
                marginTop: 2,
              }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              Add topic
            </button>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="rs-focus-ring"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                width: '100%',
                height: 32,
                padding: collapsed ? 0 : '0 10px',
                font: '500 12px/1 var(--font-geist-sans), sans-serif',
                color: 'var(--rs-text-tertiary)',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--rs-radius-sm)',
                cursor: 'pointer',
              }}
            >
              <PanelLeft style={{ width: 14, height: 14 }} />
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, padding: 24, position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SearchProvider>
        <LayoutInner>{children}</LayoutInner>
      </SearchProvider>
    </AuthGuard>
  );
}
