export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Bookmark {
  id: string;
  url: string;
  platform: 'x' | 'youtube';
  title: string;
  author: string;
  status: 'pending' | 'reviewed' | 'snoozed';
  saved_at: string;
  thumbnail_url?: string;
  topics?: Topic[];
  reminder_at?: string | null;
  snoozed_until?: string | null;
  notes?: string | null;
  deleted_at?: string | null;
}

export interface DashboardStats {
  saved_this_week: number;
  saved_last_week: number;
  pending_review: number;
  top_topic: string | { id: string; name: string; count: number };
  review_streak_weeks: number;
  platform_breakdown: Record<string, number>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedBookmarks {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  limit: number;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  source?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  ip?: string | null;
  status: 'pending' | 'invited';
  invite_token?: string | null;
  invited_at?: string | null;
  created_at: string;
}

export interface AdminWaitlistResponse {
  entries: WaitlistEntry[];
  counts: {
    total: number;
    pending: number;
    invited: number;
    users: number;
  };
}
