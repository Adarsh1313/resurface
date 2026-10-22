// MV3 service worker. It can be killed at any moment and restarted on the next
// event, so all durable state lives in chrome.storage and all scheduling goes
// through chrome.alarms. Listeners are registered synchronously at top level.
//
// chrome.storage.local keys:
//   token, userEmail        paired API token (session or extension JWT)
//   authExpired             true after any API call returned 401
//   savesToday, savesDate   per-day save counter
//   cachedTopics            last fetched topics
//   saveQueue               RsQueuedSave[] — saves waiting to be retried
//   captureHealth           RsCaptureHealth — last capture/save per platform + last error
// chrome.storage.session:
//   pendingCapture          capture waiting for the popup

declare function importScripts(...urls: string[]): void;
importScripts("shared.js"); // resolved relative to dist/background.js

const FLUSH_ALARM = "flushQueue";

interface CaptureData {
  url: string;
  platform: "x" | "youtube";
  title: string;
  author: string;
  thumbnail_url?: string;
}

interface PendingCapture extends CaptureData {
  suggestions: string[];
  suggestionsLoading: boolean;
}

// ─── Auth + API ────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("token");
  return (result.token as string) ?? null;
}

/**
 * fetch() against the API with the stored token. Throws on network errors
 * (TypeError). Any 401 means the stored token is dead: clear it and flag the
 * popup/badge so the user reconnects instead of silently losing captures.
 */
