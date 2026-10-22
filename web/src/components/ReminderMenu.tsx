'use client';

import { useState, useEffect, useId } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useSetReminder, useMenu } from '@/lib/hooks';
import { CustomDateForm, MenuItem, MenuSeparator, MenuSurface, triggerClass } from './MenuPrimitives';

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function preset(days: number, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const PRESETS = [
  { days: 1, label: 'Tomorrow 9am' },
  { days: 3, label: 'In 3 days' },
  { days: 7, label: 'In 1 week' },
  { days: 30, label: 'In 1 month' },
];

export function ReminderMenu({ bookmarkId, hasReminder }: { bookmarkId: string; hasReminder?: boolean }) {
  const { open, setOpen, close, focusFirst, rootRef, triggerRef, menuRef, onMenuKeyDown } = useMenu();
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState(() => toLocalInput(preset(1)));
  const setReminder = useSetReminder();
  const menuId = useId();

  useEffect(() => {
    if (open && !customOpen) focusFirst();
  }, [open, customOpen, focusFirst]);

  const toggle = () => {
    setCustomOpen(false);
    setOpen(!open);
  };

  const pick = (days: number) => {
    setReminder.mutate({ id: bookmarkId, at: preset(days) });
    close();
  };

  const pickCustom = () => {
    const d = new Date(custom);
    if (isNaN(d.getTime())) return;
    setReminder.mutate({ id: bookmarkId, at: d });
    close();
  };

  const clear = () => {
    setReminder.mutate({ id: bookmarkId, at: null });
    close();
  };

  const label = hasReminder ? 'Reminder set — change reminder' : 'Set reminder';

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
        aria-label={label}
        title={hasReminder ? 'Reminder set' : 'Set reminder'}
        className={triggerClass}
        style={{
          color: hasReminder ? 'var(--rs-amber-400)' : open ? 'var(--rs-teal-300)' : 'var(--rs-text-tertiary)',
          border: 'none',
        }}
      >
        <Bell className="w-4 h-4" aria-hidden />
      </button>
      {open && (
        <MenuSurface ref={menuRef} id={menuId} label="Remind me" onKeyDown={onMenuKeyDown}>
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
              {hasReminder && (
                <>
                  <MenuSeparator />
                  <MenuItem tone="danger" onSelect={clear}>
                    <BellOff className="w-3.5 h-3.5" aria-hidden /> Clear reminder
                  </MenuItem>
                </>
              )}
            </>
          ) : (
            <CustomDateForm
              label="Remind me at"
              value={custom}
              onChange={setCustom}
              onBack={() => setCustomOpen(false)}
              onConfirm={pickCustom}
              confirmLabel="Set"
            />
          )}
        </MenuSurface>
      )}
    </div>
  );
}
