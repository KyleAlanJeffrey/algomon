# Algomon — TODO

## Critical

- [ ] **Extension UI numbers not loading** — stats/counts in the Chrome extension popup are not displaying

## Planned Features

### Search Analytics
- [ ] Track when users type searches on YouTube (capture search queries)
- [ ] Store search terms with timestamps and username
- [ ] Surface search frequency and trending searches in the dashboard

### Click-Through Tracking
- [ ] Track which videos users click to watch from the **home feed**
- [ ] Track which videos users click to watch from the **sidebar recommendations**
- [ ] Record the click source (`home` | `sidebar` | `shorts`) alongside the watch event
- [ ] Surface click-through patterns in Explore — which sources drive the most watches

## Existing Known Issues

- Word blacklist duplicated across extension and server
- YouTube SPA navigation doesn't always trigger seenUrls wipe correctly
- Word cloud hover shows iframes (should fetch video data instead)
- Videos table uses URL as PK — a video URL can only be owned by one username (first ingestor wins)
- Watch data not yet surfaced in the dashboard UI (tracked in DB, not displayed)
- `sendBeacon` auth uses `?key=` query param (can't set headers); consider a dedicated watch endpoint
