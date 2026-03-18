# Algomon — Cloudflare Modernization Refactor Plan

## Goals

- **Eliminate EC2** — deploy entirely on Cloudflare (Pages + Workers + D1)
- **Eliminate NestJS** — replace with Next.js API routes (App Router)
- **Eliminate MongoDB** — replace with Cloudflare D1 (SQLite) via Drizzle ORM
- **Eliminate HTTPS proxy** — Cloudflare handles SSL/TLS natively
- **Modernize Next.js** — migrate from Pages Router to App Router
- **Keep Chrome Extension** — just update the API endpoint URL
- **Spotify Wrapped aesthetic** — bold, dramatic, full-screen stat reveals on dark backgrounds

## Target Stack

| Layer | Current | New |
|---|---|---|
| Frontend framework | Next.js 14 (Pages Router) | Next.js 15 (App Router) |
| API | NestJS (separate process) | Next.js API Routes (Route Handlers) |
| Database | MongoDB Atlas + Mongoose | Cloudflare D1 (SQLite) + Drizzle ORM |
| Deployment | EC2 + manual SSL | Cloudflare Pages + Workers |
| SSL | Let's Encrypt + proxy | Cloudflare (automatic) |
| Styling | Tailwind CSS 3 | Tailwind CSS 4 |
| Data fetching | React Query + Axios | React Query + native fetch |

---

## Phase 1 — Project Restructure

### 1.1 Create new unified Next.js app

The `frontend/` and `server/` directories collapse into a single Next.js app. The extension stays separate.

```
algomon/
├── app/                    # New: Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # Home
│   ├── daily/page.tsx
│   ├── all/page.tsx
│   ├── wrapped/page.tsx    # Was "2.tsx"
│   └── api/
│       ├── videos/route.ts     # GET + POST videos
│       ├── words/route.ts      # GET word frequencies
│       └── stats/route.ts      # GET total stats
├── components/
│   ├── word-cloud.tsx
│   └── url-button.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema (replaces Mongoose schemas)
│   │   └── index.ts        # D1 client setup
│   ├── words.ts            # Word extraction + blacklist (single source of truth)
│   └── types.ts
├── extension/              # Unchanged (just update API URL)
├── wrangler.toml           # Cloudflare config
├── next.config.ts
├── package.json
└── drizzle.config.ts
```

### 1.2 Initialize the new project

```bash
# From algomon/
npx create-next-app@latest . --typescript --tailwind --app --src-dir=no --import-alias="@/*"
npm install drizzle-orm @cloudflare/workers-types
npm install -D drizzle-kit wrangler
npm install @tanstack/react-query visx
```

---

## Phase 2 — Cloudflare Setup

### 2.1 Install and configure Wrangler

```bash
npm install -D wrangler
npx wrangler login
```

### 2.2 Create `wrangler.toml`

```toml
name = "algomon"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "algomon"
database_id = "<run: npx wrangler d1 create algomon>"

[vars]
ENVIRONMENT = "production"
```

### 2.3 Create Cloudflare D1 database

```bash
npx wrangler d1 create algomon
# Copy the database_id into wrangler.toml
```

### 2.4 Configure `next.config.ts` for Cloudflare Pages

```bash
npm install -D @cloudflare/next-on-pages
```

```ts
// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages
}

export default nextConfig
```

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "cf:build": "npx @cloudflare/next-on-pages",
    "cf:preview": "npm run cf:build && npx wrangler pages dev .vercel/output/static",
    "cf:deploy": "npm run cf:build && npx wrangler pages deploy .vercel/output/static",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "wrangler d1 migrations apply algomon",
    "db:migrate:local": "wrangler d1 migrations apply algomon --local",
    "db:studio": "drizzle-kit studio"
  }
}
```

Add `// @ts-check` runtime flag to each API route file:
```ts
export const runtime = "edge"
```

---

## Phase 3 — Database Migration (MongoDB → D1)

### 3.1 Drizzle schema (`lib/db/schema.ts`)

Replace Mongoose schemas with Drizzle SQLite schema:

```ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

export const videos = sqliteTable("videos", {
  url: text("url").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  username: text("username").notNull(),
  timesWatched: integer("times_watched").default(0),
  timesSeen: integer("times_seen").default(0),
})

export const words = sqliteTable("words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  date: text("date").notNull(),        // ISO date string YYYY-MM-DD
  username: text("username").notNull(),
  videoUrls: text("video_urls"),       // JSON array stored as text
  timesWatched: integer("times_watched").default(0),
  timesSeen: integer("times_seen").default(0),
})

export const userVideoStats = sqliteTable("user_video_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  date: text("date").notNull(),
  videoUrl: text("video_url").notNull(),
  timesWatched: integer("times_watched").default(0),
  timesSeen: integer("times_seen").default(0),
})

export const users = sqliteTable("users", {
  username: text("username").primaryKey(),
  name: text("name").notNull(),
})
```

