# Algomon — Claude Context

## What This Is

Algomon is a **YouTube Algorithm Monitor** — a full-stack app that tracks and analyzes which videos YouTube recommends to the user over time.

## Components

| Component | Tech | Purpose |
|---|---|---|
| `extension/` | Chrome Extension (TypeScript, React, Webpack) | Scrapes YouTube recommendations, uploads to API |
| (root) | Next.js 15, Tailwind, Recharts, React Query, Cloudflare D1/Drizzle | Analytics dashboard + API routes |

## How Data Flows

1. **Extension content script** (`extension/src/content_script.ts`) runs on `youtube.com`, listens for scroll events
2. **`extension/src/scraper.ts`** extracts videos from the DOM, tagged by source:
   - `"home"` — `ytd-rich-item-renderer yt-lockup-view-model` (home feed)
   - `"sidebar"` — `ytd-watch-next-secondary-results-renderer yt-lockup-view-model` (watch page recommendations)
   - `"shorts"` — `ytm-shorts-lockup-view-model`
   - Both home and sidebar use the same inner selectors: `h3[title]`, `a.yt-lockup-metadata-view-model__title`, `a.yt-lockup-view-model__content-image`, `.ytThumbnailViewModelImage img`
   - All URLs are normalized via `normalizeYouTubeUrl()` — strips tracking params (e.g. `&pp=`), keeping only `?v=` for watch URLs and clean paths for shorts
3. POSTs batch to `POST /api/videos` with `source` field per video
4. **Watch tracking** — on `/watch` pages, polls `<video>.currentTime` every 2s. On SPA navigation away, sends `watched: true`, `watchSeconds`, `watchPercent` via `navigator.sendBeacon` (auth key passed as `?key=` query param since sendBeacon can't set headers)
5. **Next.js API route** upserts videos:
   - Recommendations → increments `timesSeen`, upserts `userVideoStats` row keyed by `(username, date, videoUrl, source)`
   - Watch events → increments `timesWatched` + `watchSeconds` on `videos`, separate `userVideoStats` row with `source: "watched"`
6. Words extracted from titles per-date + per-username
7. **Frontend** fetches from `/api/users/[username]/*` routes

## Database Schema (Cloudflare D1 / SQLite via Drizzle)

- **videos**: `{ url (PK), title, imageUrl, username, timesWatched, timesSeen, watchSeconds, tags, channelName, channelUrl, channelAvatarUrl }`
- **words**: `{ id, text, date, username, videoUrls (JSON), timesWatched, timesSeen }`
  - Unique on `(text, date, username)`
- **userVideoStats**: `{ id, username, date, videoUrl, source, timesWatched, timesSeen, watchSeconds }`
  - `source`: `"home"` | `"sidebar"` | `"shorts"` | `"watched"`
  - Unique on `(username, date, videoUrl, source)` — so the same video can have separate rows for being seen on home vs sidebar vs actually watched
- **videoRecommendations**: `{ id, recommendedVideoUrl, fromVideoUrl, username, date, timesSeen }`
  - Unique on `(recommendedVideoUrl, fromVideoUrl, username, date)` — tracks sidebar recommendation edges (video A → video B)
- **users**: `{ username (PK), name }`

Schema defined in `lib/db/schema.ts` (Drizzle ORM). Single flattened migration in `migrations/0000_init.sql`.

## API Endpoints

- `POST /api/videos` — ingest batch of videos from extension (also auto-creates user, normalizes URLs server-side)
- `GET /api/users` — list all known users
- `GET /api/users/[username]` — individual user profile
- `GET /api/users/[username]/videos` — all videos for a user
- `GET /api/users/[username]/words?date=&month=&limit=` — word frequencies
- `GET /api/users/[username]/stats/daily` — unique video counts per day
- `GET /api/users/[username]/stats/day-of-week` — avg videos by day of week
- `GET /api/users/[username]/stats/channels` — channel breakdown
- `GET /api/users/[username]/stats/source-distribution` — home vs sidebar vs shorts vs watched
- `GET /api/users/[username]/stats/recommendation-graph?limit=N` — video-to-video recommendation edges for force graph
- `GET /api/users/[username]/stats/tags-distribution` — top content tags
- `GET /api/users/[username]/stats/video-recurrence` — most persistent videos
- `GET /api/users/[username]/stats/word-trends?top=N` — top-N word trends over time
- `DELETE /api/users/[username]/data` — delete all data for a user

### API Route Tree

```
app/api/
  videos/route.ts              ← POST (extension ingest)
  users/
    route.ts                   ← GET all users
    [username]/
      route.ts                 ← GET user profile
      videos/route.ts
      words/route.ts
      stats/
        channels/route.ts
        daily/route.ts
        day-of-week/route.ts
        recommendation-graph/route.ts
        source-distribution/route.ts
        tags-distribution/route.ts
        video-recurrence/route.ts
        word-trends/route.ts
      data/route.ts            ← DELETE (wipe user data)
```

## User System

No passwords / real auth. The site shows a "Who are you?" picker on first visit (fetches `/api/users`), stores the chosen username in `localStorage`. All API calls are scoped to that username. The nav shows `@username` with a click-to-switch option. The extension still hardcodes its username in the payload — creating the user record on first ingest.

## Current Production Setup

- Domain: `algomon.app`
- Deployed on **Cloudflare Workers** via `@opennextjs/cloudflare`
- **Cloudflare D1** for the database
- API routes use `getCloudflareContext()` from `@opennextjs/cloudflare`
- Local dev requires `initOpenNextCloudflareForDev()` in `next.config.mjs` and `.dev.vars` with `API_SECRET`

## Key Files

- `extension/src/content_script.ts` — orchestration: scroll listener, watch time tracking, SPA nav handling
- `extension/src/scraper.ts` — DOM scraping by source (home/sidebar/shorts), URL normalization
- `extension/src/background.ts` — tab URL change notifications, DEV badge in dev mode
- `extension/webpack/webpack.dev.js` — dev build config (`API_BASE=http://localhost:3000`)
- `extension/webpack/webpack.prod.js` — prod build config (`API_BASE=https://algomon.app`)
- `extension/scripts/generate-icons.mjs` — generates extension PNG icons from shared SVG source
- `app/api/videos/route.ts` — video ingest (POST only, auth via `X-API-Key` header or `?key=` query param, server-side URL normalization)
- `app/api/users/[username]/` — all per-user endpoints
- `lib/db/schema.ts` — Drizzle schema (source of truth for DB structure)
- `lib/types.ts` — shared types including `VideoPayload` (sent by extension)
- `lib/api-routes.ts` — typed API route helpers used by frontend
- `migrations/0000_init.sql` — single flattened D1 migration (full schema)
- `components/user-context.tsx` — UserContext + useUser hook
- `components/user-picker.tsx` — "Who are you?" modal
- `examples/` — YouTube DOM snapshots used as reference for scraper selectors

## Development

```bash
# Start everything
./dev.sh

# Or individually:
npm run dev                  # Next.js dev server
cd extension && npm run build  # Extension
```

## Known Limitations / TODOs

- Word blacklist duplicated across extension and server
- YouTube SPA navigation doesn't always trigger seenUrls wipe correctly
- Word cloud hover shows iframes (should fetch video data instead)
- Videos table uses URL as PK — a video URL can only be owned by one username (first ingestor wins)
- `sendBeacon` auth uses `?key=` query param (can't set headers); consider a dedicated watch endpoint
- OG/Twitter image routes cannot use `runtime = "edge"` with `@opennextjs/cloudflare` (Cloudflare Workers are already edge)
