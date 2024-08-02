import Dexie from "dexie";
import { Video, db } from "./db";
import { getTodayString, sleep } from "./helpers";

let scrollCallback: NodeJS.Timeout = setTimeout(() => {}, 0);

async function uploadData() {
  const videos = await db.videos.where({ uploaded: 0 }).toArray();
  if (videos.length !== 0) {
    console.log(`Uploading ${videos.length} videos...`);
    try {
      await fetch("https://api.example.com/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videos),
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
      console.log(`Added ${videos.length} videos.`);
      chrome.runtime.sendMessage({ action: "uploadVideos" });
    })
    .catch(Dexie.BulkError, (e) => {
      // Explicitly catching the bulkAdd() operation makes those successful
      // additions commit despite that there were errors.
      const failed = videos.length - e.failures.length;
      console.error(`Failed to add ${e.failures.length} videos.`);
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

  const date = getTodayString();
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
    const image = element.querySelector("#img");
    let imageUrl = null;
    if (image) {
      imageUrl = image.getAttribute("src");
    }

    return { title: titleText, url, imageUrl, date, uploaded: 0 };
  });
  // Filter out nullish values
  const videos = nullishVideos.filter((video) => video !== null) as Video[];
  writeToDb(videos);
}

function main() {
  console.log("Content script is running...");
  // Listen for messages from the popup
  console.log("Listening for messages...");
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
    if (request.action === "getVideos") {
      (async () => {
        const videos = await db.videos.toArray();
        sendResponse(videos);
      })();
    }
    // This tells runtime this is async
    return true;
  });
  // Add event listener for scrolling
  window.onscroll = function () {
    // Any new scroll will cancel the previous scroll event
    // if it hasn't been triggered yet
    console.log("Scrolling...");
    clearTimeout(scrollCallback);
    scrollCallback = setTimeout(findVideosAndSave, 1000);
  };
  // Add interval for uploading videos
  setInterval(uploadData, 1000 * 5);
}
main();
