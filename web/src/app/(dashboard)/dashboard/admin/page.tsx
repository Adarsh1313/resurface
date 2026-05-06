'use client';

import { RefreshCw, Send } from 'lucide-react';
import { useAdminWaitlist, useInviteWaitlistEntry } from '@/lib/hooks';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: 'var(--rs-bg-surface)',
        border: '0.5px solid var(--rs-border-subtle)',
        borderRadius: 'var(--rs-radius-lg)',
        padding: 16,
      }}
    >
      <div className="rs-caption" style={{ color: 'var(--rs-text-tertiary)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ font: '600 28px/1 var(--font-geist-sans)', color: 'var(--rs-text-primary)' }}>{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const { data, isLoading, error, refetch, isRefetching } = useAdminWaitlist();
  const invite = useInviteWaitlistEntry();
  const entries = data?.entries || [];
  const counts = data?.counts || { total: 0, pending: 0, invited: 0, users: 0 };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div className="rs-micro" style={{ marginBottom: 8 }}>
            Owner console
          </div>
          <h1 className="rs-display" style={{ margin: 0 }}>
            Waitlist
          </h1>
          <p style={{ margin: '10px 0 0', color: 'var(--rs-text-secondary)', font: '400 14px/1.55 var(--font-geist-sans)' }}>
            Review new signups, refresh the list, and send private beta invites.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rs-focus-ring"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 36,
            padding: '0 14px',
            background: 'var(--rs-bg-surface)',
            color: 'var(--rs-text-secondary)',
            border: '0.5px solid var(--rs-border-default)',
            borderRadius: 'var(--rs-radius-md)',
            font: '500 13px/1 var(--font-geist-sans)',
            cursor: isRefetching ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw style={{ width: 14, height: 14 }} />
          {isRefetching ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
        <Stat label="Total waitlist" value={counts.total} />
        <Stat label="Pending" value={counts.pending} />
        <Stat label="Invited" value={counts.invited} />
        <Stat label="Signed-up users" value={counts.users} />
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(248,113,113,0.10)',
            border: '0.5px solid rgba(248,113,113,0.30)',
            color: '#fca5a5',
            borderRadius: 'var(--rs-radius-lg)',
            padding: 16,
            marginBottom: 18,
            font: '400 13px/1.5 var(--font-geist-sans)',
          }}
        >
          Could not load admin data. Make sure your logged-in email is listed in backend ADMIN_EMAILS.
        </div>
      )}

      <div
        style={{
          background: 'var(--rs-bg-surface)',
          border: '0.5px solid var(--rs-border-subtle)',
          borderRadius: 'var(--rs-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
            <thead>
              <tr style={{ background: 'var(--rs-bg-elevated)' }}>
                {['Email', 'Status', 'Source', 'Joined', 'Invited', 'Referrer', 'Action'].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      color: 'var(--rs-text-tertiary)',
                      font: '600 11px/1 var(--font-geist-sans)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderBottom: '0.5px solid var(--rs-border-subtle)',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, color: 'var(--rs-text-secondary)', font: '400 14px/1 var(--font-geist-sans)' }}>
                    Loading waitlist...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, color: 'var(--rs-text-secondary)', font: '400 14px/1 var(--font-geist-sans)' }}>
                    No waitlist signups yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isInvited = entry.status === 'invited';
                  const isSending = invite.isPending && invite.variables === entry.id;
                  return (
                    <tr key={entry.id}>
                      <td style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--rs-border-subtle)' }}>
                        <div style={{ color: 'var(--rs-text-primary)', font: '500 13px/1.35 var(--font-geist-sans)' }}>
                          {entry.email}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--rs-border-subtle)' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            height: 22,
                            padding: '0 8px',
                            borderRadius: 'var(--rs-radius-full)',
                            background: isInvited ? 'rgba(45,212,191,0.12)' : 'rgba(250,204,21,0.10)',
                            color: isInvited ? 'var(--rs-teal-300)' : '#fde68a',
                            font: '600 11px/1 var(--font-geist-sans)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--rs-border-subtle)', color: 'var(--rs-text-secondary)', font: '400 13px/1.4 var(--font-geist-sans)' }}>
                        {entry.source || '-'}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--rs-border-subtle)', color: 'var(--rs-text-secondary)', font: '400 13px/1.4 var(--font-geist-sans)' }}>
                        {formatDate(entry.created_at)}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--rs-border-subtle)', color: 'var(--rs-text-secondary)', font: '400 13px/1.4 var(--font-geist-sans)' }}>
                        {formatDate(entry.invited_at)}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--rs-border-subtle)', color: 'var(--rs-text-tertiary)', font: '400 12px/1.4 var(--font-geist-sans)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.referrer || '-'}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--rs-border-subtle)' }}>
                        <button
                          type="button"
                          disabled={isSending}
                          onClick={() => invite.mutate(entry.id)}
                          className="rs-focus-ring"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 7,
                            height: 30,
                            padding: '0 10px',
                            border: 'none',
                            borderRadius: 'var(--rs-radius-sm)',
                            background: isInvited ? 'var(--rs-bg-elevated)' : 'var(--rs-teal-400)',
                            color: isInvited ? 'var(--rs-text-secondary)' : 'var(--rs-teal-900)',
                            cursor: isSending ? 'wait' : 'pointer',
                            font: '600 12px/1 var(--font-geist-sans)',
                          }}
                        >
                          <Send style={{ width: 13, height: 13 }} />
                          {isSending ? 'Sending' : isInvited ? 'Resend invite' : 'Invite'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
