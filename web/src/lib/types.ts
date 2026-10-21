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

export type DigestFrequency = 'daily' | 'weekly';

export interface DigestSettings {
  frequency: DigestFrequency;
  /** 0 = Sunday … 6 = Saturday */
  days_of_week: number[];
  /** 24h local time, "HH:MM" */
  send_time: string;
  /** IANA timezone, e.g. "Europe/Berlin" */
  timezone: string;
  is_active: boolean;
  last_sent_at: string | null;
}

export type DigestSettingsUpdate = Partial<Omit<DigestSettings, 'last_sent_at'>>;

export interface NotificationPreferences {
  digest_email: boolean;
  reminder_email: boolean;
  browser_notifications: boolean;
  product_updates: boolean;
}

export interface ExtensionTokenResponse {
  token: string;
  expires_at: string;
}
