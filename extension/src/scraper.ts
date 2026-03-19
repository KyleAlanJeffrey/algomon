export type VideoSource = "home" | "sidebar" | "shorts"

export interface ScrapedVideo {
  url: string
  title: string
  imageUrl: string | null
  source: VideoSource
}

function toAbsUrl(href: string | null): string | null {
  if (!href) return null
  if (href.startsWith("http")) return href
  return "https://www.youtube.com" + href
}

export function scrapeHomeVideos(): ScrapedVideo[] {
  const results: ScrapedVideo[] = []
  document.querySelectorAll<HTMLElement>("yt-lockup-view-model").forEach((el) => {
    if (el.closest("ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, feed-ad-metadata-view-model")) return

    const h3 = el.querySelector("h3[title]")
    const titleLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-metadata-view-model__title")
    const thumbnailLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-view-model__content-image")
    const img = el.querySelector<HTMLImageElement>(".ytThumbnailViewModelImage img")

    const title = h3?.getAttribute("title") || titleLink?.querySelector("span")?.textContent?.trim()
    const url = toAbsUrl(thumbnailLink?.getAttribute("href") || titleLink?.getAttribute("href") || null)
    const imageUrl = img?.getAttribute("src") || null

    if (url && title) results.push({ url, title, imageUrl, source: "home" })
  })
  return results
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

    if (url && title) results.push({ url, title, imageUrl, source: "shorts" })
  })
  return results
}

export function scrapeSidebarVideos(): ScrapedVideo[] {
  const results: ScrapedVideo[] = []
  document.querySelectorAll<HTMLElement>("ytd-compact-video-renderer").forEach((el) => {
    const titleEl = el.querySelector<HTMLAnchorElement>("#video-title-link")
    const title = titleEl?.querySelector("#video-title")?.textContent?.trim()
    const url = toAbsUrl(titleEl?.getAttribute("href") || null)
    const img = el.querySelector<HTMLImageElement>("img")
    const imageUrl = img?.getAttribute("src") || null

    if (url && title) results.push({ url, title, imageUrl, source: "sidebar" })
  })
  return results
}

export function scrapeAllRecommendations(): ScrapedVideo[] {
  return [...scrapeHomeVideos(), ...scrapeShortsVideos(), ...scrapeSidebarVideos()]
}
