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

function findVideosAndSave() {
  console.log("Finding videos on the page...");
  const compactElement = document.querySelectorAll(
    "ytd-compact-video-renderer"
  );
  const richElements = document.querySelectorAll("ytd-rich-item-renderer");
  const elements = Array.from(compactElement).concat(Array.from(richElements));
  console.log(`Found ${elements.length} videos on the page`);

  const nullishVideos: (Video | null)[] = elements.map((element) => {
    const titleElement = element.querySelector("#video-title-link");
    if (!titleElement) {
      return null;
    }
    const title = titleElement.querySelector("#video-title");
    if (!title) {
      return null;
    }
    const titleText = title.textContent;
    if (!titleText) {
      return null;
    }
    const url = titleElement.getAttribute("href");
    if (!url) {
      return null;
    }
    const image = element.querySelector("img");
    const imageUrl = image ? (image.getAttribute("src") || image.getAttribute("data-src")) : null;

    return {
      title: titleText,
      url,
      imageUrl,
      dateTime: new Date(),
      date: getTodayDate(),
      uploaded: 0,
    };
  });
  // Filter out nullish values
  const videos = nullishVideos.filter((video) => video !== null) as Video[];
  writeToDb(videos);
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
