# Algomon — TODO

## Planned Features

### Multi-User Video Ownership
- [ ] Change `videos` PK from `url` to `(url, username)` so each user has their own video record
- [ ] Update all queries that join on `videos.url` to also filter by username

### Search Analytics
- [ ] Track when users type searches on YouTube (capture search queries)
- [ ] Store search terms with timestamps and username
- [ ] Surface search frequency and trending searches in the dashboard


## Existing Known Issues

- YouTube SPA navigation doesn't always fire `yt-navigate-finish`, so `seenUrls` may not clear on some navigations
- `sendBeacon` auth uses `?key=` query param (can't set headers); consider a dedicated watch endpoint
- OG/Twitter image routes cannot use `runtime = "edge"` with `@opennextjs/cloudflare`
