const API_BASE = process.env.API_BASE ?? "https://algomon.kyle-jeffrey.com";

// Forward upload requests from content scripts.
// Content scripts on youtube.com cannot fetch localhost (Private Network Access
// restriction), but background service workers can.
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.message === "uploadVideos") {
    fetch(`${API_BASE}/api/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.payload),
    })
      .then(() => sendResponse({ ok: true }))
      .catch((err) => {
        console.error("Failed to upload videos:", err);
        sendResponse({ ok: false });
      });
    return true; // keep message channel open for async response
  }
});

// Notify content scripts when the YouTube SPA navigates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { message: "urlChange", url: changeInfo.url });
  }
});
