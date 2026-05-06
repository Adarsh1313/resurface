import { AuthResponse, PaginatedBookmarks, Bookmark, Topic, DashboardStats, AdminWaitlistResponse } from './types';
import { API_BASE_URL } from './config';

const BASE_URL = API_BASE_URL;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(body.error || body.message || res.statusText, res.status);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: { email: string; password: string; name: string; invite_token?: string }) =>
      apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    forgotPassword: (data: { email: string }) =>
      apiFetch<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (data: { token: string; password: string }) =>
      apiFetch<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  },
  bookmarks: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<PaginatedBookmarks>(`/bookmarks${qs}`);
    },
    create: (data: {
      url: string;
      platform: 'x' | 'youtube';
      title?: string;
      author?: string;
      thumbnail_url?: string;
      topic_names?: string[];
      notes?: string;
    }) => apiFetch<{ bookmark: Bookmark }>(`/bookmarks`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Pick<Bookmark, 'status' | 'notes'>> & { reminder_at?: string | null; topic_names?: string[] }) =>
      apiFetch<{ bookmark: Bookmark }>(`/bookmarks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/bookmarks/${id}`, { method: 'DELETE' }),
    restore: (id: string) =>
      apiFetch<{ bookmark: Bookmark }>(`/bookmarks/${id}/restore`, { method: 'POST' }),
    emptyTrash: () => apiFetch<void>(`/bookmarks/trash/empty`, { method: 'DELETE' }),
    snooze: (id: string, snoozed_until: string) =>
      apiFetch<{ bookmark: Bookmark }>(`/bookmarks/${id}/snooze`, { method: 'POST', body: JSON.stringify({ snoozed_until }) }),
    metadata: (url: string) =>
      apiFetch<{ platform: 'x' | 'youtube'; title: string; author: string; thumbnail_url: string }>(`/bookmarks/metadata?url=${encodeURIComponent(url)}`),
  },
  topics: {
    list: () => apiFetch<{ topics: Topic[] }>('/topics'),
  },
  stats: {
    dashboard: () => apiFetch<DashboardStats>('/stats/dashboard'),
  },
  digest: {
    preview: () => apiFetch<{ bookmarks: Bookmark[] }>(`/digest/preview`),
    sendNow: () => apiFetch<{ success: boolean; bookmarks_included: number; message?: string }>(`/digest/send-now`, { method: 'POST' }),
    settings: (data: { frequency?: number; is_active?: boolean; send_time?: string; days_of_week?: string }) =>
      apiFetch<{ settings: unknown }>(`/digest/settings`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  ai: {
    suggestTopic: (data: { title: string; platform: string; author?: string }) =>
      apiFetch<{ suggestions: string[] }>(`/ai/suggest-topic`, { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    waitlist: () => apiFetch<AdminWaitlistResponse>('/admin/waitlist'),
    inviteWaitlistEntry: (id: string) =>
      apiFetch<{ success: boolean; entry: unknown }>(`/admin/waitlist/${id}/invite`, { method: 'POST' }),
  },
};
