// Content script — detects bookmark actions on X/Twitter and YouTube,
// kicks the background worker (which seeds session storage + tries to
// open the action popup) and renders the in-page capture prompt at
// top-right so the user has a reliable anchor near the extension icon.

// prompt.js is loaded alongside us (see manifest content_scripts) and
// exposes window.__resurfaceShowCapturePrompt.

interface CaptureData {
  url: string;
  platform: "x" | "youtube";
  title: string;
  author: string;
  thumbnail_url?: string;
}

function sendCapture(data: CaptureData) {
  // Fire-and-forget to background: seeds pendingCapture + AI suggestions.
  chrome.runtime.sendMessage({ type: "CAPTURE_START", data }, () => {
    // ignore response
  });
  // Background handles the UI: it seeds pendingCapture and opens the
  // action popup anchored under the extension icon. No in-page overlay.
}

// ─── X/Twitter Detection ───────────────────────────────────────────

function isTwitter(): boolean {
  return location.hostname === "twitter.com" || location.hostname === "x.com";
}

function extractTweetData(bookmarkBtn: HTMLElement): CaptureData | null {
  const article = bookmarkBtn.closest("article");
  if (!article) return null;

  const statusLink = article.querySelector<HTMLAnchorElement>('a[href*="/status/"]');
  const url = statusLink
    ? `https://${location.hostname}${statusLink.getAttribute("href")}`
    : location.href;

  const tweetTextEl = article.querySelector('[data-testid="tweetText"]');
  const title = tweetTextEl ? tweetTextEl.textContent?.slice(0, 160) ?? "" : "";

  const handleLinks = article.querySelectorAll<HTMLAnchorElement>('a[role="link"]');
  let author = "";
  for (const link of handleLinks) {
    const href = link.getAttribute("href") ?? "";
    if (href.match(/^\/[A-Za-z0-9_]+$/) && !href.includes("/status/")) {
      author = "@" + href.slice(1);
      break;
    }
  }

  return { url, title, author, platform: "x" };
}

function observeTwitterBookmarks() {
  document.addEventListener(
    "click",
    (e) => {
      if (!isTwitter()) return;
      const target = e.target as HTMLElement;
      const bookmarkBtn = target.closest('[data-testid="bookmark"]');
      if (!bookmarkBtn) return;
      setTimeout(() => {
        const data = extractTweetData(bookmarkBtn as HTMLElement);
        if (data) sendCapture(data);
      }, 250);
    },
    true
  );
}

// ─── YouTube Detection ─────────────────────────────────────────────

function isYouTube(): boolean {
  return location.hostname === "www.youtube.com";
}

function getVideoId(): string | null {
  const match = location.href.match(/(?:\/watch\?v=|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function extractYouTubeData(): CaptureData | null {
  const videoId = getVideoId();
  if (!videoId) return null;

  const isShort = location.pathname.startsWith("/shorts/");
  const url = isShort
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;

  const titleEl =
    document.querySelector<HTMLElement>("h1.ytd-watch-metadata yt-formatted-string") ??
    document.querySelector<HTMLElement>("#title h1 yt-formatted-string") ??
    document.querySelector<HTMLElement>("h1.title");
  const title = titleEl?.textContent?.trim().slice(0, 160) ?? "";

  const channelEl = document.querySelector<HTMLAnchorElement>(
    "#channel-name a, ytd-channel-name a"
  );
  const authorName = channelEl?.textContent?.trim() ?? "";
  const author = authorName.startsWith("@") ? authorName : authorName ? authorName : "";

  const thumbnail_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return { url, title, author, thumbnail_url, platform: "youtube" };
}

function observeYouTubeSaves() {
  document.addEventListener(
    "click",
    (e) => {
      if (!isYouTube()) return;
      const target = e.target as HTMLElement;
      const btn = target.closest("button, ytd-button-renderer, yt-button-shape");
      if (!btn) return;
      const text = btn.textContent?.trim().toLowerCase() ?? "";
      const ariaLabel = btn.getAttribute("aria-label")?.toLowerCase() ?? "";
      const isSaveAction =
        text.includes("save") ||
        ariaLabel.includes("save") ||
        text.includes("watch later") ||
        ariaLabel.includes("watch later");
      if (!isSaveAction) return;
      setTimeout(() => {
        const data = extractYouTubeData();
        if (data) sendCapture(data);
      }, 300);
    },
    true
  );
}

if (isTwitter()) observeTwitterBookmarks();
if (isYouTube()) observeYouTubeSaves();
