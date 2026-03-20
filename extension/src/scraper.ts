export type VideoSource = "home" | "sidebar" | "shorts"

export interface ScrapedVideo {
  url: string
  title: string
  imageUrl: string | null
  source: VideoSource
  channelName: string | null
  channelUrl: string | null
}

function toAbsUrl(href: string | null): string | null {
  if (!href) return null
  if (href.startsWith("http")) return href
  return "https://www.youtube.com" + href
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
    const imageUrl = img?.getAttribute("src") || null

    // Channel link lives in the metadata row: a[href^="/@"]
    const channelLink = el.querySelector<HTMLAnchorElement>('a.yt-core-attributed-string__link[href^="/@"]')
    const channelName = channelLink?.textContent?.trim() || null
    const channelUrl = toAbsUrl(channelLink?.getAttribute("href") || null)

    if (url && title) results.push({ url, title, imageUrl, source, channelName, channelUrl })
  })
  return results
}

export function scrapeHomeVideos(): ScrapedVideo[] {
  // Home feed items are wrapped in ytd-rich-item-renderer
  return scrapeLockups("ytd-rich-item-renderer", "home", true)
}

export function scrapeShortsVideos(): ScrapedVideo[] {
  const results: ScrapedVideo[] = []
  document.querySelectorAll<HTMLElement>("ytm-shorts-lockup-view-model").forEach((el) => {
    const anchors = el.querySelectorAll<HTMLAnchorElement>("a.shortsLockupViewModelHostEndpoint")
    const titleAnchor = Array.from(anchors).find((a) => a.getAttribute("title"))
    const firstAnchor = anchors[0]
    const img = el.querySelector<HTMLImageElement>("img")

    const title = titleAnchor?.getAttribute("title") || el.querySelector("span")?.textContent?.trim()
    const url = toAbsUrl(firstAnchor?.getAttribute("href") || null)
    const imageUrl = img?.getAttribute("src") || null

    // Shorts don't typically show channel in the lockup
    if (url && title) results.push({ url, title, imageUrl, source: "shorts", channelName: null, channelUrl: null })
  })
  return results
}

export function scrapeSidebarVideos(): ScrapedVideo[] {
  // Sidebar/recommended videos on watch pages use the same lockup element
  // but are scoped inside ytd-watch-next-secondary-results-renderer
  return scrapeLockups("ytd-watch-next-secondary-results-renderer", "sidebar")
}

export function scrapeAllRecommendations(): ScrapedVideo[] {
  return [...scrapeHomeVideos(), ...scrapeShortsVideos(), ...scrapeSidebarVideos()]
}
