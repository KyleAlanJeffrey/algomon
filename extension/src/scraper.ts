export type VideoSource = "home" | "sidebar" | "shorts"

export interface ScrapedVideo {
  url: string
  title: string
  imageUrl: string | null
  source: VideoSource
  channelName: string | null
  channelUrl: string | null
  channelAvatarUrl: string | null
}

function toAbsUrl(href: string | null): string | null {
  if (!href) return null
  const raw = href.startsWith("http") ? href : "https://www.youtube.com" + href
  return normalizeYouTubeUrl(raw)
}

/** Strip tracking params — keep only the video ID so the same video always has one URL */
function normalizeYouTubeUrl(raw: string): string {
  try {
    const u = new URL(raw)
    // /watch?v=ID — keep only ?v=
    const v = u.searchParams.get("v")
    if (v) return `https://www.youtube.com/watch?v=${v}`
    // /shorts/ID — strip any query params
    const shortsMatch = u.pathname.match(/^\/shorts\/([^/]+)/)
    if (shortsMatch) return `https://www.youtube.com/shorts/${shortsMatch[1]}`
  } catch {}
  return raw
}

/** Generate a thumbnail URL from a video/shorts URL when the DOM img is empty */
function thumbFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://i.ytimg.com/vi/${v}/hqdefault.jpg`
    const parts = u.pathname.split("/")
    const idx = parts.indexOf("shorts")
    if (idx !== -1 && parts[idx + 1]) return `https://i.ytimg.com/vi/${parts[idx + 1]}/oar2.jpg`
  } catch {}
  return null
}

/** Return a usable thumbnail src, or fall back to generating one from the URL */
function getThumb(imgEl: HTMLImageElement | null, videoUrl: string | null): string | null {
  const src = imgEl?.getAttribute("src") || null
  // Skip empty, data: placeholders, or 1x1 tracking pixels
  if (src && !src.startsWith("data:") && src.length > 30) return src
  return videoUrl ? thumbFromUrl(videoUrl) : null
}

function scrapeLockups(
  scope: string,
  source: VideoSource,
  excludeAds = false
): ScrapedVideo[] {
  const results: ScrapedVideo[] = []
  document.querySelectorAll<HTMLElement>(`${scope} yt-lockup-view-model`).forEach((el) => {
    if (excludeAds && el.closest("ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, feed-ad-metadata-view-model")) return

    const h3 = el.querySelector<HTMLElement>("h3[title]")
    const titleLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-metadata-view-model__title")
    const thumbnailLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-view-model__content-image")
    const img = el.querySelector<HTMLImageElement>(".ytThumbnailViewModelImage img")

    const title = h3?.getAttribute("title") || titleLink?.querySelector("span")?.textContent?.trim()
    const url = toAbsUrl(thumbnailLink?.getAttribute("href") || titleLink?.getAttribute("href") || null)
    const imageUrl = getThumb(img, url)

    // Channel: try link first (home feed), fall back to metadata text + avatar aria-label (sidebar)
    const channelLink = el.querySelector<HTMLAnchorElement>('a.yt-core-attributed-string__link[href^="/@"]')
    let channelName = channelLink?.textContent?.trim() || null
    let channelUrl = toAbsUrl(channelLink?.getAttribute("href") || null)

    if (!channelName) {
      // Sidebar lockups: channel name is in the first metadata row's first text span
      const metaRow = el.querySelector('.yt-content-metadata-view-model__metadata-row')
      const metaText = metaRow?.querySelector('.yt-content-metadata-view-model__metadata-text')
      // Get just the direct text, not nested view/channel counts
      const rawText = metaText?.childNodes[0]?.textContent?.trim()
      if (rawText && !rawText.match(/^\d/) && rawText.length > 1) {
        channelName = rawText
      }
      // Try avatar aria-label as fallback: "Go to channel X"
      if (!channelName) {
        const avatarBtn = el.querySelector<HTMLElement>('.yt-spec-avatar-shape[aria-label]')
        const label = avatarBtn?.getAttribute("aria-label") || ""
        const match = label.match(/^Go to channel (.+)$/)
        if (match) channelName = match[1]
      }
    }

    // Channel avatar from the lockup's avatar section
    const avatarImg = el.querySelector<HTMLImageElement>('yt-avatar-shape img')
    const channelAvatarUrl = avatarImg?.getAttribute("src") || null

    if (url && title) results.push({ url, title, imageUrl, source, channelName, channelUrl, channelAvatarUrl })
  })
  return results
}

export function scrapeHomeVideos(): ScrapedVideo[] {
  return scrapeLockups("ytd-rich-item-renderer", "home", true)
}

export function scrapeShortsVideos(): ScrapedVideo[] {
  const results: ScrapedVideo[] = []
  // Match both v1 and v2 shorts lockup wrappers
  document.querySelectorAll<HTMLElement>("ytm-shorts-lockup-view-model").forEach((el) => {
    const anchors = el.querySelectorAll<HTMLAnchorElement>("a.shortsLockupViewModelHostEndpoint")
    const titleAnchor = Array.from(anchors).find((a) => a.getAttribute("title"))
    const firstAnchor = anchors[0]
    const img = el.querySelector<HTMLImageElement>("img")

    const title = titleAnchor?.getAttribute("title") || el.querySelector("span")?.textContent?.trim()
    const url = toAbsUrl(firstAnchor?.getAttribute("href") || null)
    const imageUrl = getThumb(img, url)

    // Shorts metadata row may have channel info in some layouts
    const channelLink = el.querySelector<HTMLAnchorElement>('a[href^="/@"]')
    const channelName = channelLink?.textContent?.trim() || null
    const channelUrl = toAbsUrl(channelLink?.getAttribute("href") || null)

    if (url && title) results.push({ url, title, imageUrl, source: "shorts", channelName, channelUrl, channelAvatarUrl: null })
  })
  return results
}

export function scrapeSidebarVideos(): ScrapedVideo[] {
  return scrapeLockups("ytd-watch-next-secondary-results-renderer", "sidebar")
}

export function scrapeAllRecommendations(): ScrapedVideo[] {
  return [...scrapeHomeVideos(), ...scrapeShortsVideos(), ...scrapeSidebarVideos()]
}
