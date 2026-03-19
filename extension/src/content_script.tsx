import { getTodayDate } from "./helpers";

const API_BASE = process.env.API_BASE ?? "https://algomon.kyle-jeffrey.com";
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
    date: today instanceof Date ? today.toISOString().split("T")[0] : undefined,
    username: MeUser.username,
    name: MeUser.name,
  }));

  fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(() => {
    console.log(`[algomon] +${found.length} videos (${seenUrls.size} total this session)`);
  }).catch(() => console.warn("[algomon] Upload failed, will retry on next scroll."));
}

window.onscroll = function () {
  clearTimeout(scrollCallback);
  scrollCallback = setTimeout(findVideosAndUpload, 800);
};

// Reset seen URLs on YouTube SPA navigation
chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === "urlChange") seenUrls.clear();
  return true;
});
