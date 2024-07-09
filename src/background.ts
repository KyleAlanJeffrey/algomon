import { db } from "./db";
console.log("Background script running...");
// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  // First, validate the message's structure.
  if (msg.from === "popup" && msg.subject === "getVideos") {
    response("Hello from background!");
  }
}); // console.log("Background script running...");
// const videos = db.videos.toArray();
// console.log(videos);
