'use client';

import { useMemo } from 'react';
import { Bell, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { useBookmarks, useReviewBookmark, normalizeBookmark, relativeTime } from '@/lib/hooks';
import { PlatformPill } from '@/components/PlatformPill';
import { EmptyState } from '@/components/EmptyState';
import { useSearch } from '@/lib/search-context';

function formatReminder(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 0) return `Today at ${time}`;
  if (diffDays === 1) return `Tomorrow at ${time}`;
  if (diffDays > 0) return `In ${diffDays} days at ${time}`;
  return `${Math.abs(diffDays)} days ago`;
}

export default function RemindersPage() {
  const { query } = useSearch();
  const searchParams = useMemo(() => {
    const p: Record<string, string> = { limit: '200' };
    if (query) p.q = query;
    return p;
  }, [query]);
  const { data, isLoading } = useBookmarks(searchParams);
  const review = useReviewBookmark();
  const reminders = useMemo(
    () =>
      (data?.bookmarks || [])
        .map(normalizeBookmark)
        .filter((b) => b.reminder_at),
    [data]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? 'Loading...' : `${reminders.length} bookmark${reminders.length === 1 ? '' : 's'} with scheduled reminders`}
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={query ? `No reminders match "${query}"` : 'No reminders set'}
          body={query ? 'Try a different search term.' : "Set a reminder when you save a bookmark and it'll show up here when the time comes."}
        />
      ) : (
        <div className="space-y-3">
          {reminders.map((bookmark) => (
            <div key={bookmark.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 hover:text-blue-600">{bookmark.title}</a>
                  <p className="text-xs text-gray-500">{bookmark.author} · Saved {relativeTime(bookmark.saved_at)}</p>
                  {bookmark.reminder_at && (
                    <p className="text-xs text-blue-600 mt-0.5">Reminder: {formatReminder(bookmark.reminder_at)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PlatformPill platform={bookmark.platform} size="xs" />
                <button onClick={() => review.mutate(bookmark.id)} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" title="Mark reviewed"><CheckCircle2 className="w-4 h-4" /></button>
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><ExternalLink className="w-4 h-4" /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
