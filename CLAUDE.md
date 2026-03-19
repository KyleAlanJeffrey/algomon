# Algomon — Claude Context

## What This Is

Algomon is a **YouTube Algorithm Monitor** — a full-stack app that tracks and analyzes which videos YouTube recommends to the user over time.

## Components

| Component | Tech | Purpose |
|---|---|---|
| `extension/` | Chrome Extension (TypeScript, React, Dexie) | Scrapes YouTube recommendations, uploads to API |
| `web/` | Next.js 14, Tailwind, Recharts, React Query, Cloudflare D1/Drizzle | Analytics dashboard + API routes |

## How Data Flows

1. **Extension content script** runs on `youtube.com`, listens for scroll events
2. Extracts video titles/URLs/images from DOM (`ytd-compact-video-renderer`, `ytd-rich-item-renderer`)
3. Stores in local **IndexedDB (Dexie)**, then POSTs to `POST /api/videos` every second
4. **Next.js API route** upserts videos, increments `timesSeen`, extracts words from titles
5. Words are stored per-date + per-username with associated video URLs
6. **Next.js frontend** fetches from `/api/users/[username]/*` routes and renders charts + word clouds

## Database Schema (Cloudflare D1 / SQLite via Drizzle)

- **videos**: `{ url (PK), title, imageUrl, username, timesWatched, timesSeen, tags }`
- **words**: `{ id, text, date, username, videoUrls (JSON), timesWatched, timesSeen }`
- **userVideoStats**: `{ id, username, date, videoUrl, timesWatched, timesSeen }`
- **users**: `{ username (PK), name }`

## API Endpoints

- `POST /api/videos` — ingest batch of videos from extension (also auto-creates user)
- `GET /api/users` — list all known users
- `GET /api/users/[username]` — individual user profile
- `GET /api/users/[username]/videos` — all videos for a user
- `GET /api/users/[username]/words?date=&month=&limit=` — word frequencies
- `GET /api/users/[username]/stats/daily` — unique video counts per day
- `GET /api/users/[username]/stats/day-of-week` — avg videos by day of week
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
        daily/route.ts
        day-of-week/route.ts
        tags-distribution/route.ts
        video-recurrence/route.ts
        word-trends/route.ts
      data/route.ts            ← DELETE (wipe user data)
```

## User System

No passwords / real auth. The site shows a "Who are you?" picker on first visit (fetches `/api/users`), stores the chosen username in `localStorage`. All API calls are scoped to that username. The nav shows `@username` with a click-to-switch option. The extension still hardcodes its username in the payload — creating the user record on first ingest.

## Current Production Setup

- Domain: `algomon.kyle-jeffrey.com`
- Deployed on **Cloudflare Pages** (Next.js via `@cloudflare/next-on-pages`)
- **Cloudflare D1** for the database
- All API routes use `export const runtime = "edge"` and `getRequestContext()` from `@cloudflare/next-on-pages`

## Key Files

- `extension/src/content_script.tsx` — scraper logic
- `extension/src/db.ts` — Dexie IndexedDB setup
- `web/app/api/videos/route.ts` — video ingest (POST only)
- `web/app/api/users/[username]/` — all per-user endpoints
- `web/lib/db/schema.ts` — Drizzle schema
- `web/components/user-context.tsx` — UserContext + useUser hook
- `web/components/user-picker.tsx` — "Who are you?" modal

## Development

```bash
# Run web app locally (requires wrangler for D1)
cd web && npm run dev

# Build extension
cd extension && npm run build
# Then load extension/dist/ in Chrome (developer mode)
```

## Known Limitations / TODOs

- Word blacklist duplicated across extension and server
- IndexedDB only accessible from content scripts (not popup)
- YouTube SPA navigation doesn't always trigger DB wipe correctly
- Word cloud hover shows iframes (should fetch video data instead)
- Next.js build errors suppressed (`ignoreBuildErrors: true`)
- Videos table uses URL as PK — a video URL can only be owned by one username (first ingestor wins)
