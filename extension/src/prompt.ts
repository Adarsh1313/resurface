// In-page capture prompt — anchored top-right, near the extension icon.
// Rendered via closed shadow DOM so host page styles can't bleed in.

interface PromptData {
  url: string;
  platform: "x" | "youtube";
  title: string;
  author: string;
  thumbnail_url?: string;
}

interface Topic {
  id: string;
  name: string;
}

const SUGGESTION_POLL_MS = 400;
const SUGGESTION_POLL_MAX = 20; // ~8s total

function showCapturePrompt(data: PromptData): void {
  const existing = document.getElementById("resurface-prompt-host");
  if (existing) existing.remove();

  const host = document.createElement("div");
  host.id = "resurface-prompt-host";
  const shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = getPromptCSS();
  shadow.appendChild(style);

  const modal = document.createElement("div");
  modal.className = "rs-modal";
  modal.innerHTML = `
    <div class="rs-header">
      <span class="rs-dot"></span>
      <span class="rs-header-title">Saved to Resurface</span>
      <span class="rs-wordmark">Resurface</span>
    </div>
    <div class="rs-platform-row">
      <span class="rs-platform rs-platform-${data.platform}">${
        data.platform === "x" ? "X" : "YouTube"
      }</span>
      ${data.author ? `<span class="rs-author">${escapeHTML(data.author)}</span>` : ""}
    </div>
    <div class="rs-title" title="${escapeAttr(data.title)}">${escapeHTML(
      data.title || "(untitled)"
    )}</div>
    <div class="rs-label">
      <span>Topics</span>
      <span class="rs-ai-pill" id="rs-ai-pill" style="display:none">AI suggested</span>
      <span class="rs-loading" id="rs-loading" style="display:none">thinking…</span>
    </div>
    <div class="rs-chip-row" id="rs-chip-row"></div>
    <input id="rs-topic-custom" class="rs-input" type="text" placeholder="Add your own and press Enter" />
    <div class="rs-label"><span>Reminder (optional)</span></div>
    <input id="rs-reminder" class="rs-input" type="datetime-local" />
    <div class="rs-error" id="rs-error" style="display:none"></div>
    <div class="rs-actions">
      <button class="rs-btn rs-btn-ghost" id="rs-btn-skip">Skip</button>
      <button class="rs-btn rs-btn-primary" id="rs-btn-save">Save</button>
    </div>
  `;
  shadow.appendChild(modal);
  document.body.appendChild(host);

  // ─── Topic chip state ─────────────────────────────────────
  const selected = new Set<string>();
  const chipRow = shadow.getElementById("rs-chip-row") as HTMLElement;
  const customInput = shadow.getElementById("rs-topic-custom") as HTMLInputElement;
  const aiPill = shadow.getElementById("rs-ai-pill") as HTMLElement;
  const loadingEl = shadow.getElementById("rs-loading") as HTMLElement;
  const errorEl = shadow.getElementById("rs-error") as HTMLElement;

  let knownNames: string[] = [];
  let autoSelectedFirst = false;

  function renderChips() {
    chipRow.innerHTML = "";
    knownNames.forEach((name) => {
      const chip = document.createElement("span");
      chip.className = "rs-chip" + (selected.has(name) ? " rs-chip-selected" : "");
      chip.textContent = name;
      chip.addEventListener("click", () => {
        if (selected.has(name)) selected.delete(name);
        else selected.add(name);
        renderChips();
      });
      chipRow.appendChild(chip);
    });
  }

  function mergeTopics(names: string[], opts: { autoSelect?: boolean } = {}) {
    let added = false;
    for (const n of names) {
      if (n && !knownNames.includes(n)) {
        knownNames.push(n);
        added = true;
      }
    }
    if (opts.autoSelect && !autoSelectedFirst && names[0]) {
      selected.add(names[0]);
      autoSelectedFirst = true;
    }
    if (added || opts.autoSelect) renderChips();
  }

  // Cached user topics first (instant)
  chrome.storage.local.get("cachedTopics", (result) => {
    if (Array.isArray(result.cachedTopics)) {
      mergeTopics((result.cachedTopics as Topic[]).map((t) => t.name));
    }
  });

  // Poll background for AI suggestions
  loadingEl.style.display = "";
  let polls = 0;
  const pollInterval = setInterval(() => {
    polls++;
    chrome.runtime.sendMessage({ type: "GET_PENDING_CAPTURE" }, (resp) => {
      const pending = resp?.pendingCapture;
      if (!pending) return;
      if (pending.suggestions?.length) {
        mergeTopics(pending.suggestions, { autoSelect: true });
        aiPill.style.display = "";
      }
      if (!pending.suggestionsLoading || polls >= SUGGESTION_POLL_MAX) {
        clearInterval(pollInterval);
        loadingEl.style.display = "none";
      }
    });
  }, SUGGESTION_POLL_MS);

  // Custom topic via Enter
  customInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = customInput.value.trim();
      if (val) {
        mergeTopics([val]);
        selected.add(val);
        renderChips();
        customInput.value = "";
      }
    }
  });

  // ─── Save / Skip ──────────────────────────────────────────
  function getReminder(): string | undefined {
    const el = shadow.getElementById("rs-reminder") as HTMLInputElement;
    if (!el?.value) return undefined;
    const d = new Date(el.value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  function save() {
    clearInterval(pollInterval);
    chrome.runtime.sendMessage(
      {
        type: "SAVE_BOOKMARK",
        data: {
          ...data,
          topic_names: Array.from(selected),
          reminder_at: getReminder(),
        },
      },
      (resp) => {
        if (resp?.error) {
          errorEl.textContent = resp.error;
          errorEl.style.display = "";
          return;
        }
        host.remove();
      }
    );
  }

  function skip() {
    clearInterval(pollInterval);
    chrome.runtime.sendMessage({ type: "CLEAR_PENDING_CAPTURE" });
    host.remove();
  }

  shadow.getElementById("rs-btn-save")!.addEventListener("click", save);
  shadow.getElementById("rs-btn-skip")!.addEventListener("click", skip);
}

function escapeHTML(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHTML(s).replace(/"/g, "&quot;");
}

function getPromptCSS(): string {
  return `
:host {
  all: initial;
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #f0ede8;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
.rs-modal {
  width: 320px;
  background: #161614;
  border: 0.5px solid rgba(255,255,255,0.10);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.20);
  padding: 16px;
  animation: rsIn 220ms cubic-bezier(0.2, 0, 0, 1);
}
@keyframes rsIn {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.rs-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px;
}
.rs-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #2dd4bf;
  box-shadow: 0 0 10px rgba(45,212,191,0.6);
}
.rs-header-title {
  font: 500 13px/1 inherit;
  letter-spacing: -0.01em;
  color: #f0ede8;
}
.rs-wordmark {
  margin-left: auto;
  font: 500 10px/1 inherit;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5e5b57;
}
.rs-platform-row {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 8px;
}
.rs-platform {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 100px;
  font: 500 10px/1.4 inherit;
  letter-spacing: 0.04em;
}
.rs-platform-x {
  background: rgba(255,255,255,0.07);
  color: #e7e4df;
  border: 0.5px solid rgba(255,255,255,0.12);
}
.rs-platform-youtube {
  background: rgba(255,64,64,0.10);
  color: #fca5a5;
  border: 0.5px solid rgba(255,64,64,0.18);
}
.rs-author {
  font: 400 11px/1 inherit;
  color: #9b9690;
}
.rs-title {
  font: 400 13px/1.45 inherit;
  color: #f0ede8;
  background: #1e1e1b;
  border: 0.5px solid rgba(255,255,255,0.06);
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  max-height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.rs-label {
  display: flex; align-items: center; gap: 6px;
  font: 500 10px/1 inherit;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5e5b57;
  margin-bottom: 6px;
  margin-top: 4px;
}
.rs-ai-pill {
  font: 500 9px/1 inherit;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 100px;
  background: rgba(45,212,191,0.10);
  color: #5eead4;
  border: 0.5px solid rgba(45,212,191,0.18);
  text-transform: uppercase;
}
.rs-loading {
  font: 400 10px/1 inherit;
  color: #5e5b57;
  text-transform: none;
  letter-spacing: 0;
  font-style: italic;
}
.rs-chip-row {
  display: flex; flex-wrap: wrap; gap: 4px;
  margin-bottom: 10px;
  min-height: 22px;
}
.rs-chip {
  display: inline-flex; align-items: center;
  padding: 4px 10px;
  border-radius: 100px;
  font: 500 11px/1 inherit;
  background: #1e1e1b;
  color: #9b9690;
  border: 0.5px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: color 150ms, background 150ms, border-color 150ms;
}
.rs-chip:hover {
  color: #f0ede8;
  border-color: rgba(255,255,255,0.10);
}
.rs-chip-selected {
  background: rgba(45,212,191,0.10);
  color: #5eead4;
  border-color: rgba(45,212,191,0.35);
}
.rs-input {
  width: 100%;
  padding: 9px 10px;
  background: #1e1e1b;
  color: #f0ede8;
  border: 0.5px solid rgba(255,255,255,0.10);
  border-radius: 8px;
  font: 400 12px/1.2 inherit;
  outline: none;
  margin-bottom: 8px;
}
.rs-input:focus {
  border-color: #2dd4bf;
  box-shadow: 0 0 0 3px rgba(45,212,191,0.15);
}
input[type="datetime-local"] { color-scheme: dark; }
.rs-actions {
  display: flex; gap: 8px; margin-top: 4px;
}
.rs-btn {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font: 500 13px/1 inherit;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.rs-btn-ghost {
  background: transparent;
  color: #9b9690;
  border: 0.5px solid rgba(255,255,255,0.10);
}
.rs-btn-ghost:hover {
  background: #252520;
  color: #f0ede8;
}
.rs-btn-primary {
  background: #2dd4bf;
  color: #042f2e;
}
.rs-btn-primary:hover {
  background: #5eead4;
}
.rs-error {
  font: 400 12px/1.4 inherit;
  color: #f87171;
  margin-bottom: 8px;
}
`;
}

// Expose globally so content.ts can call it (no module system).
(window as any).__resurfaceShowCapturePrompt = showCapturePrompt;
