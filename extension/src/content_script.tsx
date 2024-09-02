import Dexie from "dexie";
import { Video, db } from "./db";
import { getTodayDate } from "./helpers";

let scrollCallback: NodeJS.Timeout = setTimeout(() => {}, 0);
const MeUser = {
  username: "sniffmefinger",
  name: "Kyle Jeffrey",
};
// const endpoint = "https://algomon.kyle-jeffrey.com:3001/";
const endpoint = "http://localhost:3001/";

async function wipeDb() {
  await db.videos.clear();
}
async function uploadData() {
  const videos = await db.videos.where({ uploaded: 0 }).toArray();
  if (videos.length !== 0) {
    console.log(`Uploading ${videos.length} videos...`);
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: MeUser, videos: videos }),
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
    let imageUrl = null;
    if (image) {
      imageUrl = image.getAttribute("src");
      if (!imageUrl) {
        return null;
      }
    }

    return { title: titleText, url, imageUrl, dateTime: new Date(), date: getTodayDate(), uploaded: 0 };
  });
  // Filter out nullish values
  const videos = nullishVideos.filter((video) => video !== null) as Video[];
  writeToDb(videos);
}

async function getUrl() {
  // see the note below on how to choose currentWindow or lastFocusedWindow
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab.url;
}

async function main() {  
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

main();
