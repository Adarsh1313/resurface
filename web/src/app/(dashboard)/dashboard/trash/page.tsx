'use client';

import { useState, useMemo } from 'react';
import { Trash2, RotateCcw, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { useBookmarks, useRestoreBookmark, useDeleteBookmark, normalizeBookmark, relativeTime } from '@/lib/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PlatformPill } from '@/components/PlatformPill';
import { EmptyState } from '@/components/EmptyState';
import { useSearch } from '@/lib/search-context';

function daysUntilPurge(deletedAt: string) {
  const elapsed = Date.now() - new Date(deletedAt).getTime();
  const remaining = 15 - Math.floor(elapsed / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
}

export default function TrashPage() {
  const { query } = useSearch();
  const searchParams = useMemo(() => {
    const p: Record<string, string> = { trash: 'true', limit: '100' };
    if (query) p.q = query;
    return p;
  }, [query]);
  const { data, isLoading } = useBookmarks(searchParams);
  const restore = useRestoreBookmark();
  const del = useDeleteBookmark();
  const queryClient = useQueryClient();
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  const emptyTrash = useMutation({
    mutationFn: () => api.bookmarks.emptyTrash(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      setConfirmEmpty(false);
    },
  });

  const items = (data?.bookmarks || []).map(normalizeBookmark);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? 'Loading...' : `${items.length} item${items.length === 1 ? '' : 's'} · auto-deleted after 15 days`}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Empty trash
          </button>
        )}
      </div>

      {confirmEmpty && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800 flex-1">
            Permanently delete all {items.length} trashed bookmark{items.length === 1 ? '' : 's'}? This cannot be undone.
          </p>
          <button onClick={() => setConfirmEmpty(false)} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white">Cancel</button>
          <button
            onClick={() => emptyTrash.mutate()}
            disabled={emptyTrash.isPending}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete forever
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title={query ? `No trashed bookmarks match "${query}"` : 'Trash is empty'}
          body={query ? 'Try a different search term.' : "Deleted bookmarks appear here for 15 days before they're gone for good."}
        />
      ) : (
        <div className="space-y-3">
          {items.map((b) => {
            const days = b.deleted_at ? daysUntilPurge(b.deleted_at) : 15;
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <PlatformPill platform={b.platform} size="xs" />
                  <div className="min-w-0">
                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block">
                      {b.title}
                    </a>
                    <p className="text-xs text-gray-500">
                      {b.author} · Deleted {b.deleted_at ? relativeTime(b.deleted_at) : ''} · <span className={days <= 3 ? 'text-red-600' : ''}>{days} day{days === 1 ? '' : 's'} left</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => restore.mutate(b.id)}
                    className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600"
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => del.mutate(b.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                    title="Delete forever"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
