import { getTodayString, sleep } from "./helpers";

let titles: NodeListOf<Element>;
async function findVideoTitles(addTitles: NodeListOf<Element>) {
  const prevTitles = titles;
  titles = document.querySelectorAll("#video-title");
  if (prevTitles && prevTitles.length === titles.length) {
    console.log("No new titles found");
    return;
  }
  console.log(`Found ${titles.length} video titles`);
  console.log("Writing to storage");
  const today = getTodayString();

  const initalValues = addTitles
    ? Array.from(addTitles).map((title) => title.innerHTML)
    : [];
  const values = Array.from(titles).map((title) => title.innerHTML);

  let storage = {};
  /* @ts-ignore */
  storage[today] = values.concat(initalValues);
  chrome.storage.local.set(storage).then(() => {
    console.log("Stored!");
  });
}

let scrollCallback: NodeJS.Timeout = setTimeout(() => {}, 0);

async function main() {
  let initialTitles: NodeListOf<Element>;
  const result = await chrome.storage.local.get(getTodayString());
  if (result[getTodayString()]) {
    console.log(result);
    console.log(`Found ${result[getTodayString()].length} titles in storage`);
    initialTitles = result[getTodayString()];
  }

  // Add event listener for scrolling
  window.onscroll = async function () {
    // Any new scroll will cancel the previous scroll event
    // if it hasn't been triggered yet
    clearTimeout(scrollCallback);
    scrollCallback = setTimeout(() => findVideoTitles(initialTitles), 1000);
  };
}

main();
