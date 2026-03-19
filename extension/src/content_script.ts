import { getTodayDate } from "./helpers"
import { scrapeAllRecommendations } from "./scraper"

const API_BASE = process.env.API_BASE ?? "https://algomon.kylejeffrey.com"
const MeUser = { username: "sniffmefinger", name: "Kyle Jeffrey" }

let scrollCallback: NodeJS.Timeout = setTimeout(() => {}, 0)
const seenUrls = new Set<string>()

// ─── Watch time tracking ────────────────────────────────────────────────────

let watchUrl: string | null = null
let watchMaxSeconds = 0
let watchDuration = 0
let watchInterval: NodeJS.Timeout | null = null

function startWatchTracking() {
  if (watchInterval) clearInterval(watchInterval)
  watchMaxSeconds = 0
  watchDuration = 0
  watchUrl = window.location.pathname.startsWith("/watch")
    ? window.location.href.split("&")[0]!
    : null
  if (!watchUrl) return

  watchInterval = setInterval(() => {
    const video = document.querySelector<HTMLVideoElement>("video")
    if (!video || !video.duration) return
    watchDuration = video.duration
    if (video.currentTime > watchMaxSeconds) watchMaxSeconds = video.currentTime
  }, 2000)
}

function flushWatchEvent() {
  if (watchInterval) clearInterval(watchInterval)
  watchInterval = null
  if (!watchUrl || watchMaxSeconds < 5) return // ignore accidental clicks

  const title =
    document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content ||
    document.title.replace(/ - YouTube$/, "").trim()
  const keywordsMeta =
    document.querySelector<HTMLMetaElement>('meta[name="keywords"]')?.content ?? ""
  const tags = keywordsMeta.split(",").map((t) => t.trim()).filter((t) => t.length > 1)
  const watchPercent =
    watchDuration > 0 ? Math.round((watchMaxSeconds / watchDuration) * 100) : 0

  const payload = [{
    url: watchUrl,
    title,
    tags,
    date: getTodayDate(),
    username: MeUser.username,
    name: MeUser.name,
    watched: true,
    watchSeconds: Math.round(watchMaxSeconds),
    watchPercent,
  }]

  // Use sendBeacon so the request survives page unload
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
  navigator.sendBeacon(
    `${API_BASE}/api/videos?key=${encodeURIComponent(process.env.API_SECRET ?? "")}`,
    blob
  )
  console.log(`[algomon] watched "${title}" — ${Math.round(watchMaxSeconds)}s (${watchPercent}%)`)
}

// ─── Recommendation scraping ────────────────────────────────────────────────

function findVideosAndUpload() {
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
    username: MeUser.username,
    name: MeUser.name,
  }))

  fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.API_SECRET ?? "" },
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

chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === "urlChange") {
    flushWatchEvent()
    seenUrls.clear()
    setTimeout(() => {
      if (window.location.pathname.startsWith("/watch")) startWatchTracking()
    }, 1500)
  }
})

// Initial load
setTimeout(() => {
  if (window.location.pathname.startsWith("/watch")) startWatchTracking()
}, 1500)