### 3.2 Drizzle config (`drizzle.config.ts`)

```ts
import type { Config } from "drizzle-kit"

export default {
  schema: "./lib/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config
```

### 3.3 D1 client setup (`lib/db/index.ts`)

```ts
import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

export function getDb(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema })
}
```

### 3.4 Generate and apply migrations

```bash
npm run db:generate
npm run db:migrate:local   # Test locally
npm run db:migrate         # Apply to production D1
```

---

## Phase 4 — API Routes (Replace NestJS)

All routes use `export const runtime = "edge"` and access D1 via `getRequestContext()`.

### 4.1 Video ingest (`app/api/videos/route.ts`)

Replaces `POST /` in NestJS controller. Logic from `app.service.ts`:
- Upsert each video (increment `timesSeen` on conflict)
- Upsert `userVideoStats` per date
- Extract words from title, filter blacklist, upsert `words` table

```ts
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb } from "@/lib/db"
import { extractWords } from "@/lib/words"
import { videos, words, userVideoStats, users } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export const runtime = "edge"

export async function POST(request: Request) {
  const { env } = getRequestContext()
  const db = getDb(env)
  const body = await request.json()
  // ... upsert logic (see app.service.ts for reference)
}

export async function GET(request: Request) {
  const { env } = getRequestContext()
  const db = getDb(env)
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  // ... query videos
}
```

### 4.2 Words endpoint (`app/api/words/route.ts`)

Replaces `GET /words`. Port the MongoDB aggregation to Drizzle queries.

### 4.3 Stats endpoint (`app/api/stats/route.ts`)

Simple count query replacing `GET /stats`.

---

## Phase 5 — Word Extraction (Single Source of Truth)

Currently the word blacklist is duplicated in:
- `extension/src/helpers.ts`
- `frontend/src/helpers.ts`
- `server/src/helpers.ts`

### Solution

Move to `lib/words.ts` in the Next.js app (used by API routes). The extension keeps its own copy since it runs in a different context (Chrome extension cannot import from server code). Document that the extension's blacklist should be kept in sync manually or consider fetching it from the API.

```ts
// lib/words.ts
export const BLACKLIST = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  // ... full list
])

export function extractWords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !BLACKLIST.has(w))
}
```

---

## Phase 6 — Frontend Migration (Pages → App Router)

### Page mapping

| Old (Pages Router) | New (App Router) |
|---|---|
| `pages/index.tsx` | `app/page.tsx` |
| `pages/2.tsx` | `app/wrapped/page.tsx` |
| `pages/daily.tsx` | `app/daily/page.tsx` |
| `pages/all.tsx` | `app/all/page.tsx` |
| `pages/full-cloud.tsx` | `app/full-cloud/page.tsx` |
| `pages/date/[date].tsx` | `app/date/[date]/page.tsx` |

### Data fetching update

Replace Axios with native fetch. Keep React Query for client-side state. Server Components can fetch directly without React Query.

```ts
// Before (pages router + axios)
const { data } = useQuery({ queryKey: ["words"], queryFn: () => api.getWords() })

// After (App Router server component)
const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/words`).then(r => r.json())
```

### Remove

- `src/api.ts` (Axios client) — replace with direct `fetch` calls
- `src/env.js` (t3 env) — use standard `process.env` or `env()` from Next.js

---

## Phase 7 — Extension Update

The Chrome extension needs minimal changes — just update the API endpoint.

### 7.1 Update API URL in `extension/src/content_script.tsx`

```ts
// Before
const API_URL = "https://algomon.kyle-jeffrey.com:3001"

// After — point to Cloudflare Pages domain
const API_URL = "https://algomon.kyle-jeffrey.com"
// (or whatever the Cloudflare Pages domain is)
```

### 7.2 Update CORS in API routes

Add CORS headers to all API routes (or use a middleware) to allow requests from `chrome-extension://*`.

```ts
// In each route handler or via middleware
export function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
```

### 7.3 Optionally fix the YouTube SPA navigation bug

In `extension/src/background.ts`, improve URL change detection to handle YouTube's SPA navigation more reliably using `chrome.webNavigation.onHistoryStateUpdated`.

---

## Phase 8 — Deployment

### 8.1 Connect to Cloudflare Pages via GitHub

1. Push repo to GitHub
2. Go to Cloudflare Dashboard → Pages → Create application → Connect to Git
3. Select repo, set build settings:
   - **Build command**: `npm run cf:build`
   - **Build output directory**: `.vercel/output/static`
   - **Node version**: 20

### 8.2 Set environment variables in Cloudflare Dashboard

Under Pages → Settings → Environment Variables:

```
# No NEXT_PUBLIC_API_URL needed — routes are relative (/api/...)
# Add any other needed vars
```

### 8.3 Bind D1 to Pages project

In Cloudflare Dashboard → Pages → Settings → Functions → D1 database bindings:
- Variable name: `DB`
- D1 database: `algomon`

