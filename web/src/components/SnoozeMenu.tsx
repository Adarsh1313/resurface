'use client';

import { useState, useEffect, useId } from 'react';
import { Clock } from 'lucide-react';
import { useSnoozeUntil, useMenu } from '@/lib/hooks';
import { CustomDateForm, MenuItem, MenuSeparator, MenuSurface, triggerClass } from './MenuPrimitives';

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d;
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const PRESETS = [
  { days: 1, label: '1 day' },
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 30, label: '1 month' },
];

export function SnoozeMenu({ bookmarkId }: { bookmarkId: string }) {
  const { open, setOpen, close, focusFirst, rootRef, triggerRef, menuRef, onMenuKeyDown } = useMenu();
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState(() => toLocalInput(addDays(7)));
  const snooze = useSnoozeUntil();
  const menuId = useId();

  // Move focus into the list whenever it is shown (on open, and when returning from the date form).
  useEffect(() => {
    if (open && !customOpen) focusFirst();
  }, [open, customOpen, focusFirst]);

  const toggle = () => {
    setCustomOpen(false);
    setOpen(!open);
  };

  const pick = (days: number) => {
    snooze.mutate({ id: bookmarkId, until: addDays(days) });
    close();
  };

  const pickCustom = () => {
    const d = new Date(custom);
    if (isNaN(d.getTime())) return;
    snooze.mutate({ id: bookmarkId, until: d });
    close();
  };

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setCustomOpen(false);
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Snooze"
        title="Snooze"
        className={triggerClass}
        style={{ color: open ? 'var(--rs-teal-300)' : 'var(--rs-text-tertiary)', border: 'none' }}
      >
        <Clock className="w-4 h-4" aria-hidden />
      </button>
      {open && (
        <MenuSurface ref={menuRef} id={menuId} label="Snooze until" onKeyDown={onMenuKeyDown}>
          {!customOpen ? (
            <>
              {PRESETS.map((p) => (
                <MenuItem key={p.days} onSelect={() => pick(p.days)}>
                  {p.label}
                </MenuItem>
              ))}
              <MenuSeparator />
              <MenuItem tone="muted" onSelect={() => setCustomOpen(true)}>
                Custom date…
              </MenuItem>
            </>
          ) : (
            <CustomDateForm
              label="Snooze until"
              value={custom}
              onChange={setCustom}
              onBack={() => setCustomOpen(false)}
              onConfirm={pickCustom}
              confirmLabel="Snooze"
            />
          )}
        </MenuSurface>
      )}
    </div>
  );
}
