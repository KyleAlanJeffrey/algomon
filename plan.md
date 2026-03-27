# Click-Through Tracking Implementation Plan

## Goal
Track which videos users click on, from where (home/sidebar/shorts), and at what position in the feed.

## Status: Complete

### 1. Extension — content_script.ts
- [x] Click event listener on `document` catching video link clicks
- [x] Source detection from DOM ancestry (home/sidebar/shorts)
- [x] Position detection by index among siblings in container
- [x] Sends `clicked: true`, `clickPosition`, `source` to API
- [x] Deduplication via `clickedUrls` set, cleared on SPA navigation

### 2. Extension — scraper.ts
- [x] Export `normalizeYouTubeUrl` for reuse

### 3. Shared types — lib/types.ts
- [x] `clicked?: boolean` and `clickPosition?: number` on `VideoPayload`

### 4. Database
- [x] `times_clicked` + `click_position_sum` columns on `user_video_stats`
- [x] `click_events` table for per-click position tracking
- [x] Migrations: `0001_add_times_clicked.sql`, `0002_add_click_position_and_events.sql`

### 5. Server — app/api/videos/route.ts
- [x] Handles `clicked` events: increments `timesClicked` + `clickPositionSum`
- [x] Inserts into `click_events` when position > 0

### 6. API endpoints
- [x] `source-distribution` returns `timesClicked` + `clickPositionSum`
- [x] `click-positions` — new endpoint, returns click counts grouped by source + position

### 7. Frontend — Explore page
- [x] "Clicks by Source" — bar per source with count + avg position
- [x] "Where You Click" — position heatmap per source
- [x] "Videos You Actually Watched" — Clicks column
