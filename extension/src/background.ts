// Show DEV badge when running against localhost
const apiBase = process.env.API_BASE || ""
if (apiBase.includes("localhost")) {
  chrome.action.setBadgeText({ text: "DEV" })
  chrome.action.setBadgeBackgroundColor({ color: "#f97316" })
}

// Notify content scripts when the YouTube SPA navigates to a new page
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { message: "urlChange", url: changeInfo.url });
  }
});
