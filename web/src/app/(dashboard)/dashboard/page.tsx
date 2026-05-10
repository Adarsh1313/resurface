'use client';

/* eslint-disable react-hooks/incompatible-library */
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  Bookmark as BookmarkIcon,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Mail,
} from 'lucide-react';
import {
  useBookmarks,
  useDashboardStats,
  useTopics,
  useReviewBookmark,
  useDeleteBookmark,
  useSendDigest,
  normalizeBookmark,
  relativeTime,
} from '@/lib/hooks';
import { SnoozeMenu } from '@/components/SnoozeMenu';
import { ReminderMenu } from '@/components/ReminderMenu';
import { TopicChips } from '@/components/TopicChips';
import { PlatformPill } from '@/components/PlatformPill';
import { StatusPill } from '@/components/StatusPill';
import { Sparkline, fakeWeekSeries } from '@/components/Sparkline';
import { useSearch } from '@/lib/search-context';
import { AddBookmarkModal } from '@/components/AddBookmarkModal';

type Row = ReturnType<typeof normalizeBookmark>;
const columnHelper = createColumnHelper<Row>();

const platformOptions = ['all', 'x', 'youtube'] as const;
const statusOptions = ['all', 'pending', 'reviewed', 'snoozed'] as const;

export default function DashboardPage() {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'saved_at', desc: true }]);
  const [showAdd, setShowAdd] = useState(false);
  const [digestMsg, setDigestMsg] = useState('');
  const { query } = useSearch();

  const searchParams = useMemo(() => {
    const p: Record<string, string> = { limit: '100' };
    if (query && query !== '__unlabelled__') p.q = query;
    return p;
  }, [query]);
  const { data: bookmarksData, isLoading } = useBookmarks(searchParams);
  const { data: statsData } = useDashboardStats();
  const { data: topicsData } = useTopics();

  const review = useReviewBookmark();
  const del = useDeleteBookmark();
  const sendDigest = useSendDigest();

  const bookmarks = useMemo(() => (bookmarksData?.bookmarks || []).map(normalizeBookmark), [bookmarksData]);
  const topics = topicsData?.topics || [];

  const stats = statsData || {
    saved_this_week: 0,
    saved_last_week: 0,
    pending_review: 0,
    top_topic: 'N/A',
    review_streak_weeks: 0,
    platform_breakdown: {},
  };
  const topTopicName = typeof stats.top_topic === 'string' ? stats.top_topic : stats.top_topic?.name || 'N/A';

  const weekDelta = stats.saved_this_week - stats.saved_last_week;
  const weekSeries = useMemo(
    () => fakeWeekSeries(stats.saved_this_week, stats.saved_last_week),
    [stats.saved_this_week, stats.saved_last_week]
  );
  // Pending series: synth from current pending value (flat-ish trend).
  const pendingSeries = useMemo(
    () => fakeWeekSeries(stats.pending_review, stats.pending_review),
    [stats.pending_review]
  );

  const statCards = [
    {
      label: 'Saved this week',
      value: stats.saved_this_week,
      sub: `${weekDelta >= 0 ? '+' : ''}${weekDelta} vs last`,
      sparkline: weekSeries,
      sparkColor: 'var(--rs-teal-400)',
      sparkFill: 'rgba(45,212,191,0.15)',
      icon: BookmarkIcon,
    },
    {
      label: 'Pending review',
      value: stats.pending_review,
      sub: stats.pending_review === 0 ? 'all caught up' : 'needs attention',
      sparkline: pendingSeries,
      sparkColor: 'var(--rs-amber-400)',
      sparkFill: 'rgba(251,191,36,0.12)',
      icon: Clock,
    },
    {
      label: 'Top topic',
      value: topTopicName,
      sub: 'most saved',
      sparkline: null as number[] | null,
      sparkColor: '',
      sparkFill: '',
      icon: TrendingUp,
    },
    {
      label: 'Review streak',
      value: `${stats.review_streak_weeks} weeks`,
      sub: stats.review_streak_weeks > 0 ? 'reviewed ≥ 1 every week' : 'start a streak',
      sparkline: null as number[] | null,
      sparkColor: '',
      sparkFill: '',
      icon: Flame,
    },
  ];

  const filteredData = useMemo(() => {
    const rawQ = query.trim();
    const isUnlabelled = rawQ === '__unlabelled__';
    const q = isUnlabelled ? '' : rawQ.toLowerCase();
    return bookmarks.filter((b) => {
      if (platformFilter !== 'all' && b.platform !== platformFilter) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (isUnlabelled) {
        if (b.topics && b.topics.length > 0) return false;
      } else if (topicFilter !== 'all' && !b.topics.some((t) => t.name === topicFilter)) {
        return false;
      }
      if (q) {
        const hay = `${b.title} ${b.author} ${b.topics.map((t) => t.name).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookmarks, platformFilter, statusFilter, topicFilter, query]);

  const handleSendDigest = async () => {
    setDigestMsg('');
    try {
      const res = await sendDigest.mutateAsync();
      if (res.bookmarks_included === 0) {
        setDigestMsg('No pending bookmarks to digest.');
      } else {
        setDigestMsg(`Digest sent — ${res.bookmarks_included} save${res.bookmarks_included === 1 ? '' : 's'} included. Check backend console.`);
      }
    } catch (err) {
      setDigestMsg(err instanceof Error ? err.message : 'Failed to send digest');
    }
    setTimeout(() => setDigestMsg(''), 5000);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="min-w-0">
            <a
              href={info.row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
            >
              {info.getValue()}
            </a>
            <p className="text-xs text-gray-500 truncate">{info.row.original.author}</p>
          </div>
        ),
      }),
      columnHelper.accessor('platform', {
        header: 'Platform',
        size: 100,
        cell: (info) => <PlatformPill platform={info.getValue()} size="xs" />,
      }),
      columnHelper.display({
        id: 'topics',
        header: 'Topics',
        size: 160,
        cell: ({ row }) => <TopicChips topics={row.original.topics} size="xs" />,
      }),
      columnHelper.accessor('saved_at', {
        header: 'Saved',
        size: 100,
        cell: (info) => <span className="text-sm text-gray-500">{relativeTime(info.getValue())}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        size: 100,
        cell: (info) => <StatusPill status={info.getValue()} size="xs" />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => review.mutate(row.original.id)}
              disabled={row.original.status === 'reviewed'}
              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Mark reviewed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <SnoozeMenu bookmarkId={row.original.id} />
            <ReminderMenu bookmarkId={row.original.id} hasReminder={!!row.original.reminder_at} />
            <button
              onClick={() => del.mutate(row.original.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
              title="Move to trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <a
              href={row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"
              title="Open"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ),
      }),
    ],
    [review, del]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendDigest}
            disabled={sendDigest.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-white disabled:opacity-50"
            title="Send digest email now (check backend console)"
          >
            {sendDigest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send digest now
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add bookmark
          </button>
        </div>
      </div>

      {digestMsg && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm border border-blue-200">{digestMsg}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--rs-bg-surface)',
              border: '0.5px solid var(--rs-border-subtle)',
              borderRadius: 'var(--rs-radius-lg)',
              padding: '18px 20px',
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div className="rs-micro" style={{ color: 'var(--rs-text-tertiary)' }}>
                {card.label}
              </div>
              {card.sparkline && (
                <Sparkline values={card.sparkline} stroke={card.sparkColor} fill={card.sparkFill} />
              )}
            </div>
            <div>
              <div
                style={{
                  font: '500 28px/1 var(--font-geist-sans), sans-serif',
                  letterSpacing: '-0.02em',
                  color: 'var(--rs-text-primary)',
                  marginBottom: 4,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  font: '400 11px/1.4 var(--font-geist-sans), sans-serif',
                  color: 'var(--rs-text-tertiary)',
                }}
              >
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {platformOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setPlatformFilter(opt)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  platformFilter === opt ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt === 'all' ? 'All' : opt === 'x' ? 'X' : 'YouTube'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {statusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  statusFilter === opt ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt === 'all' ? 'All' : opt}
              </button>
            ))}
          </div>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 border-0 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading bookmarks...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-gray-200">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">
                        {query ? `No bookmarks match "${query}".` : 'No bookmarks match your filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {filteredData.length} bookmark{filteredData.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showAdd && <AddBookmarkModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
