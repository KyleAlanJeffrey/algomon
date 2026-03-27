# Click-Through Tracking Implementation Plan

## Goal
Track which videos users click on and from where (home/sidebar/shorts).

## Approach
Listen for click events on video links in the YouTube DOM. When a click lands on a video thumbnail/title, determine the source from the DOM context (home feed, sidebar, shorts) and send a click event to the API.

## Changes

### 1. Extension — content_script.ts
- [x] Add a click event listener (delegated on `document`) that catches clicks on video links
- [x] Determine source from DOM ancestry:
  - `ytd-rich-item-renderer` → `"home"`
  - `ytd-watch-next-secondary-results-renderer` → `"sidebar"`
  - `ytm-shorts-lockup-view-model` → `"shorts"`
- [x] Extract the video URL from the clicked link, normalize it
- [x] Send a click event payload to `POST /api/videos` with `clicked: true` and `source`
- [x] Deduplicate clicks with `clickedUrls` set, cleared on SPA navigation

### 2. Extension — scraper.ts
- [x] Export `normalizeYouTubeUrl` for reuse in click tracking

### 3. Shared types — lib/types.ts
- [x] Add `clicked?: boolean` to `VideoPayload`

### 4. Database — schema + migration
- [x] Add `timesClicked` column to `userVideoStats` in schema
- [x] Migration: `0001_add_times_clicked.sql`
- [x] Updated `0000_init.sql` for fresh setups

### 5. Server — app/api/videos/route.ts
- [x] Handle `clicked` events: upsert `userVideoStats` row, increment `timesClicked`
- [x] Click events don't increment `timesSeen` or `timesWatched`

### 6. API — source-distribution endpoint
- [x] Add `timesClicked` to the `source-distribution` response

### 7. Frontend — Explore page
- [x] Add `timesClicked` to `SourceRow` interface
- [x] Show click count and CTR % on each source card (only when clicks > 0)
