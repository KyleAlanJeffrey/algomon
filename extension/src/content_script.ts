import { getTodayDate } from "./helpers"
import { scrapeAllRecommendations, normalizeYouTubeUrl } from "./scraper"

const API_BASE = process.env.API_BASE || "https://algomon.app"

interface Credentials {
  username: string
  name: string
  apiSecret: string
}

let credentials: Credentials | null = null

function loadCredentials(): Promise<Credentials | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["username", "name", "apiSecret"], (result) => {
      if (result.username && result.apiSecret) {
        resolve({
          username: result.username,
          name: result.name || result.username,
          apiSecret: result.apiSecret,
        })
      } else {
        resolve(null)
      }
    })
  })
}

// Load credentials on startup
loadCredentials().then((c) => {
  credentials = c
  if (c) {
    console.log(`[algomon] logged in as ${c.username}`)
    // If we loaded on a watch page, start tracking
    if (window.location.pathname.startsWith("/watch")) startWatchTracking()
  } else {
    console.log("[algomon] not logged in — open extension popup to set up")
  }
})

// Listen for credential changes (user logs in while YouTube tab is open)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.username || changes.apiSecret)) {
    loadCredentials().then((c) => {
      credentials = c
      if (c) console.log(`[algomon] credentials updated: ${c.username}`)
    })
  }
})

let scrollCallback: NodeJS.Timeout = setTimeout(() => {}, 0)
const seenUrls = new Set<string>()

// ─── Watch time tracking ────────────────────────────────────────────────────

const POLL_MS = 2000

let watchUrl: string | null = null
let watchAccumSeconds = 0 // seconds the video was actively playing
let watchDuration = 0
let watchInterval: NodeJS.Timeout | null = null
let watchPeriodicInterval: NodeJS.Timeout | null = null
let watchLastSentSeconds = 0 // how many seconds we've already reported

const PERIODIC_SEND_MS = 30_000 // send a delta update every 30s

function getWatchMeta() {
  const title =
    document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content ||
    document.title.replace(/ - YouTube$/, "").trim()
  const keywordsMeta =
    document.querySelector<HTMLMetaElement>('meta[name="keywords"]')?.content ?? ""
  const tags = keywordsMeta.split(",").map((t) => t.trim()).filter((t) => t.length > 1)

  // Channel info from the watch page owner section
  const channelLink = document.querySelector<HTMLAnchorElement>('#owner ytd-channel-name #text a')
  const channelName = channelLink?.textContent?.trim() || null
  const channelUrl = channelLink?.getAttribute("href")
    ? `https://www.youtube.com${channelLink.getAttribute("href")}`
    : null
  const channelAvatarImg = document.querySelector<HTMLImageElement>('#owner ytd-video-owner-renderer #avatar img')
  const channelAvatarUrl = channelAvatarImg?.getAttribute("src") || null

  return { title, tags, channelName, channelUrl, channelAvatarUrl }
}

function sendWatchUpdate(url: string, delta: number, isFirst: boolean) {
  if (delta < 1 || !credentials) return
  const { title, tags, channelName, channelUrl, channelAvatarUrl } = getWatchMeta()
  const watchPercent = watchDuration > 0 ? Math.round((watchAccumSeconds / watchDuration) * 100) : 0
  const payload = [{
    url,
    title,
    tags,
    channelName,
    channelUrl,
    channelAvatarUrl,
    date: getTodayDate(),
    username: credentials.username,
    name: credentials.name,
    ...(isFirst ? { watched: true } : { watchUpdate: true }),
    watchSeconds: Math.round(delta),
    watchPercent,
  }]
  fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": credentials.apiSecret },
    body: JSON.stringify(payload),
  }).catch(() => {})
  console.log(`[algomon] watch update "${title}" — delta ${Math.round(delta)}s (${watchPercent}%) [${isFirst ? "first" : "update"}]`)
}

