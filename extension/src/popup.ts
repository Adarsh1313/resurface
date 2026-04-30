const WEB_BASE_URL = "http://localhost:3000";
const API_BASE_URL = "http://localhost:4000/v1";

interface PendingCapture {
  url: string;
  platform: "x" | "youtube";
  title: string;
  author: string;
  thumbnail_url?: string;
  suggestions: string[];
  suggestionsLoading: boolean;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section")!;
  const captureSection = document.getElementById("capture-section")!;
  const dashSection = document.getElementById("dash-section")!;

  const emailEl = document.getElementById("user-email")!;
  const savesEl = document.getElementById("saves-today")!;
  const tokenInput = document.getElementById("token-input") as HTMLTextAreaElement;
  const errorEl = document.getElementById("login-error")!;
  const pasteBtn = document.getElementById("paste-login-btn")!;
  const openBridgeBtn = document.getElementById("open-bridge-btn")!;
  const bridgeLink = document.getElementById("bridge-link") as HTMLAnchorElement;
  const logoutBtn = document.getElementById("logout-btn")!;
  const dashboardBtn = document.getElementById("dashboard-btn")!;

  // Capture elements
  const capPlatform = document.getElementById("capture-platform")!;
  const capTitle = document.getElementById("capture-title")!;
  const capAuthor = document.getElementById("capture-author")!;
  const capTopics = document.getElementById("capture-topics")!;
  const capTopicCustom = document.getElementById("topic-custom") as HTMLInputElement;
  // ─── Custom datetime picker ───────────────────────────────────────
  const dtTrigger = document.getElementById("dt-trigger") as HTMLButtonElement;
  const dtTriggerLabel = document.getElementById("dt-trigger-label")!;
  const dtTriggerClear = document.getElementById("dt-trigger-clear")!;
  const dtPanel = document.getElementById("dt-panel")!;
  const dtPrev = document.getElementById("dt-prev")!;
  const dtNext = document.getElementById("dt-next")!;
  const dtMonth = document.getElementById("dt-month")!;
  const dtGrid = document.getElementById("dt-grid")!;
  const dtHour = document.getElementById("dt-hour")!;
  const dtMin = document.getElementById("dt-min")!;
  const dtSet = document.getElementById("dt-set")!;

  let selectedDate: Date | null = null;
  // Viewing month/year (defaults to today)
  const today = new Date();
  let viewY = today.getFullYear();
  let viewM = today.getMonth();
  // Tentative selection inside the panel
  let tentDate: Date | null = null;
  let tentHour = 9;
  let tentMin = 0;

