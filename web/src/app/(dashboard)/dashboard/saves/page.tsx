'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  CheckCircle2,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  useBookmarks,
  useReviewBookmark,
  useDeleteBookmark,
  normalizeBookmark,
  relativeTime,
} from '@/lib/hooks';
import { Inbox } from 'lucide-react';
import { SnoozeMenu } from '@/components/SnoozeMenu';
import { ReminderMenu } from '@/components/ReminderMenu';
import { TopicChips } from '@/components/TopicChips';
import { PlatformPill } from '@/components/PlatformPill';
import { StatusPill } from '@/components/StatusPill';
import { EmptyState } from '@/components/EmptyState';

type Row = ReturnType<typeof normalizeBookmark>;
const columnHelper = createColumnHelper<Row>();

export default function AllSavesPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'saved_at', desc: true }]);
  const { data, isLoading } = useBookmarks({ limit: '100' });
  const review = useReviewBookmark();
  const del = useDeleteBookmark();

  const bookmarks = useMemo(() => (data?.bookmarks || []).map(normalizeBookmark), [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div>
            <a
              href={info.row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {info.getValue()}
            </a>
            <p className="text-xs text-gray-500">{info.row.original.author}</p>
          </div>
        ),
      }),
      columnHelper.accessor('platform', {
        header: 'Platform',
        cell: (info) => <PlatformPill platform={info.getValue()} size="xs" />,
      }),
      columnHelper.display({
        id: 'topics',
        header: 'Topics',
        cell: ({ row }) => <TopicChips topics={row.original.topics} size="xs" />,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusPill status={info.getValue()} size="xs" />,
      }),
      columnHelper.accessor('saved_at', {
        header: 'Saved',
        cell: (info) => <span className="text-sm text-gray-500">{relativeTime(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => review.mutate(row.original.id)}
              disabled={row.original.status === 'reviewed'}
              className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Mark reviewed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <SnoozeMenu bookmarkId={row.original.id} />
            <ReminderMenu bookmarkId={row.original.id} hasReminder={!!row.original.reminder_at} />
            <button
              onClick={() => del.mutate(row.original.id)}
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
              title="Move to trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <a
              href={row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"
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
    data: bookmarks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Saves</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? 'Loading...' : `${bookmarks.length} bookmarks saved`}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : bookmarks.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing saved yet"
            body="Install the extension and bookmark something on X or YouTube — it'll show up here."
          />
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
