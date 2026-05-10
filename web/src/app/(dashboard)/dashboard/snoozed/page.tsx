'use client';

import { useMemo } from 'react';
import { CheckCircle2, ExternalLink, Trash2, Loader2, Clock } from 'lucide-react';
import { useBookmarks, useReviewBookmark, useDeleteBookmark, normalizeBookmark, relativeTime } from '@/lib/hooks';
import { SnoozeMenu } from '@/components/SnoozeMenu';
import { TopicChips } from '@/components/TopicChips';
import { PlatformPill } from '@/components/PlatformPill';
import { EmptyState } from '@/components/EmptyState';
import { useSearch } from '@/lib/search-context';

export default function SnoozedPage() {
  const { query } = useSearch();
  const searchParams = useMemo(() => {
    const p: Record<string, string> = { status: 'snoozed', limit: '100' };
    if (query) p.q = query;
    return p;
  }, [query]);
  const { data, isLoading } = useBookmarks(searchParams);
  const review = useReviewBookmark();
  const del = useDeleteBookmark();
  const snoozed = (data?.bookmarks || []).map(normalizeBookmark);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Snoozed</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? 'Loading...' : `${snoozed.length} bookmarks snoozed`}
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : snoozed.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={query ? `No snoozed bookmarks match "${query}"` : 'Nothing snoozed'}
          body={query ? 'Try a different search term.' : "Snooze a save and it'll quietly come back at the time you picked."}
        />
      ) : (
        <div className="space-y-3">
          {snoozed.map((bookmark) => (
            <div key={bookmark.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <PlatformPill platform={bookmark.platform} size="xs" />
                <div>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 hover:text-blue-600">{bookmark.title}</a>
                  <p className="text-xs text-gray-500">{bookmark.author} · {relativeTime(bookmark.saved_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TopicChips topics={bookmark.topics} size="xs" />
                <button onClick={() => review.mutate(bookmark.id)} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" title="Mark reviewed"><CheckCircle2 className="w-4 h-4" /></button>
                <SnoozeMenu bookmarkId={bookmark.id} />
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><ExternalLink className="w-4 h-4" /></a>
                <button onClick={() => del.mutate(bookmark.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
