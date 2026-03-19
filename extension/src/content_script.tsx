import { getTodayDate } from "./helpers";

const API_BASE = process.env.API_BASE ?? "https://algomon.kylejeffrey.com";
const MeUser = { username: "sniffmefinger", name: "Kyle Jeffrey" };

let scrollCallback: NodeJS.Timeout = setTimeout(() => {}, 0);
const seenUrls = new Set<string>();

function toAbsUrl(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  return "https://www.youtube.com" + href;
}

function findVideosAndUpload() {
  const today = getTodayDate();
  const found: { url: string; title: string; imageUrl: string | null }[] = [];

  // ── Home feed / search (yt-lockup-view-model) ──
  document.querySelectorAll<HTMLElement>("yt-lockup-view-model").forEach((el) => {
    if (el.closest("ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, feed-ad-metadata-view-model")) return;

    const h3 = el.querySelector("h3[title]");
    const titleLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-metadata-view-model__title");
    const thumbnailLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-view-model__content-image");
    const img = el.querySelector<HTMLImageElement>(".ytThumbnailViewModelImage img");

    const title = h3?.getAttribute("title") || titleLink?.querySelector("span")?.textContent?.trim();
    const url = toAbsUrl(thumbnailLink?.getAttribute("href") || titleLink?.getAttribute("href") || null);
    const imageUrl = img?.getAttribute("src") || null;

    if (url && title && !seenUrls.has(url)) found.push({ url, title, imageUrl });
  });

  // ── Shorts (ytm-shorts-lockup-view-model) ──
  document.querySelectorAll<HTMLElement>("ytm-shorts-lockup-view-model").forEach((el) => {
    const anchors = el.querySelectorAll<HTMLAnchorElement>("a.shortsLockupViewModelHostEndpoint");
    const titleAnchor = Array.from(anchors).find((a) => a.getAttribute("title"));
    const firstAnchor = anchors[0];
    const img = el.querySelector<HTMLImageElement>("img");

    const title = titleAnchor?.getAttribute("title") || el.querySelector("span")?.textContent?.trim();
    const url = toAbsUrl(firstAnchor?.getAttribute("href") || null);
    const imageUrl = img?.getAttribute("src") || null;

    if (url && title && !seenUrls.has(url)) found.push({ url, title, imageUrl });
  });

  // ── Watch page sidebar (ytd-compact-video-renderer) ──
  document.querySelectorAll<HTMLElement>("ytd-compact-video-renderer").forEach((el) => {
    const titleEl = el.querySelector<HTMLAnchorElement>("#video-title-link");
    const title = titleEl?.querySelector("#video-title")?.textContent?.trim();
    const url = toAbsUrl(titleEl?.getAttribute("href") || null);
    const img = el.querySelector<HTMLImageElement>("img");
    const imageUrl = img?.getAttribute("src") || null;

    if (url && title && !seenUrls.has(url)) found.push({ url, title, imageUrl });
  });

  if (found.length === 0) return;

  found.forEach((v) => seenUrls.add(v.url));

  const payload = found.map((v) => ({
    url: v.url,
    title: v.title,
    imageUrl: v.imageUrl ?? undefined,
    date: today,
    username: MeUser.username,
    name: MeUser.name,
  }));

  fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.API_SECRET ?? "" },
    body: JSON.stringify(payload),
  }).then(() => {
    console.log(`[algomon] +${found.length} videos (${seenUrls.size} total this session)`);
  }).catch(() => console.warn("[algomon] Upload failed, will retry on next scroll."));
}

window.onscroll = function () {
  clearTimeout(scrollCallback);
  scrollCallback = setTimeout(findVideosAndUpload, 800);
};

function scrapeWatchPageTags() {
  if (!window.location.pathname.startsWith("/watch")) return;

  const url = window.location.href.split("&")[0]!; // strip extra params
  const title = document.querySelector<HTMLMetaElement>('meta[name="title"]')?.content
    || document.title.replace(/ - YouTube$/, "").trim();
  const keywordsMeta = document.querySelector<HTMLMetaElement>('meta[name="keywords"]')?.content ?? "";
  const tags = keywordsMeta
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 1);

  if (!url || !title || seenUrls.has(url)) return;
  seenUrls.add(url);

  const today = getTodayDate();
  fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.API_SECRET ?? "" },
    body: JSON.stringify([{
      url,
      title,
      tags,
      date: today,
      username: MeUser.username,
      name: MeUser.name,
    }]),
  }).then(() => {
    console.log(`[algomon] watch page: "${title}" (${tags.length} tags)`);
  }).catch(() => {});
}

// Reset seen URLs on YouTube SPA navigation and re-scrape watch page
chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === "urlChange") {
    seenUrls.clear();
    // Small delay for YouTube SPA to update meta tags
    setTimeout(scrapeWatchPageTags, 1500);
  }
});

// Also run on initial load
setTimeout(scrapeWatchPageTags, 1500);