async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const resp = await fetch(`${RS_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (resp.status === 401 && token) await handleUnauthorized(token);
  return resp;
}

async function handleUnauthorized(rejectedToken: string) {
  // Only clear if the user hasn't re-paired with a new token in the meantime.
  if ((await getToken()) !== rejectedToken) return;
  await chrome.storage.local.remove("token");
  await chrome.storage.local.set({ authExpired: true });
  await recordError("Connection expired — reconnect the extension");
}

/** Exchange a (7-day) session token for a 180-day extension token, if possible. */
async function upgradeTokenIfNeeded() {
  const token = await getToken();
  if (!token || rsIsExtensionToken(token)) return;
  try {
    const resp = await apiFetch("/auth/extension-token", { method: "POST" });
    if (!resp.ok) return;
    const { token: ext } = await resp.json();
    if (typeof ext === "string" && (await getToken()) === token) {
      await chrome.storage.local.set({ token: ext });
    }
  } catch {
    // Older backend or offline: keep the session token.
  }
}

// ─── Capture health log ────────────────────────────────────────────

async function getHealth(): Promise<RsCaptureHealth> {
  const { captureHealth } = await chrome.storage.local.get("captureHealth");
  const h = (captureHealth as RsCaptureHealth | undefined) ?? { lastCapture: {}, lastSaved: {} };
  h.lastCapture ??= {};
  h.lastSaved ??= {};
  return h;
}

// Serialise read-modify-write of storage within this worker instance.
let storageChain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const next = storageChain.then(fn, fn);
  storageChain = next.catch(() => {});
  return next;
}

function updateHealth(fn: (h: RsCaptureHealth) => void) {
  return serial(async () => {
    const h = await getHealth();
    fn(h);
    await chrome.storage.local.set({ captureHealth: h });
  });
}

function recordCapture(platform: RsPlatform) {
  return updateHealth((h) => (h.lastCapture[platform] = Date.now()));
}
function recordSaved(platform: RsPlatform) {
  return updateHealth((h) => (h.lastSaved[platform] = Date.now()));
}
function recordError(message: string, platform?: RsPlatform) {
  return updateHealth((h) => (h.lastError = { at: Date.now(), platform, message }));
}

// ─── Save queue ────────────────────────────────────────────────────

async function getQueue(): Promise<RsQueuedSave[]> {
  const { saveQueue } = await chrome.storage.local.get("saveQueue");
  return Array.isArray(saveQueue) ? (saveQueue as RsQueuedSave[]) : [];
}

function mutateQueue(fn: (q: RsQueuedSave[]) => RsQueuedSave[]) {
  return serial(async () => {
    const next = fn(await getQueue());
    await chrome.storage.local.set({ saveQueue: next });
    await syncFlushAlarm(next.length);
    return next;
  });
}

/** Keep the retry alarm only while something is queued (fewer worker wake-ups). */
async function syncFlushAlarm(queueLength: number) {
  const existing = await chrome.alarms.get(FLUSH_ALARM);
  if (queueLength > 0 && !existing) {
    await chrome.alarms.create(FLUSH_ALARM, {
      delayInMinutes: RS_RETRY_MINUTES,
      periodInMinutes: RS_RETRY_MINUTES,
    });
  } else if (queueLength === 0 && existing) {
    await chrome.alarms.clear(FLUSH_ALARM);
  }
}

async function bumpSavesToday() {
  await serial(async () => {
    const today = rsLocalDateKey(new Date());
    const { savesToday, savesDate } = await chrome.storage.local.get(["savesToday", "savesDate"]);
    const count = savesDate === today ? ((savesToday as number) ?? 0) : 0;
    await chrome.storage.local.set({ savesToday: count + 1, savesDate: today });
  });
}

type SaveOutcome =
  | { kind: "saved"; bookmark: unknown }
  | { kind: "auth" }
  | { kind: "retry"; error: string }
  | { kind: "drop"; error: string };

async function postBookmark(data: RsSavePayload): Promise<SaveOutcome> {
  let resp: Response;
  try {
    resp = await apiFetch("/bookmarks", { method: "POST", body: JSON.stringify(data) });
  } catch (err: any) {
    return { kind: "retry", error: `Network error: ${err?.message ?? "offline"}` };
  }
  if (resp.ok) {
    const json = await resp.json().catch(() => ({}));
    return { kind: "saved", bookmark: json.bookmark };
  }
  const body = await resp.json().catch(() => null);
  const error = `API error ${resp.status}${body?.error ? `: ${body.error}` : ""}`;
  const kind = rsClassifyFailure(resp.status);
  return kind === "auth" ? { kind } : { kind, error };
}

/** Save now; on network/5xx (or a dead token) queue for retry instead of losing it. */
async function saveOrQueue(data: RsSavePayload) {
  const outcome = await postBookmark(data);
  switch (outcome.kind) {
    case "saved":
      await recordSaved(data.platform);
      await bumpSavesToday();
      if ((await getQueue()).some((i) => i.data.url === data.url)) {
        await mutateQueue((q) => q.filter((i) => i.data.url !== data.url));
      }
      // Good moment to drain anything that failed earlier.
      flushQueue().catch(() => {});
      return { success: true, bookmark: outcome.bookmark };
    case "retry":
      await mutateQueue((q) => rsEnqueue(q, data, outcome.error, Date.now()));
      await recordError(`Save queued for retry (${outcome.error})`, data.platform);
      return { success: true, queued: true };
    case "auth":
      // Held until the user reconnects; flushed when a new token is stored.
      await mutateQueue((q) => rsEnqueue(q, data, "Waiting for reconnect", Date.now()));
      return { success: true, queued: true, authExpired: true };
    case "drop":
      await recordError(`Save rejected (${outcome.error})`, data.platform);
      throw new Error(outcome.error);
  }
}

// One flush at a time per worker instance (the guard need not survive a restart).
let flushing: Promise<void> | null = null;
function flushQueue(): Promise<void> {
  if (!flushing) flushing = doFlush().finally(() => (flushing = null));
  return flushing;
}

async function doFlush() {
  const { keep, expired } = rsPruneQueue(await getQueue(), Date.now());
  if (expired.length) {
    const urls = new Set(expired.map((e) => e.data.url));
    await mutateQueue((q) => q.filter((i) => !urls.has(i.data.url)));
    await recordError(`Gave up on ${expired.length} save(s) queued over 14 days`);
  }
  if (!keep.length || !(await getToken())) return;

  for (const item of keep) {
    const outcome = await postBookmark(item.data);
    const url = item.data.url;
    if (outcome.kind === "saved") {
      await mutateQueue((q) => q.filter((i) => i.data.url !== url));
      await recordSaved(item.data.platform);
      await bumpSavesToday();
    } else if (outcome.kind === "drop") {
      await mutateQueue((q) => q.filter((i) => i.data.url !== url));
      await recordError(`Queued save rejected (${outcome.error})`, item.data.platform);
    } else if (outcome.kind === "retry") {
      await mutateQueue((q) =>
        q.map((i) => (i.data.url === url ? { ...i, attempts: i.attempts + 1, lastError: outcome.error } : i))
      );
      // Still offline / server down — no point hammering the rest now.
      return;
    } else {
      return; // 401: token was cleared; resume after reconnect.
    }
  }
}

// ─── Topics / suggestions ──────────────────────────────────────────

async function fetchTopics() {
  const resp = await apiFetch("/topics");
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const { topics } = await resp.json();
  await chrome.storage.local.set({ cachedTopics: topics });
  return topics;
}

async function suggestTopics(data: CaptureData): Promise<string[]> {
  try {
    const resp = await apiFetch("/ai/suggest-topic", {
      method: "POST",
      body: JSON.stringify({ title: data.title, platform: data.platform, author: data.author }),
    });
    if (!resp.ok) return [];
    const j = await resp.json();
    return (j.suggestions as string[]) || [];
  } catch {
    return [];
  }
}

// ─── Status for the popup ──────────────────────────────────────────

async function getAuthStatus() {
  const s = await chrome.storage.local.get([
    "token",
    "userEmail",
    "savesToday",
    "savesDate",
    "authExpired",
    "saveQueue",
    "captureHealth",
  ]);
  const queueCount = Array.isArray(s.saveQueue) ? s.saveQueue.length : 0;
  const common = {
    authExpired: !!s.authExpired,
    queueCount,
    captureHealth: (s.captureHealth as RsCaptureHealth | undefined) ?? null,
  };
  if (!s.token) return { loggedIn: false, ...common };
  return {
    loggedIn: true,
    ...common,
    email: s.userEmail,
    savesToday: s.savesDate === rsLocalDateKey(new Date()) ? ((s.savesToday as number) ?? 0) : 0,
    tokenExpiresAt: rsTokenExpiry(s.token as string),
    tokenKind: rsIsExtensionToken(s.token as string) ? "extension" : "session",
  };
}

// ─── Badge ─────────────────────────────────────────────────────────
// Derived from storage every time so it is correct after a worker restart.
// Priority: reconnect needed (red "!") > capture waiting (indigo "!") > queued count.

async function updateBadge() {
  const { authExpired, saveQueue } = await chrome.storage.local.get(["authExpired", "saveQueue"]);
  const { pendingCapture } = await chrome.storage.session.get("pendingCapture");
  const queued = Array.isArray(saveQueue) ? saveQueue.length : 0;
  let text = "";
  let color = "#6366f1";
  let title = "Resurface";
  if (authExpired) {
    text = "!";
    color = "#ef4444";
    title = "Resurface — reconnect needed";
  } else if (pendingCapture) {
    text = "!";
  } else if (queued) {
    text = String(Math.min(queued, 99));
    color = "#f59e0b";
    title = `Resurface — ${queued} save(s) waiting to sync`;
  }
  await chrome.action.setBadgeText({ text });
  if (text) await chrome.action.setBadgeBackgroundColor({ color });
  await chrome.action.setTitle({ title });
}

// ─── Capture flow ──────────────────────────────────────────────────

async function startCapture(data: CaptureData) {
  await recordCapture(data.platform);
  // Stash immediately so the popup renders even before suggestions finish
  const pending: PendingCapture = { ...data, suggestions: [], suggestionsLoading: true };
  await chrome.storage.session.set({ pendingCapture: pending });

  // Try to pop the action popup anchored under the pinned icon. If it can't
  // open, the badge (set from pendingCapture via storage.onChanged) tells the
  // user to click the icon.
  try {
    // @ts-ignore — openPopup is Chrome 127+
    if (chrome.action.openPopup) await chrome.action.openPopup();
  } catch {}

  // Fetch topic suggestions in parallel; popup polls storage.
  const suggestions = await suggestTopics(data);
  await chrome.storage.session.set({
    pendingCapture: { ...pending, suggestions, suggestionsLoading: false },
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case "CAPTURE_START": {
          await startCapture(message.data as CaptureData);
          sendResponse({ success: true });
          break;
        }
        case "CAPTURE_ERROR": {
          // Content script saw a save/bookmark click but couldn't extract the
          // item — usually means X/YouTube changed their DOM.
          await recordError(String(message.message ?? "Capture failed"), message.platform);
          sendResponse({ success: true });
          break;
        }
        case "GET_PENDING_CAPTURE": {
          const { pendingCapture } = await chrome.storage.session.get("pendingCapture");
          sendResponse({ pendingCapture: pendingCapture ?? null });
          break;
        }
        case "CLEAR_PENDING_CAPTURE": {
          await chrome.storage.session.remove("pendingCapture");
          sendResponse({ success: true });
          break;
        }
        case "SAVE_BOOKMARK": {
          const result = await saveOrQueue(message.data as RsSavePayload);
          await chrome.storage.session.remove("pendingCapture");
          sendResponse(result);
          break;
        }
        case "FLUSH_QUEUE": {
          await flushQueue();
          sendResponse({ success: true, queueCount: (await getQueue()).length });
          break;
        }
        case "GET_TOPICS": {
          const topics = await fetchTopics();
          sendResponse({ topics });
          break;
        }
        case "AUTH_STATUS": {
          sendResponse(await getAuthStatus());
          break;
        }
        case "LOGOUT": {
          await chrome.storage.local.remove([
            "token",
            "userEmail",
            "savesToday",
            "savesDate",
            "cachedTopics",
            "authExpired",
          ]);
          sendResponse({ success: true });
          break;
        }
        default:
          sendResponse({ error: "Unknown message type" });
      }
    } catch (err: any) {
      sendResponse({ error: err.message });
    }
  })();
  return true;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.token?.newValue) {
    // Newly paired (popup paste or web bridge): clear the reconnect state,
    // upgrade to a long-lived token if needed, and drain held saves.
    (async () => {
      await chrome.storage.local.remove("authExpired");
      await upgradeTokenIfNeeded();
      fetchTopics().catch(() => {});
      await flushQueue();
    })().catch(() => {});
  }
  if (
    (area === "local" && (changes.authExpired || changes.saveQueue)) ||
    (area === "session" && changes.pendingCapture)
  ) {
    updateBadge().catch(() => {});
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === FLUSH_ALARM) flushQueue().catch(() => {});
});

async function onWake() {
  await chrome.alarms.clear("resetDaily"); // legacy alarm from 1.0.x
  await syncFlushAlarm((await getQueue()).length);
  await updateBadge();
  await upgradeTokenIfNeeded();
  await flushQueue();
}

chrome.runtime.onStartup.addListener(() => {
  onWake().catch(() => {});
});
chrome.runtime.onInstalled.addListener(() => {
  onWake().catch(() => {});
});
