'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Bookmark } from './types';

export function useBookmarks(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['bookmarks', params],
    queryFn: () => api.bookmarks.list(params),
  });
}

export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: () => api.topics.list(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.stats.dashboard(),
  });
}

export function useReviewBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.bookmarks.update(id, { status: 'reviewed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSnoozeBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return api.bookmarks.snooze(id, nextWeek.toISOString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.bookmarks.create>[0]) => api.bookmarks.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSendDigest() {
  return useMutation({
    mutationFn: () => api.digest.sendNow(),
  });
}

export function useRestoreBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.bookmarks.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSnoozeUntil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: Date }) =>
      api.bookmarks.snooze(id, until.toISOString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSetReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, at }: { id: string; at: Date | null }) =>
      api.bookmarks.update(id, { reminder_at: at ? at.toISOString() : null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useAdminWaitlist() {
  return useQuery({
    queryKey: ['admin', 'waitlist'],
    queryFn: () => api.admin.waitlist(),
    refetchInterval: 30000,
  });
}

export function useInviteWaitlistEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.inviteWaitlistEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'waitlist'] });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.bookmarks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function normalizeBookmark(b: Bookmark) {
  return {
    ...b,
    topics: b.topics || [],
  };
}

export function relativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}
