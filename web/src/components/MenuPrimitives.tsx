'use client';

import { forwardRef, useId } from 'react';

/** Dark popover surface + items shared by SnoozeMenu and ReminderMenu. */

export const triggerClass =
  'rs-focus-ring inline-flex items-center justify-center p-1.5 rounded-md transition-colors hover:bg-[var(--rs-bg-hover)]';

export const MenuSurface = forwardRef<
  HTMLDivElement,
  { id: string; label: string; onKeyDown: (e: React.KeyboardEvent) => void; children: React.ReactNode }
>(function MenuSurface({ id, label, onKeyDown, children }, ref) {
  return (
    <div
      ref={ref}
      id={id}
      role="menu"
      aria-label={label}
      onKeyDown={onKeyDown}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        marginTop: 4,
        width: 208,
        padding: 4,
        background: 'var(--rs-bg-elevated)',
        border: '0.5px solid var(--rs-border-default)',
        borderRadius: 'var(--rs-radius-md)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 40,
      }}
    >
      {children}
    </div>
  );
});

export function MenuItem({
  onSelect,
  children,
  tone = 'default',
}: {
  onSelect: () => void;
  children: React.ReactNode;
  tone?: 'default' | 'muted' | 'danger';
}) {
  const color =
    tone === 'danger' ? 'var(--rs-red-400)' : tone === 'muted' ? 'var(--rs-text-secondary)' : 'var(--rs-text-primary)';
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={onSelect}
      className="rs-focus-ring hover:bg-[var(--rs-bg-hover)] focus-visible:bg-[var(--rs-bg-hover)]"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '7px 10px',
        border: 'none',
        borderRadius: 4,
        textAlign: 'left',
        font: '400 13px/1.2 var(--font-geist-sans)',
        color,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" style={{ height: 0.5, background: 'var(--rs-border-subtle)', margin: '4px 2px' }} />;
}

/** The "Custom date…" view: a labelled datetime-local input with Back / confirm. */
export function CustomDateForm({
  label,
  value,
  onChange,
  onBack,
  onConfirm,
  confirmLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  const inputId = useId();
  const btn: React.CSSProperties = {
    flex: 1,
    padding: '6px 8px',
    borderRadius: 4,
    font: '500 12px/1 var(--font-geist-sans)',
    cursor: 'pointer',
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <label
        htmlFor={inputId}
        style={{ font: '500 11px/1 var(--font-geist-sans)', color: 'var(--rs-text-tertiary)' }}
      >
        {label}
      </label>
      <input
        id={inputId}
        type="datetime-local"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rs-focus-ring"
        style={{
          width: '100%',
          padding: '6px 8px',
          background: 'var(--rs-bg-base)',
          border: '0.5px solid var(--rs-border-default)',
          borderRadius: 4,
          font: '400 12px/1.2 var(--font-geist-sans)',
          color: 'var(--rs-text-primary)',
          colorScheme: 'dark',
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={onBack}
          className="rs-focus-ring"
          style={{
            ...btn,
            background: 'transparent',
            color: 'var(--rs-text-secondary)',
            border: '0.5px solid var(--rs-border-default)',
          }}
        >
          Back
        </button>
        <button
          type="submit"
          className="rs-focus-ring"
          style={{ ...btn, background: 'var(--rs-teal-400)', color: 'var(--rs-teal-900)', border: 'none' }}
        >
          {confirmLabel}
        </button>
      </div>
    </form>
  );
}
