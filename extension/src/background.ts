// Notify content scripts when the YouTube SPA navigates to a new page
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { message: "urlChange", url: changeInfo.url });
  }
});