function startWatchTracking() {
  if (watchInterval) clearInterval(watchInterval)
  if (watchPeriodicInterval) clearInterval(watchPeriodicInterval)
  watchInterval = null
  watchPeriodicInterval = null
  watchAccumSeconds = 0
  watchDuration = 0
  watchLastSentSeconds = 0

  if (!window.location.pathname.startsWith("/watch") || !credentials) {
    watchUrl = null
    return
  }

  // Keep only the video ID param — strip playlist/index noise
  const url = new URL(window.location.href)
  const v = url.searchParams.get("v")
  watchUrl = v ? `https://www.youtube.com/watch?v=${v}` : window.location.href.split("&")[0]!

  watchInterval = setInterval(() => {
    const video = document.querySelector<HTMLVideoElement>("video")
    if (!video || !video.duration || !isFinite(video.duration)) return
    watchDuration = video.duration
    // Add poll interval to accumulator whenever the video is actively playing
    if (!video.paused) watchAccumSeconds += POLL_MS / 1000
  }, POLL_MS)

  // Periodic delta sends so we don't lose data on crashes/tab closes
  watchPeriodicInterval = setInterval(() => {
    const url = watchUrl
    if (!url) return
    const delta = watchAccumSeconds - watchLastSentSeconds
    if (delta < 5) return
    const isFirst = watchLastSentSeconds === 0
    watchLastSentSeconds = watchAccumSeconds
    sendWatchUpdate(url, delta, isFirst)
  }, PERIODIC_SEND_MS)

  console.log(`[algomon] tracking: ${watchUrl}`)
}

function flushWatchEvent() {
  if (watchInterval) clearInterval(watchInterval)
  if (watchPeriodicInterval) clearInterval(watchPeriodicInterval)
  watchInterval = null
  watchPeriodicInterval = null

  const url = watchUrl
  const totalSecs = watchAccumSeconds
  const alreadySent = watchLastSentSeconds
  // Reset immediately so we never double-send
  watchUrl = null
  watchAccumSeconds = 0
  watchDuration = 0
  watchLastSentSeconds = 0

  if (!url || totalSecs < 5 || !credentials) return // ignore accidental clicks

  const delta = totalSecs - alreadySent
  if (delta < 1 && alreadySent > 0) return // nothing new to report

  const { title, tags, channelName, channelUrl, channelAvatarUrl } = getWatchMeta()
  const watchPercent = watchDuration > 0 ? Math.round((totalSecs / watchDuration) * 100) : 0
  const isFirst = alreadySent === 0

  const payload = [{
    url,
    title,
    tags,
    channelName,
    channelUrl,
    channelAvatarUrl,
    date: getTodayDate(),
    username: credentials.username,
    name: credentials.name,
    ...(isFirst ? { watched: true } : { watchUpdate: true }),
    watchSeconds: Math.round(delta > 0 ? delta : totalSecs),
    watchPercent,
  }]

  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
  navigator.sendBeacon(
    `${API_BASE}/api/videos?key=${encodeURIComponent(credentials.apiSecret)}`,
    blob
  )
  console.log(`[algomon] flush "${title}" — ${Math.round(totalSecs)}s total, delta ${Math.round(delta)}s (${watchPercent}%)`)
}

// ─── Recommendation scraping ────────────────────────────────────────────────

function findVideosAndUpload() {
  if (!credentials) return

  const today = getTodayDate()
  const scraped = scrapeAllRecommendations().filter((v) => !seenUrls.has(v.url))
  if (scraped.length === 0) return

  scraped.forEach((v) => seenUrls.add(v.url))

  // For sidebar videos, record which video they were recommended from
  let currentWatchUrl: string | undefined
  if (window.location.pathname.startsWith("/watch")) {
    const params = new URLSearchParams(window.location.search)
    const v = params.get("v")
    if (v) currentWatchUrl = `https://www.youtube.com/watch?v=${v}`
  }

  const payload = scraped.map((v) => ({
    url: v.url,
    title: v.title,
    imageUrl: v.imageUrl ?? undefined,
    source: v.source,
    channelName: v.channelName ?? undefined,
    channelUrl: v.channelUrl ?? undefined,
    channelAvatarUrl: v.channelAvatarUrl ?? undefined,
    recommendedFrom: v.source === "sidebar" ? currentWatchUrl : undefined,
    date: today,
    username: credentials!.username,
    name: credentials!.name,
  }))

  fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": credentials.apiSecret },
    body: JSON.stringify(payload),
  })
    .then(() => {
      console.log(`[algomon] +${scraped.length} videos (${seenUrls.size} total this session)`)
    })
    .catch(() => console.warn("[algomon] Upload failed, will retry on next scroll."))
}

window.onscroll = function () {
  clearTimeout(scrollCallback)
  scrollCallback = setTimeout(findVideosAndUpload, 800)
}

// ─── Click-through tracking ──────────────────────────────────────────────────

// Track the last hovered home feed item index (since ytd-video-preview floats outside the grid)
let lastHoveredHomeIndex: number | undefined