### 8.4 Custom domain

In Cloudflare Dashboard → Pages → Custom domains → Add `algomon.kyle-jeffrey.com`

DNS automatically updated. SSL handled by Cloudflare — no more Let's Encrypt or proxy server.

---

## Phase 8.5 — Spotify Wrapped Visual Design

The entire frontend should feel like Spotify Wrapped — bold, dark, swipeable stat reveals.

### Design principles

- **Dark base** — near-black background (`#0a0a0a` or `#111`)
- **Vivid gradient accents** — each page/section gets its own gradient pair (e.g. purple→pink, orange→yellow, green→teal)
- **Oversized typography** — stats displayed at 80–120px, labels tiny above them
- **Full-viewport sections** — each "slide" fills the screen, vertically centered
- **Smooth transitions** — animate between slides (framer-motion or CSS transitions)
- **Minimal chrome** — no nav bars, no sidebars; content is the UI

### Color palette (one per section/slide)

```ts
export const SLIDE_THEMES = {
  intro:    { from: "#1DB954", to: "#191414" },   // Spotify green → black
  topWords: { from: "#FF6B6B", to: "#4ECDC4" },   // Coral → teal
  daily:    { from: "#A855F7", to: "#EC4899" },   // Purple → pink
  wrapped:  { from: "#F97316", to: "#EAB308" },   // Orange → yellow
  allTime:  { from: "#3B82F6", to: "#8B5CF6" },   // Blue → violet
}
```

### Layout pattern (each page)

```
┌─────────────────────────────┐
│                             │
│   LABEL (12px, uppercase,   │
│   letter-spaced, muted)     │
│                             │
│   BIG STAT OR WORD          │
│   (80-120px, bold, white)   │
│                             │
│   Supporting copy (16px)    │
│                             │
│   ● ● ● ● ●  (dot nav)     │
└─────────────────────────────┘
```

### Page-by-page spec

**`/` — Intro / "Your YouTube Year"**
- Full-screen gradient (green → black)
- Giant headline: "YOUR ALGORITHM, EXPOSED."
- Subtext: current month + year
- CTA arrow to scroll into stats

**`/wrapped` — Monthly word cloud**
- Dark purple gradient background
- Word cloud front and center (large, colorful words)
- Hover/click a word → slides up a panel showing associated videos
- Stat bar at bottom: "X videos, Y unique words this month"

**`/daily` — Today's stats**
- Split into 2 mini-slides:
  1. "TODAY YOU SAW" → giant number of videos
  2. Word cloud for today's titles

**`/all` — All-time stats**
- Slide 1: "TOTAL VIDEOS SEEN" → huge number
- Slide 2: Top 10 most-recommended videos (ranked list, album-art style)
- Slide 3: Word cloud of all time

### Component: `<StatSlide>`

Reusable full-viewport slide wrapper:

```tsx
// components/stat-slide.tsx
interface StatSlideProps {
  gradient: { from: string; to: string }
  label: string
  stat: string | number
  subtext?: string
  children?: React.ReactNode
}
```

### Typography

Use `Geist` (already in project) for headings + `Geist Mono` for numbers/stats.

```css
.stat-number {
  font-size: clamp(4rem, 15vw, 9rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
}
```

### Word cloud updates

The existing visx word cloud stays but gets restyled:
- All words white/off-white (brightness encodes frequency)
- Hover state: word glows + scales up
- Click: slide-up panel (not iframe) showing video thumbnails + titles
- Remove iframe embeds entirely

### Install

```bash
npm install framer-motion
```

Use `framer-motion` for page transitions (`AnimatePresence` + `motion.div`).

---

## Phase 9 — Cleanup

After deployment is confirmed working:

- [ ] Delete `server/` directory (NestJS)
- [ ] Delete `https-proxy-server/` directory
- [ ] Remove Let's Encrypt cert management from EC2 (or terminate EC2 entirely)
- [ ] Remove EC2-specific docs from README
- [ ] Update README with new deployment instructions

---

## Implementation Order

1. [ ] Set up new Next.js 15 App Router structure
2. [ ] Install Drizzle + Wrangler, create D1 database
3. [ ] Write Drizzle schema, generate + apply migrations
4. [ ] Implement API route handlers (Port logic from `app.service.ts`)
5. [ ] Migrate frontend pages to App Router
6. [ ] Update word extraction to single `lib/words.ts`
7. [ ] Test locally with `npm run cf:preview`
8. [ ] Update extension API URL
9. [ ] Deploy to Cloudflare Pages
10. [ ] Set up custom domain + D1 binding in CF dashboard
11. [ ] Verify extension uploads work with CORS headers
12. [ ] Delete old server + proxy directories

---

## Key References

- [Cloudflare next-on-pages docs](https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/)
- [Drizzle ORM + D1](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
- [Wrangler D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Next.js App Router migration](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [getRequestContext for edge runtime](https://developers.cloudflare.com/pages/functions/api-reference/)
