# Algomon — Claude Context

## What This Is

Algomon is a **YouTube Algorithm Monitor** — a full-stack app that tracks and analyzes which videos YouTube recommends to the user over time.

## Components

| Component | Tech | Purpose |
|---|---|---|
| `extension/` | Chrome Extension (TypeScript, React, Dexie) | Scrapes YouTube recommendations, uploads to API |
| `frontend/` | Next.js 14, Tailwind, Visx, React Query | Analytics dashboard (word clouds, video lists, daily/monthly stats) |
| `server/` | NestJS 10, MongoDB/Mongoose | REST API — aggregates video data, word frequencies |
| `https-proxy-server/` | Express proxy | HTTPS reverse proxy (port 443 → 80) on EC2 |

## How Data Flows

1. **Extension content script** runs on `youtube.com`, listens for scroll events
2. Extracts video titles/URLs/images from DOM (`ytd-compact-video-renderer`, `ytd-rich-item-renderer`)
3. Stores in local **IndexedDB (Dexie)**, then POSTs to `/` API every second
4. **NestJS API** upserts videos, increments `timesSeen`, extracts words from titles
5. Words are stored per-date with associated video URLs
6. **Next.js frontend** fetches from API and renders word clouds + video lists

## Database Schema (MongoDB)

- **Videos**: `{ url (unique), title, imageUrl, username, timesWatched, timesSeen }`
- **Words**: `{ text, date, username, videoUrls[], timesWatched, timesSeen }`
- **UserVideoStats**: `{ username, date, videoUrl, timesWatched, timesSeen }`
- **Users**: `{ username (unique), name }`

## API Endpoints

- `POST /` — ingest batch of videos from extension
- `GET /` — list all videos (or filter by date)
- `GET /stats` — total video count
- `GET /words` — aggregated word frequencies with associated video URLs

## Current Production Setup

- Domain: `algomon.kyle-jeffrey.com`
- EC2 instance running NestJS (port 3001) + Next.js (port 80) + HTTPS proxy (port 443)
- SSL via Let's Encrypt
- MongoDB Atlas for production DB

## Known Limitations / TODOs

- Hardcoded user (`sniffmefinger` / `Kyle Jeffrey`) — no real auth
- Word blacklist duplicated across extension, frontend, and server
- IndexedDB only accessible from content scripts (not popup)
- YouTube SPA navigation doesn't always trigger DB wipe correctly
- Word cloud hover shows iframes (should fetch video data instead)
- Next.js build errors suppressed (`ignoreBuildErrors: true`)
- Server TypeScript not strict (`strictNullChecks: false`)

## Key Files

- `extension/src/content_script.tsx` — scraper logic
- `extension/src/db.ts` — Dexie IndexedDB setup
- `server/src/app.service.ts` — all business logic
- `server/src/app.controller.ts` — API route handlers
- `frontend/src/components/word-cloud.tsx` — main visualization
- `frontend/src/api.ts` — Axios API client

## Development

```bash
# Start local MongoDB
./server/start_test_db.sh

# Run server
cd server && npm run start:dev

# Run frontend
cd frontend && npm run dev

# Build extension
cd extension && npm run build
# Then load extension/dist/ in Chrome (developer mode)
```

## Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"

# server/.env.development
DATABASE_URL="mongodb://buttburgler:butts@localhost:27017"
```
