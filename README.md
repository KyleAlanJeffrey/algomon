# Algomon — YouTube Algorithm Monitor

See exactly what YouTube is feeding you.

**Live:** https://algomon.kyle-jeffrey.com
![alt text](image.png)
![alt text](image-1.png)
## What It Is

A Chrome extension that scrapes YouTube recommendations as you browse, uploads them to a Cloudflare-hosted API, and displays them as a Spotify Wrapped-style analytics dashboard — word clouds, top videos, daily and monthly breakdowns.

## Stack

| Component | Tech |
|---|---|
| `extension/` | Chrome Extension (TypeScript, Manifest V3, Webpack) |
| `web/` | Next.js 15 App Router, Tailwind, Framer Motion, Cloudflare Pages + D1 |

## How It Works

1. Extension content script runs on `youtube.com`, listens for scroll events
2. Scrapes video titles/URLs from the DOM (`yt-lockup-view-model`, `ytm-shorts-lockup-view-model`, `ytd-compact-video-renderer`)
3. Deduplicates with an in-memory Set per session, POSTs directly to `/api/videos`
4. API upserts videos, increments `timesSeen`, extracts words from titles into the `words` table
5. Dashboard fetches from the API and renders word clouds + video lists

## Development

```bash
# Start everything (Next.js dev server + extension watch build)
./dev.sh
```

Or individually:

```bash
# Web (Next.js + Cloudflare D1 local)
cd web && npm run dev

# Extension (dev build — points to localhost:3000)
cd extension && npm run build -- --config webpack/webpack.dev.js

# Extension (watch mode)
cd extension && npm run watch
```

### Local D1 Database

```bash
# Apply migrations to local D1
cd web && npx wrangler d1 migrations apply algomon --local
```

### Load Extension in Chrome

1. Build the extension (`npm run build` or `npm run watch` in `extension/`)
2. Go to `chrome://extensions` → Enable Developer Mode → Load Unpacked → select `extension/dist/`

After any rebuild, click the reload icon on the extension card.

## Deployment

Deployed to Cloudflare Pages. Production build:

```bash
cd web && npm run build
```

D1 migrations in production:

```bash
npx wrangler d1 migrations apply algomon --remote
```

## TODO

- [ ] Add a tracker for videos watched and time spent watching — break up browsing time vs watch time (`timesWatched` column already exists in the schema)
- [ ] Track word/video trends over time (e.g. a word appearing more this week than last)
- [ ] "YouTube really wants me to watch this" — surface most-recommended videos more prominently
- [ ] Possibly grab video tags from the YouTube page for richer analysis
- [ ] Real user auth — currently hardcoded to a single user (`sniffmefinger`)
