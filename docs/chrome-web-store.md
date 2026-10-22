# Publishing the Resurface extension to the Chrome Web Store

Checklist for when we're ready to ship the extension beyond "Load unpacked".
Everything here is for **extension v1.1.0+** (`extension/manifest.json`).

## 0. Recommendation: publish as **Unlisted** first

Unlisted = installable by anyone with the link, not searchable. It goes through
the same review, so it validates the listing, permissions and privacy answers
without public exposure. Share the link with beta users, watch the capture-health
line in the popup for a couple of weeks, then flip visibility to Public (no
re-review of the code needed just for the visibility change).

## 1. One-time account setup

- [ ] Register at <https://chrome.google.com/webstore/devconsole> with the
      Google account that should own the listing (hard to transfer later; a
      Google Group as owner makes sharing easier).
- [ ] Pay the **one-time $5 developer registration fee**.
- [ ] Verify the contact email shown on the listing.
- [ ] (Optional) Verify ownership of the website domain in Search Console if
      you want the listing to show a verified publisher.

## 2. Build the upload zip

The zip must have `manifest.json` at its root and contain only what the
extension needs at runtime (no `src/`, `node_modules/`, `scripts/`).

```bash
cd extension
npm ci
npm run build            # production URLs — never upload a build:local build
npm test                 # rebuilds + runs the pure-logic tests

# Git Bash / macOS / Linux (needs `zip`)
rm -f resurface-extension.zip
zip -r resurface-extension.zip manifest.json popup.html dist icons/icon-*.png
```

PowerShell alternative:

```powershell
cd extension
npm run build
Compress-Archive -Force -Path manifest.json, popup.html, dist, icons\icon-*.png -DestinationPath resurface-extension.zip
```

Sanity checks before uploading:

- [ ] `grep -r localhost dist/` returns nothing (a `build:local` build would
      point at localhost).
- [ ] `manifest.json` `version` is bumped (the store rejects re-used versions).
- [ ] Load the unzipped folder via `chrome://extensions` → Load unpacked and do
      one X bookmark and one YouTube save end-to-end.

`extension/*.zip` is git-ignored.

## 3. Store listing assets

| Asset | Spec | Status |
| --- | --- | --- |
| Extension icon | 128×128 PNG (we ship `extension/icons/icon-128.png`) | done |
| Screenshots | **1280×800** (or 640×400) PNG/JPEG, 1–5 of them | todo |
| Small promo tile | **440×280** PNG/JPEG (required) | todo |
| Marquee promo tile | 1400×560 (optional, only for featuring) | optional |

Screenshot ideas: (1) bookmarking a post on X with the Resurface popup open,
(2) YouTube "Save" + topic suggestions, (3) the web dashboard grouped by topic,
(4) a reminder/digest. Use the demo account, not real personal data.

Source the icon/tile art from `extension/icons/icon.svg` (dark `#0f0f0e`
tile, teal `#2dd4bf` bookmark with an up-arrow).

## 4. Listing text

**Name:** Resurface

**Single purpose (required field):**

> Resurface saves the posts and videos you bookmark on X (Twitter) and YouTube
> to your Resurface account, organized by topic, so they can be resurfaced
> later with reminders and digests.

**Short description (≤132 chars):**

> Save X bookmarks and YouTube videos to Resurface, sorted by topic, and get reminded to actually read and watch them.

**Category:** Productivity. **Language:** English.

**Homepage URL:** https://github.com/Adarsh1313/resurface
(or the web app: https://resurface-web-eight.vercel.app)

**Support URL / email:** the developer contact email.

## 5. Privacy tab

**Privacy policy URL:** `https://resurface-web-eight.vercel.app/privacy`
— [ ] confirm the page is live before submitting (being built separately).

### Permission justifications

The manifest requests only these. Paste each justification into the matching box.

**`storage`**

> Stores the user's Resurface connection token, a cache of their topic names,
> saves that are waiting to be retried while offline, and a small local log of
> when captures last succeeded (shown in the popup so the user can tell if
> capture stops working). Nothing is shared with third parties.

**`alarms`**

> Retries saves that failed because the user was offline or the Resurface
> server was temporarily unavailable. A periodic alarm only exists while
> something is queued and is cleared once the queue is empty.

**Host access — content scripts on `x.com`, `twitter.com`, `www.youtube.com`**
(declared via `content_scripts.matches`; there are no `host_permissions`)

> The content script listens only for the user's own clicks on X's Bookmark
> button and YouTube's Save / Watch later buttons, then reads the URL, title
> and author of that one post or video so it can be saved to the user's
> Resurface account. It does not read anything else on the page, does not run
> on any other site and does not modify the page.

**Remote code:** **No.** All JavaScript ships in the package; the extension
only makes JSON API calls to the Resurface backend
(`https://resurface-nclr.onrender.com`).

Removed in 1.1.0 because they were unused: `activeTab`, `notifications`, and
the redundant `host_permissions` (the backend allows `chrome-extension://`
origins via CORS, so API calls don't need host permissions).

### Data usage disclosures (the "Data usage" checkboxes)

What the extension collects/transmits — tick these:

- [x] **Authentication information** — the Resurface API token the user pastes
      in (stored locally, sent only to the Resurface API).
- [x] **Website content** — title, author/channel, URL and thumbnail URL of the
      specific post/video the user chooses to bookmark/save.
- [x] **Web history** — *arguably*: the URLs of items the user explicitly saves.
      Tick it to be safe; reviewers tend to treat saved URLs as browsing data.

Leave unticked: personally identifiable information (the extension itself
does not collect name/email — those live in the web app account), health,
financial/payment, personal communications, location, user activity
(no click/keystroke/scroll monitoring beyond detecting the save click).

Certify all three statements (true for Resurface):

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

Note for the privacy policy: saved titles may be sent to an AI provider by
the backend to suggest topics. Make sure the policy at `/privacy` says so and
names the processor — that counts as part of the single purpose, not a sale,
but it has to be disclosed.

## 6. Distribution tab

- [ ] Visibility: **Unlisted** (see §0).
- [ ] Regions: all (or restrict while in beta).
- [ ] Pricing: free.

## 7. Submit & after review

- [ ] Submit for review (usually 1–3 days; first submissions and broad host
      access can take longer).
- [ ] After approval, note the **extension ID** — the web `/extension` pairing
      page and any `externally_connectable` setup will need it (unpacked
      builds have a different ID).
- [ ] For each update: bump `version`, rebuild, re-zip, upload, write a short
      "what changed" note. Permission changes trigger a warning prompt for
      existing users — avoid adding new ones casually.
