// Shared constants + pure helpers. Compiled to dist/shared.js and loaded as a
// classic script by both the service worker (importScripts) and the popup
// (<script>). No chrome.* calls in here so it can be unit-tested in Node
// (see scripts/test-shared.mjs).
//
// URLs are written as production values; `npm run build:local` rewrites them
// in dist/*.js (see scripts/build.mjs), so keep every URL constant here or in
// another src/*.ts file and never construct the hosts dynamically.

const RS_API_BASE = "https://resurface-nclr.onrender.com/v1";
const RS_WEB_BASE = "https://resurface-web-eight.vercel.app";
const RS_PAIRING_URL = `${RS_WEB_BASE}/extension`;

/** Warn in the popup when the paired token expires within this many days. */
const RS_EXPIRY_WARN_DAYS = 14;
/** Retry cadence for queued saves (chrome.alarms minimum is 0.5 min). */
const RS_RETRY_MINUTES = 5;
/** Queued saves older than this are dropped (and logged as an error). */
const RS_QUEUE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const RS_QUEUE_MAX_ITEMS = 200;

type RsPlatform = "x" | "youtube";

interface RsSavePayload {
  url: string;
  platform: RsPlatform;
  title: string;
  author: string;
  thumbnail_url?: string;
  topic_names?: string[];
  reminder_at?: string;
}

interface RsQueuedSave {
  data: RsSavePayload;
  queuedAt: number;
  attempts: number;
  lastError?: string;
}

interface RsCaptureHealth {
  /** Last time the content script detected + extracted a capture, per platform. */
  lastCapture: Partial<Record<RsPlatform, number>>;
  /** Last time a save reached the API, per platform. */
  lastSaved: Partial<Record<RsPlatform, number>>;
  lastError?: { at: number; platform?: RsPlatform; message: string };
}

const RS_PLATFORM_LABEL: Record<RsPlatform, string> = { x: "X", youtube: "YouTube" };

/** Decode a JWT payload (base64url) without verifying it. */
function rsDecodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    let b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(
      Array.from(atob(b64), (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

/** Token expiry in ms since epoch, or null if the token has no readable exp. */
function rsTokenExpiry(token: string): number | null {
  const exp = rsDecodeJwtPayload(token)?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
}

function rsIsExtensionToken(token: string): boolean {
  return rsDecodeJwtPayload(token)?.kind === "extension";
}

/**
 * What to do with a failed save.
 *  - "auth":  401 — token is dead; keep the save queued until the user reconnects.
 *  - "retry": network error (status null), 5xx, 408 or 429 — queue and retry.
 *  - "drop":  other 4xx — the request itself is bad; retrying won't help.
 */
function rsClassifyFailure(status: number | null): "auth" | "retry" | "drop" {
  if (status === null) return "retry";
  if (status === 401) return "auth";
  if (status >= 500 || status === 408 || status === 429) return "retry";
  return "drop";
}

/** Add a save to the queue, deduped by URL (newer data wins, original queuedAt kept). */
function rsEnqueue(queue: RsQueuedSave[], data: RsSavePayload, error: string, now: number): RsQueuedSave[] {
  const existing = queue.find((q) => q.data.url === data.url);
  const rest = queue.filter((q) => q.data.url !== data.url);
  const item: RsQueuedSave = {
    data,
    queuedAt: existing?.queuedAt ?? now,
    attempts: existing?.attempts ?? 0,
    lastError: error,
  };
  return [...rest, item].slice(-RS_QUEUE_MAX_ITEMS);
}

/** Split a queue into items still worth retrying and ones that are too old. */
function rsPruneQueue(queue: RsQueuedSave[], now: number): { keep: RsQueuedSave[]; expired: RsQueuedSave[] } {
  const keep: RsQueuedSave[] = [];
  const expired: RsQueuedSave[] = [];
  for (const q of queue) (now - q.queuedAt > RS_QUEUE_MAX_AGE_MS ? expired : keep).push(q);
  return { keep, expired };
}

/** "just now", "5m ago", "2h ago", "3d ago". */
function rsFormatAgo(then: number, now: number): string {
  const s = Math.max(0, Math.floor((now - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** "Last capture: X 2h ago · YouTube 1d ago" (or a "no captures yet" hint). */
function rsHealthSummary(health: RsCaptureHealth | undefined, now: number): string {
  const parts = (Object.keys(RS_PLATFORM_LABEL) as RsPlatform[])
    .filter((p) => health?.lastCapture?.[p])
    .map((p) => `${RS_PLATFORM_LABEL[p]} ${rsFormatAgo(health!.lastCapture[p]!, now)}`);
  return parts.length ? `Last capture: ${parts.join(" · ")}` : "No captures yet";
}

/**
 * The last error, if it is still relevant: recent (7d) and not followed by a
 * successful save on that platform.
 */
function rsRelevantError(health: RsCaptureHealth | undefined, now: number): string | null {
  const err = health?.lastError;
  if (!err || now - err.at > 7 * 24 * 60 * 60 * 1000) return null;
  const saved = health!.lastSaved ?? {};
  const lastOk = err.platform ? saved[err.platform] ?? 0 : Math.max(0, ...Object.values(saved).map(Number));
  if (lastOk > err.at) return null;
  const label = err.platform ? `${RS_PLATFORM_LABEL[err.platform]}: ` : "";
  return `${label}${err.message} (${rsFormatAgo(err.at, now)})`;
}

/** Days until `expiry` (rounded down), negative once expired. */
function rsDaysLeft(expiry: number, now: number): number {
  return Math.floor((expiry - now) / (24 * 60 * 60 * 1000));
}

/** Local calendar day key, used to reset the "saves today" counter. */
function rsLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