document.addEventListener("mouseover", (e) => {
  const target = e.target as HTMLElement
  const item = target.closest("ytd-rich-item-renderer")
  if (!item) return
  const siblings = document.querySelectorAll("ytd-rich-item-renderer")
  lastHoveredHomeIndex = Array.from(siblings).indexOf(item as Element) + 1
}, true)

const clickedUrls = new Set<string>()

function handleVideoClick(e: Event) {
  if (!credentials) return
  const target = e.target as HTMLElement
  // Walk up to find an anchor linking to a video
  const anchor = target.closest<HTMLAnchorElement>('a[href*="/watch?"], a[href*="/shorts/"]')
  if (!anchor) return
  const href = anchor.getAttribute("href")
  if (!href) return

  const url = normalizeYouTubeUrl(href.startsWith("http") ? href : `https://www.youtube.com${href}`)
  if (clickedUrls.has(url)) return
  clickedUrls.add(url)

  // Determine source and position from DOM context
  let source: "home" | "sidebar" | "shorts" = "home"
  let clickPosition: number | undefined
  const sidebarContainer = anchor.closest("ytd-watch-next-secondary-results-renderer")
  const shortsItem = anchor.closest("ytm-shorts-lockup-view-model")

  if (sidebarContainer) {
    source = "sidebar"
    const item = anchor.closest("ytd-compact-video-renderer, yt-lockup-view-model")
    if (item) {
      const siblings = sidebarContainer.querySelectorAll("ytd-compact-video-renderer, yt-lockup-view-model")
      clickPosition = Array.from(siblings).indexOf(item) + 1
    }
  } else if (shortsItem) {
    source = "shorts"
    const container = shortsItem.parentElement
    if (container) {
      const siblings = container.querySelectorAll("ytm-shorts-lockup-view-model")
      clickPosition = Array.from(siblings).indexOf(shortsItem) + 1
    }
  } else {
    // Home feed — use the last hovered item since ytd-video-preview floats outside the grid
    const item = anchor.closest("ytd-rich-item-renderer")
    if (item) {
      const siblings = document.querySelectorAll("ytd-rich-item-renderer")
      clickPosition = Array.from(siblings).indexOf(item as Element) + 1
    } else if (lastHoveredHomeIndex) {
      clickPosition = lastHoveredHomeIndex
    }
  }

  const title = anchor.closest("ytd-rich-item-renderer, yt-lockup-view-model, ytm-shorts-lockup-view-model")
    ?.querySelector<HTMLElement>("h3[title]")?.getAttribute("title")
    || anchor.getAttribute("title")
    || document.querySelector("ytd-video-preview h3")?.textContent?.trim()
    || url

  fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": credentials.apiSecret },
    body: JSON.stringify([{
      url,
      title,
      clicked: true,
      clickPosition,
      source,
      date: getTodayDate(),
      username: credentials.username,
      name: credentials.name,
    }]),
  }).catch(() => {})
  console.log(`[algomon] click: ${source}${clickPosition ? ` #${clickPosition}` : ""} → ${url}`)
}

document.addEventListener("click", handleVideoClick, true)
document.addEventListener("auxclick", handleVideoClick, true)     // middle click
document.addEventListener("contextmenu", handleVideoClick, true)  // right click → "Open in new tab"

// ─── SPA navigation ─────────────────────────────────────────────────────────

// YouTube fires 'yt-navigate-finish' when the SPA page is fully ready.
// This is more reliable than a fixed setTimeout after urlChange.
document.addEventListener("yt-navigate-finish", () => {
  seenUrls.clear()
  clickedUrls.clear()
  startWatchTracking()
})

// Flush watch data when YouTube starts navigating away
document.addEventListener("yt-navigate-start", () => {
  flushWatchEvent()
})

// Browser back/forward button — YouTube may not fire yt-navigate-start
window.addEventListener("popstate", () => {
  flushWatchEvent()
})

// Tab close / full navigation away
window.addEventListener("pagehide", () => {
  flushWatchEvent()
})

// Background script message as a fallback for urlChange detection
chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === "urlChange") {
    // yt-navigate-start/finish handle the tracking; just ensure seenUrls is cleared
    seenUrls.clear()
  clickedUrls.clear()
  }
})

// Initial load (not a SPA navigation, so yt-navigate-finish won't fire)
// Note: watch tracking on initial load is handled in loadCredentials().then()
