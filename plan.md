# YouTube Network Intercept Plan

Intercept YouTube's internal API calls via `chrome.webRequest` to get richer, more reliable data than DOM scraping alone. DOM scraping stays for recommendation discovery (what YouTube *shows* you). Network intercepts capture what the user *does* and what YouTube *thinks* about it.

Reference: `examples/youtube-internal-api.yaml` (OpenAPI spec), `examples/youtube-sitemap.xml` (raw Burp capture)

## Schema Changes

### New tables

**`watch_sessions`** — replaces watch time polling in content script
- `id`, `username`, `videoUrl`, `date`
- `feature` — YouTube's navigation classification (`g-high-rec`, `g-crec`, `autonav`, etc.)
- `autoplay` — boolean
- `subscribed` — boolean
- `muted` — boolean
- `startTime` — `st` param (seconds into video)
- `endTime` — `et` param (seconds into video)
- `duration` — `len` param (total video length)
- `isAd` — from `el=adunit` or `is_ad=1`
- `adFormat` — e.g. `15_6`, null if not ad
- `referrer`

**`search_queries`** — from `/youtubei/v1/search` and `/complete/search`
- `id`, `username`, `query`, `date`, `timestamp`

**`user_actions`** — likes, feedback, subscriptions in one table
- `id`, `username`, `date`, `timestamp`
- `action` — `like` | `unlike` | `not_interested` | `subscribe` | `unsubscribe`
- `videoUrl` — null for subscribe/unsubscribe
- `channelId` — null for like/unlike

### New columns on `videos` table
- `category` — e.g. "Education", "Gaming" (from `/youtubei/v1/player`)
- `publishDate` — ISO date
- `channelId` — `UCxxxxx` (more reliable than channelUrl)
- `viewCount` — YouTube's view count

## Phase 1 — Playback & watchtime intercepts (quick win)

Intercept `/api/stats/playback` and `/api/stats/watchtime`. These are GET requests with all data in query params — no body parsing needed.

### Extension changes
- [ ] Add `webRequest` permission to manifest
- [ ] Add `*://www.youtube.com/api/stats/*` to host permissions
- [ ] In background script, register `chrome.webRequest.onBeforeRequest` listener
- [ ] Parse query params from playback/watchtime URLs
- [ ] Forward parsed data to our API (or batch and send periodically)

### What this replaces
- Watch time polling (`setInterval` every 2s checking `<video>.currentTime`)
- `sendBeacon` flush on navigation
- `source: "watched"` rows in `userVideoStats`

### What this adds
- `feature` — YouTube's own navigation source classification
- `subscribed` — whether user is subscribed to the channel
- `autoplay` / `autonav` — intentional vs autoplay navigation
- `muted` — whether audio was muted
- `st`/`et` — exact time ranges watched (not polling approximation)
- `final=1` — definitive watch session end
- Ad detection via `el=adunit` and `is_ad=1`

### Data flow
1. Background script intercepts `playback`/`watchtime` GET requests
2. Parses `docid`, `feature`, `len`, `autoplay`, `subscribed`, `muted`, `st`, `et`, `final`, `el`, `is_ad` from query params
3. On `final=1` or `playback` event, sends to `POST /api/videos` (or new dedicated endpoint)
4. Server writes to `watch_sessions` table

## Phase 2 — Player metadata & ad tracking

Intercept `/youtubei/v1/player` responses and `/ptracking` requests.

### Extension changes
- [ ] Intercept `/youtubei/v1/player` — read JSON response body for `videoDetails` and `microformat`
- [ ] Extract: `title`, `channelId`, `keywords`, `category`, `publishDate`, `viewCount`, `author`
- [ ] Intercept `/ptracking` — parse `pltype` (content vs adpromoted), `video_id`
- [ ] Enrich `videos` table with category, publishDate, channelId, viewCount

### Considerations
- `/youtubei/v1/player` is a POST with protobuf request body — we only need the JSON *response*
- Need `webRequestBlocking` or response body interception (Manifest V2) — or use fetch interception in content script
- Category and publishDate enable new dashboard views (e.g. "what categories does YouTube recommend to you?")

## Phase 3 — User action tracking

Intercept search, likes, feedback, and subscription events.

### Extension changes
- [ ] `/youtubei/v1/search` — extract search query, write to `search_queries`
- [ ] `/complete/search` — capture autocomplete queries (from suggestqueries host)
- [ ] `/youtubei/v1/like/like` and `/like/removelike` — track likes/unlikes
- [ ] `/youtubei/v1/feedback` — track "not interested" / "don't recommend channel"
- [ ] `/youtubei/v1/subscription/subscribe` and `/unsubscribe` — track sub changes

### Dashboard additions
- [ ] Search frequency and trending searches
- [ ] Like patterns — what do you like vs what YouTube recommends?
- [ ] "Not interested" log — what did you reject?
- [ ] Subscription changes over time

## Manifest V2 vs V3 consideration

- `webRequest.onBeforeRequest` with request/response body access requires Manifest V2
- Manifest V3 uses `declarativeNetRequest` which can't read bodies
- Phase 1 only needs URL query params (works with both MV2 and MV3)
- Phase 2 needs response body reading (MV2 only, or use fetch monkey-patching in content script)
- Current extension is Manifest V2 — stay on V2 for now

## What stays as DOM scraping

- Home feed video discovery (what YouTube *shows* you before you click)
- Sidebar recommendation discovery
- Shorts discovery
- Click position tracking (which position in the feed was clicked)
- Channel avatar/thumbnail scraping
