import { getTodayDate } from "./helpers"
import { scrapeAllRecommendations } from "./scraper"

const API_BASE = process.env.API_BASE || "https://algomon.kylejeffrey.com"

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
  return { title, tags }
}

function sendWatchUpdate(url: string, delta: number, isFirst: boolean) {
  if (delta < 1 || !credentials) return
  const { title, tags } = getWatchMeta()
  const watchPercent = watchDuration > 0 ? Math.round((watchAccumSeconds / watchDuration) * 100) : 0
  const payload = [{
    url,
    title,
    tags,
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

  const { title, tags } = getWatchMeta()
  const watchPercent = watchDuration > 0 ? Math.round((totalSecs / watchDuration) * 100) : 0
  const isFirst = alreadySent === 0

  const payload = [{
    url,
    title,
    tags,
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

  const payload = scraped.map((v) => ({
    url: v.url,
    title: v.title,
    imageUrl: v.imageUrl ?? undefined,
    source: v.source,
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

// ─── SPA navigation ─────────────────────────────────────────────────────────

// YouTube fires 'yt-navigate-finish' when the SPA page is fully ready.
// This is more reliable than a fixed setTimeout after urlChange.
document.addEventListener("yt-navigate-finish", () => {
  seenUrls.clear()
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
  }
})

// Initial load (not a SPA navigation, so yt-navigate-finish won't fire)
// Note: watch tracking on initial load is handled in loadCredentials().then()
