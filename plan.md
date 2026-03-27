# YouTube Network Intercept Plan

Intercept YouTube's internal API calls via `chrome.webRequest` to get richer, more reliable data than DOM scraping alone.

## Phase 1 — Background script setup
- [ ] Add `webRequest` + `webRequestBlocking` permissions to manifest
- [ ] Add `*://www.youtube.com/api/*` and `*://www.youtube.com/youtubei/*` to host permissions
- [ ] Register `chrome.webRequest.onCompleted` listener in background script
- [ ] Parse URL params and POST bodies, forward relevant data to content script or directly to API

## Phase 2 — Playback & watchtime signals
Intercept `/api/stats/playback` and `/api/stats/watchtime`:
- [ ] `docid` — video ID (more reliable than scraping `?v=` from URL)
- [ ] `feature` — how user got there (`g-high-rec`, `g-all-trending`, `g-crec`, etc.) — replaces our DOM-based source detection
- [ ] `len` — video duration (no need to poll `<video>.duration`)
- [ ] `subscribed` — whether user is subscribed to the channel
- [ ] `autoplay` — was this autoplayed vs intentionally navigated
- [ ] `st`/`et` — start/end time ranges actually watched
- [ ] `state` — playing/paused transitions
- [ ] `final=1` — definitively marks end of a watch session (replaces our flush heuristics)
- [ ] `referrer` — where they came from
- [ ] `muted` — whether audio was muted

## Phase 3 — Player metadata
Intercept `/youtubei/v1/player` (POST with JSON body):
- [ ] Full video metadata: title, channel, description, category, tags
- [ ] Video duration, publish date
- [ ] Could replace our title/tag scraping entirely

## Phase 4 — Ad tracking
Intercept `/ptracking` and playback calls with `adformat`/`is_ad=1`:
- [ ] Track which ads are shown (`pltype=adpromoted` vs `content`)
- [ ] Track ad video IDs and channels
- [ ] Surface ad frequency and patterns in dashboard

## Phase 5 — Schema & dashboard
- [ ] New `watch_sessions` table storing per-session data from intercepts
- [ ] Store `feature` (YouTube's navigation source) as a new dimension
- [ ] Dashboard: autoplay vs intentional, subscribed vs recommended, muted playback
- [ ] Replace/supplement existing watch tracking with intercept data

## Key `feature` values to track
| Value | Meaning |
|---|---|
| `g-high-rec` | High-confidence home recommendation |
| `g-crec` | Channel recommendation |
| `g-all-trending` | Trending |
| `autonav` | Autoplay next |

## Considerations
- `webRequest` is Manifest V2; Manifest V3 uses `declarativeNetRequest` which can't read bodies — may need to stay on MV2 or use `chrome.debugger` API
- POST bodies (e.g. `/youtubei/v1/player`) need `webRequestBlocking` to read
- YouTube may change these endpoints/params without notice
- Privacy: this captures detailed browsing behavior — document clearly
