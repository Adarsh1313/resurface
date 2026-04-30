'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useSnoozeUntil } from '@/lib/hooks';

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

export function SnoozeMenu({ bookmarkId }: { bookmarkId: string }) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState(toLocalInput(addDays(7)));
  const ref = useRef<HTMLDivElement>(null);
  const snooze = useSnoozeUntil();

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
    snooze.mutate({ id: bookmarkId, until: addDays(days) });
    setOpen(false);
  };

  const pickCustom = () => {
    const d = new Date(custom);
    if (isNaN(d.getTime())) return;
    snooze.mutate({ id: bookmarkId, until: d });
    setOpen(false);
    setCustomOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        title="Snooze"
      >
        <Clock className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
          {!customOpen ? (
            <>
              <button onClick={() => pick(1)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">1 day</button>
              <button onClick={() => pick(3)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">3 days</button>
              <button onClick={() => pick(7)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">1 week</button>
              <button onClick={() => pick(30)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">1 month</button>
              <div className="border-t border-gray-100 my-1" />
              <button onClick={() => setCustomOpen(true)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-600">
                Custom date…
              </button>
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
                <button onClick={pickCustom} className="flex-1 px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800">Snooze</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
