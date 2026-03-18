import Dexie from "dexie";
import { Video, db } from "./db";
import { getTodayDate } from "./helpers";

const API_BASE = process.env.API_BASE ?? "https://algomon.kyle-jeffrey.com";
let scrollCallback: NodeJS.Timeout = setTimeout(() => {}, 0);
const MeUser = {
  username: "sniffmefinger",
  name: "Kyle Jeffrey",
};

async function wipeDb() {
  await db.videos.clear();
}
async function uploadData() {
  const videos = await db.videos.where({ uploaded: 0 }).toArray();
  if (videos.length !== 0) {
    console.log(`Uploading ${videos.length} videos...`);
    try {
      const payload = videos.map((v) => ({
        url: v.url,
        title: v.title,
        imageUrl: v.imageUrl ?? undefined,
        date: v.date instanceof Date
          ? v.date.toISOString().split("T")[0]
          : undefined,
        username: MeUser.username,
        name: MeUser.name,
      }));
      await fetch(`${API_BASE}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await db.videos.bulkPut(
        videos.map((video) => ({ ...video, uploaded: 1 }))
      );
    } catch {
      console.error("Failed to upload videos.");
    }
  }
}

function writeToDb(videos: Video[]) {
  db.videos
    .bulkAdd(videos)
    .then((lastKey) => {
      console.log(`Added ${videos.length} videos to db.`);
    })
    .catch(Dexie.BulkError, (e) => {
      // Explicitly catching the bulkAdd() operation makes those successful
      // additions commit despite that there were errors.
      const failed = videos.length - e.failures.length;
      console.warn(
        `Failed to add ${e.failures.length} videos. Probably duplicates.`
      );
    });
}

function toAbsUrl(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  return "https://www.youtube.com" + href;
}

function findVideosAndSave() {
  const today = getTodayDate();
  const found: Video[] = [];

  // ── New structure: home feed / search (yt-lockup-view-model) ──
  document.querySelectorAll<HTMLElement>("yt-lockup-view-model").forEach((el) => {
    // Skip ads
    if (el.closest("ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, feed-ad-metadata-view-model")) return;

    const h3 = el.querySelector("h3[title]");
    const titleLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-metadata-view-model__title");
    const thumbnailLink = el.querySelector<HTMLAnchorElement>("a.yt-lockup-view-model__content-image");
    const img = el.querySelector<HTMLImageElement>(".ytThumbnailViewModelImage img");

    const title = h3?.getAttribute("title") || titleLink?.querySelector("span")?.textContent?.trim();
    const url = toAbsUrl(thumbnailLink?.getAttribute("href") || titleLink?.getAttribute("href") || null);
    const imageUrl = img?.getAttribute("src") || null;

    if (url && title) {
      found.push({ url, title, imageUrl, dateTime: new Date(), date: today, uploaded: 0 });
    }
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

    if (url && title) {
      found.push({ url, title, imageUrl, dateTime: new Date(), date: today, uploaded: 0 });
    }
  });

  // ── Old structure: sidebar on watch page (ytd-compact-video-renderer) ──
  document.querySelectorAll<HTMLElement>("ytd-compact-video-renderer").forEach((el) => {
    const titleEl = el.querySelector<HTMLAnchorElement>("#video-title-link");
    const title = titleEl?.querySelector("#video-title")?.textContent?.trim();
    const url = toAbsUrl(titleEl?.getAttribute("href") || null);
    const img = el.querySelector<HTMLImageElement>("img");
    const imageUrl = img?.getAttribute("src") || null;

    if (url && title) {
      found.push({ url, title, imageUrl, dateTime: new Date(), date: today, uploaded: 0 });
    }
  });

  console.log(`Found ${found.length} videos on the page`);
  if (found.length > 0) writeToDb(found);
}

async function main() {
  // Wipe db on mount
  console.log("Wiping database");
  await wipeDb();
  // Add event listener for scrolling
  window.onscroll = function () {
    // Any new scroll will cancel the previous scroll event
    // if it hasn't been triggered yet
    console.log("Scrolling...");
    clearTimeout(scrollCallback);
    scrollCallback = setTimeout(findVideosAndSave, 1000);
  };
  // Add interval for uploading videos
  setInterval(uploadData, 1000 * 1);
}
// Add listener for url change. Youtube is a single page app so we need to listen for url changes
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  // listen for messages sent from background.js
  if (request.message === "urlChange") {
    console.log("Wiping database");
    await wipeDb();
  }
  return true; // tells the browser this is async
});

main();