  function fmtDisplay(d: Date): string {
    const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const timeStr = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${dateStr} · ${timeStr}`;
  }
  function setSelectedDate(d: Date | null) {
    selectedDate = d;
    if (d) {
      dtTriggerLabel.textContent = fmtDisplay(d);
      dtTrigger.classList.add("active");
      dtTriggerClear.hidden = false;
    } else {
      dtTriggerLabel.textContent = "Set a reminder…";
      dtTrigger.classList.remove("active");
      dtTriggerClear.hidden = true;
    }
  }
  function renderCalendar() {
    const first = new Date(viewY, viewM, 1);
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    const startDow = first.getDay();
    dtMonth.textContent = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    dtGrid.innerHTML = "";
    ["S", "M", "T", "W", "T", "F", "S"].forEach((d) => {
      const el = document.createElement("div");
      el.className = "dow";
      el.textContent = d;
      dtGrid.appendChild(el);
    });
    // Leading blanks from previous month
    const prevDays = new Date(viewY, viewM, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const el = document.createElement("div");
      el.className = "day muted";
      el.textContent = String(prevDays - i);
      dtGrid.appendChild(el);
    }
    const now = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement("div");
      el.className = "day";
      el.textContent = String(d);
      const thisDay = new Date(viewY, viewM, d);
      if (
        thisDay.getFullYear() === now.getFullYear() &&
        thisDay.getMonth() === now.getMonth() &&
        thisDay.getDate() === now.getDate()
      ) {
        el.classList.add("today");
      }
      if (
        tentDate &&
        tentDate.getFullYear() === viewY &&
        tentDate.getMonth() === viewM &&
        tentDate.getDate() === d
      ) {
        el.classList.add("selected");
      }
      el.addEventListener("click", () => {
        tentDate = new Date(viewY, viewM, d);
        renderCalendar();
      });
      dtGrid.appendChild(el);
    }
  }
  function renderTime() {
    dtHour.innerHTML = "";
    dtMin.innerHTML = "";
    for (let h = 0; h < 24; h++) {
      const el = document.createElement("div");
      el.className = "opt" + (h === tentHour ? " selected" : "");
      el.textContent = String(h).padStart(2, "0");
      el.addEventListener("click", () => {
        tentHour = h;
        renderTime();
      });
      dtHour.appendChild(el);
    }
    for (let m = 0; m < 60; m += 5) {
      const el = document.createElement("div");
      el.className = "opt" + (m === tentMin ? " selected" : "");
      el.textContent = String(m).padStart(2, "0");
      el.addEventListener("click", () => {
        tentMin = m;
        renderTime();
      });
      dtMin.appendChild(el);
    }
    // Scroll selected into view
    requestAnimationFrame(() => {
      const hSel = dtHour.querySelector(".opt.selected") as HTMLElement | null;
      const mSel = dtMin.querySelector(".opt.selected") as HTMLElement | null;
      if (hSel) dtHour.scrollTop = hSel.offsetTop - 32;
      if (mSel) dtMin.scrollTop = mSel.offsetTop - 32;
    });
  }
  function openPanel() {
    // Seed from current selection or smart defaults
    const seed = selectedDate ?? new Date(Date.now() + 60 * 60 * 1000);
    tentDate = new Date(seed.getFullYear(), seed.getMonth(), seed.getDate());
    tentHour = seed.getHours();
    tentMin = Math.round(seed.getMinutes() / 5) * 5;
    if (tentMin === 60) { tentMin = 0; tentHour = (tentHour + 1) % 24; }
    viewY = tentDate.getFullYear();
    viewM = tentDate.getMonth();
    renderCalendar();
    renderTime();
    dtPanel.hidden = false;
  }
  function closePanel() { dtPanel.hidden = true; }

  dtTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dtPanel.hidden) openPanel(); else closePanel();
  });
  dtTriggerClear.addEventListener("click", (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    closePanel();
  });
  dtPrev.addEventListener("click", () => {
    viewM--; if (viewM < 0) { viewM = 11; viewY--; }
    renderCalendar();
  });
  dtNext.addEventListener("click", () => {
    viewM++; if (viewM > 11) { viewM = 0; viewY++; }
    renderCalendar();
  });
  dtSet.addEventListener("click", () => {
    if (!tentDate) return;
    const d = new Date(tentDate);
    d.setHours(tentHour, tentMin, 0, 0);
    setSelectedDate(d);
    closePanel();
  });
  // Quick presets
  dtPanel.querySelectorAll<HTMLButtonElement>(".qbtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const now = new Date();
      let d = new Date(now);
      switch (btn.dataset.quick) {
        case "1h": d = new Date(now.getTime() + 60 * 60 * 1000); break;
        case "tonight": d.setHours(20, 0, 0, 0); break;
        case "tomorrow": d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); break;
        case "weekend": {
          const dow = d.getDay();
          const delta = dow === 6 ? 0 : (6 - dow);
          d.setDate(d.getDate() + delta);
          d.setHours(10, 0, 0, 0);
          break;
        }
      }
      setSelectedDate(d);
      closePanel();
    });
  });
  // Stop clicks inside the panel from bubbling — otherwise the document-level
  // outside-click listener closes the panel right after we re-render (clicked
  // element gets detached, so dtPanel.contains(target) is false).
  dtPanel.addEventListener("click", (e) => e.stopPropagation());
  // Click outside to close
  document.addEventListener("click", (e) => {
    if (dtPanel.hidden) return;
    const target = e.target as Node;
    if (!dtPanel.contains(target) && !dtTrigger.contains(target)) closePanel();
  });
  const capError = document.getElementById("capture-error")!;
  const capSaveBtn = document.getElementById("capture-save-btn") as HTMLButtonElement;
  const capSkipBtn = document.getElementById("capture-skip-btn")!;
  const suggestStatus = document.getElementById("suggest-status")!;

  bridgeLink.href = `${WEB_BASE_URL}/extension`;

  function hideAll() {
    loginSection.style.display = "none";
    captureSection.style.display = "none";
    dashSection.style.display = "none";
  }
  function showLogin(err?: string) {
    hideAll();
    loginSection.style.display = "block";
    if (err) {
      errorEl.textContent = err;
      errorEl.style.display = "block";
    } else {
      errorEl.style.display = "none";
    }
  }
  function showDash(email: string, saves: number) {
    hideAll();
    dashSection.style.display = "block";
    emailEl.textContent = email;
    savesEl.textContent = String(saves);
  }

  // ─── Capture mode ────────────────────────────────────────────────
  const selectedTopics = new Set<string>();

  function renderTopicChips(suggestions: string[]) {
    capTopics.innerHTML = "";
    // Selected-first
    const all = Array.from(new Set([...selectedTopics, ...suggestions]));
    if (all.length === 0) {
      capTopics.innerHTML = '<span class="muted">No suggestions — type below to add.</span>';
      return;
    }
    all.forEach((name) => {
      const chip = document.createElement("span");
      chip.className = "chip" + (selectedTopics.has(name) ? " selected" : "");
      chip.textContent = name;
      if (selectedTopics.has(name)) {
        const x = document.createElement("span");
        x.className = "x";
        x.textContent = "×";
        chip.appendChild(x);
      }
      chip.addEventListener("click", () => {
        if (selectedTopics.has(name)) selectedTopics.delete(name);
        else selectedTopics.add(name);
        renderTopicChips(suggestions);
      });
      capTopics.appendChild(chip);
    });
  }

  function showCapture(pending: PendingCapture) {
    hideAll();
    captureSection.style.display = "block";
    capPlatform.textContent = pending.platform === "x" ? "X (Twitter)" : "YouTube";
    capPlatform.className = "platform-pill " + pending.platform;
    capTitle.textContent = pending.title || "(no title)";
    capAuthor.textContent = pending.author || "";

    // Auto-select the top suggestion if we have any (user can deselect)
    if (pending.suggestions.length && selectedTopics.size === 0) {
      selectedTopics.add(pending.suggestions[0]);
    }
    suggestStatus.textContent = pending.suggestionsLoading ? "(finding…)" : "";
    renderTopicChips(pending.suggestions);

    capSaveBtn.onclick = async () => {
      capError.style.display = "none";
      // Include any unsubmitted custom text
      const extra = capTopicCustom.value.trim();
      if (extra) selectedTopics.add(extra);

      const reminder_at = selectedDate ? selectedDate.toISOString() : undefined;

      capSaveBtn.disabled = true;
      capSaveBtn.textContent = "Saving…";
      chrome.runtime.sendMessage(
        {
          type: "SAVE_BOOKMARK",
          data: {
            url: pending.url,
            platform: pending.platform,
            title: pending.title,
            author: pending.author,
            thumbnail_url: pending.thumbnail_url,
            topic_names: Array.from(selectedTopics),
            reminder_at,
          },
        },
        (resp) => {
          if (resp?.success) {
            window.close();
          } else {
            capSaveBtn.disabled = false;
            capSaveBtn.textContent = "Save";
            capError.textContent = resp?.error || "Save failed.";
            capError.style.display = "block";
          }
        }
      );
    };

    capSkipBtn.onclick = () => {
      chrome.runtime.sendMessage({ type: "CLEAR_PENDING_CAPTURE" }, () => window.close());
    };

    capTopicCustom.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const v = capTopicCustom.value.trim();
        if (v) {
          selectedTopics.add(v);
          capTopicCustom.value = "";
          renderTopicChips(pending.suggestions);
        }
      }
    };
  }

  // Poll for suggestion updates while popup open (cheap, ~400ms)
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  function pollPending() {
    pollTimer = setInterval(() => {
      chrome.runtime.sendMessage({ type: "GET_PENDING_CAPTURE" }, (resp) => {
        const p = resp?.pendingCapture as PendingCapture | null;
        if (!p) return;
        if (!p.suggestionsLoading) {
          clearInterval(pollTimer!);
          pollTimer = null;
          suggestStatus.textContent = "";
          // If nothing selected yet, auto-pick top
          if (selectedTopics.size === 0 && p.suggestions.length) {
            selectedTopics.add(p.suggestions[0]);
          }
          renderTopicChips(p.suggestions);
        }
      });
    }, 500);
  }

  // ─── Entrypoint ──────────────────────────────────────────────────
  chrome.runtime.sendMessage({ type: "AUTH_STATUS" }, (authResp) => {
    if (!authResp?.loggedIn) {
      showLogin();
      return;
    }
    // Check for pending capture first
    chrome.runtime.sendMessage({ type: "GET_PENDING_CAPTURE" }, (resp) => {
      const p = resp?.pendingCapture as PendingCapture | null;
      if (p) {
        showCapture(p);
        if (p.suggestionsLoading) pollPending();
      } else {
        showDash(authResp.email ?? "User", authResp.savesToday ?? 0);
      }
    });
  });

  openBridgeBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: `${WEB_BASE_URL}/extension` });
  });

  pasteBtn.addEventListener("click", async () => {
    const token = tokenInput.value.trim();
    if (!token) {
      showLogin("Paste a token first.");
      return;
    }
    try {
      const resp = await fetch(`${API_BASE_URL}/topics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        showLogin(`Token rejected (${resp.status}).`);
        return;
      }
      let email = "User";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        email = payload.email || payload.sub || "User";
      } catch {}
      await chrome.storage.local.set({ token, userEmail: email });
      showDash(email, 0);
    } catch (e: any) {
      showLogin(`Could not reach API: ${e.message}`);
    }
  });

  logoutBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "LOGOUT" }, () => showLogin());
  });

  dashboardBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: `${WEB_BASE_URL}/dashboard` });
  });
});
