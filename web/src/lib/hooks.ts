'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Bookmark, DigestSettings, DigestSettingsUpdate, NotificationPreferences } from './types';

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

export function useRenameTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.topics.rename(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.topics.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
}

export function useDigestSettings() {
  return useQuery({
    queryKey: ['digest', 'settings'],
    queryFn: async () => (await api.digest.getSettings()).settings,
    retry: false,
  });
}

export function useUpdateDigestSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DigestSettingsUpdate) => (await api.digest.updateSettings(data)).settings,
    onSuccess: (settings: DigestSettings) => {
      queryClient.setQueryData(['digest', 'settings'], settings);
    },
  });
}

const PREFERENCES_KEY = ['preferences'] as const;

export function usePreferences() {
  return useQuery({
    queryKey: PREFERENCES_KEY,
    queryFn: async () => (await api.preferences.get()).preferences,
    retry: false,
  });
}

/** Optimistically patches notification preferences; reverts on error. */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => (await api.preferences.update(data)).preferences,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: PREFERENCES_KEY });
      const previous = queryClient.getQueryData<NotificationPreferences>(PREFERENCES_KEY);
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(PREFERENCES_KEY, { ...previous, ...data });
      }
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) queryClient.setQueryData(PREFERENCES_KEY, context.previous);
    },
    onSuccess: (prefs) => {
      queryClient.setQueryData(PREFERENCES_KEY, prefs);
    },
  });
}

export function useExtensionToken() {
  return useMutation({
    mutationFn: () => api.auth.extensionToken(),
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

/** The browser's IANA timezone, falling back to UTC. */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** All IANA timezones the runtime knows about, always including UTC and `ensure`. */
export function supportedTimezones(ensure?: string): string[] {
  let zones: string[] = [];
  try {
    const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
    zones = intl.supportedValuesOf ? intl.supportedValuesOf('timeZone') : [];
  } catch {
    zones = [];
  }
  const set = new Set(zones);
  set.add('UTC');
  if (ensure) set.add(ensure);
  return Array.from(set).sort();
}

/**
 * Shared behaviour for small popover menus (snooze / reminder):
 * click-outside closes, Escape closes and returns focus to the trigger,
 * arrow keys / Home / End move between [role="menuitem"] elements.
 */
export function useMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const items = useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []),
    []
  );

  const focusFirst = useCallback(() => {
    items()[0]?.focus();
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const onMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const list = items();
      const idx = list.indexOf(document.activeElement as HTMLElement);
      if (idx < 0 && e.key === 'Tab') return; // e.g. inside the custom date form
      let next = -1;
      if (e.key === 'ArrowDown') next = idx < 0 ? 0 : (idx + 1) % list.length;
      else if (e.key === 'ArrowUp') next = idx < 0 ? list.length - 1 : (idx - 1 + list.length) % list.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = list.length - 1;
      else if (e.key === 'Tab') {
        // Tabbing out of a menu closes it without stealing focus back.
        setOpen(false);
        return;
      }
      if (next >= 0 && list[next]) {
        e.preventDefault();
        list[next].focus();
      }
    },
    [items]
  );

  return { open, setOpen, close, rootRef, triggerRef, menuRef, focusFirst, onMenuKeyDown };
}
