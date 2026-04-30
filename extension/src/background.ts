const API_BASE = "http://localhost:4000/v1";

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

async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("token");
  return (result.token as string) ?? null;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function saveBookmark(data: {
  url: string;
  platform: string;
  title: string;
  author: string;
  thumbnail_url?: string;
  topic_names?: string[];
  reminder_at?: string;
}) {
  const resp = await fetch(`${API_BASE}/bookmarks`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  return resp.json();
}

async function fetchTopics() {
  const resp = await fetch(`${API_BASE}/topics`, { headers: await authHeaders() });
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const { topics } = await resp.json();
  await chrome.storage.local.set({ cachedTopics: topics });
  return topics;
}

async function suggestTopics(data: CaptureData): Promise<string[]> {
  try {
    const resp = await fetch(`${API_BASE}/ai/suggest-topic`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        title: data.title,
        platform: data.platform,
        author: data.author,
      }),
    });
    if (!resp.ok) return [];
    const j = await resp.json();
    return (j.suggestions as string[]) || [];
  } catch {
    return [];
  }
}

async function getAuthStatus() {
  const { token, userEmail, savesToday } = await chrome.storage.local.get([
    "token",
    "userEmail",
    "savesToday",
  ]);
  if (!token) return { loggedIn: false };
  return { loggedIn: true, email: userEmail, savesToday: savesToday ?? 0 };
}

async function startCapture(data: CaptureData) {
  // Stash immediately so the popup renders even before suggestions finish
  const pending: PendingCapture = { ...data, suggestions: [], suggestionsLoading: true };
  await chrome.storage.session.set({ pendingCapture: pending });

  // Try to pop the action popup anchored under the pinned icon
  try {
    // @ts-ignore — openPopup is Chrome 127+
    if (chrome.action.openPopup) await chrome.action.openPopup();
  } catch {
    // Fallback: badge the icon so the user knows to click it
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#6366f1" });
  }

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
        case "GET_PENDING_CAPTURE": {
          const { pendingCapture } = await chrome.storage.session.get("pendingCapture");
          sendResponse({ pendingCapture: pendingCapture ?? null });
          break;
        }
        case "CLEAR_PENDING_CAPTURE": {
          await chrome.storage.session.remove("pendingCapture");
          chrome.action.setBadgeText({ text: "" });
          sendResponse({ success: true });
          break;
        }
        case "SAVE_BOOKMARK": {
          const result = await saveBookmark(message.data);
          const { savesToday } = await chrome.storage.local.get("savesToday");
          await chrome.storage.local.set({
            savesToday: ((savesToday as number) ?? 0) + 1,
          });
          await chrome.storage.session.remove("pendingCapture");
          chrome.action.setBadgeText({ text: "" });
          sendResponse({ success: true, bookmark: result.bookmark });
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
            "cachedTopics",
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

chrome.storage.onChanged.addListener((changes) => {
  if (changes.token?.newValue) {
    fetchTopics().catch(() => {});
  }
});

chrome.alarms?.create("resetDaily", { periodInMinutes: 60 });
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetDaily") {
    const now = new Date();
    if (now.getHours() === 0) {
      chrome.storage.local.set({ savesToday: 0 });
    }
  }
});
