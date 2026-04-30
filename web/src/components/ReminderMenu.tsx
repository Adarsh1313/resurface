'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useSetReminder } from '@/lib/hooks';

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

export function ReminderMenu({ bookmarkId, hasReminder }: { bookmarkId: string; hasReminder?: boolean }) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState(toLocalInput(preset(1)));
  const ref = useRef<HTMLDivElement>(null);
  const setReminder = useSetReminder();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pick = (days: number) => {
    setReminder.mutate({ id: bookmarkId, at: preset(days) });
    setOpen(false);
  };

  const pickCustom = () => {
    const d = new Date(custom);
    if (isNaN(d.getTime())) return;
    setReminder.mutate({ id: bookmarkId, at: d });
    setOpen(false);
    setCustomOpen(false);
  };

  const clear = () => {
    setReminder.mutate({ id: bookmarkId, at: null });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`p-1.5 rounded-lg hover:bg-blue-50 ${hasReminder ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
        title={hasReminder ? 'Reminder set' : 'Set reminder'}
      >
        <Bell className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
          {!customOpen ? (
            <>
              <button onClick={() => pick(1)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">Tomorrow 9am</button>
              <button onClick={() => pick(3)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">In 3 days</button>
              <button onClick={() => pick(7)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">In 1 week</button>
              <button onClick={() => pick(30)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">In 1 month</button>
              <div className="border-t border-gray-100 my-1" />
              <button onClick={() => setCustomOpen(true)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-600">
                Custom date…
              </button>
              {hasReminder && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={clear} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2">
                    <BellOff className="w-3.5 h-3.5" /> Clear reminder
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="p-3 space-y-2">
              <input
                type="datetime-local"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <div className="flex gap-1">
                <button onClick={() => setCustomOpen(false)} className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Back</button>
                <button onClick={pickCustom} className="flex-1 px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800">Set</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
