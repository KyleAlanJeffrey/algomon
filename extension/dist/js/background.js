/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it
    // like send the new url to contentscripts.js
    if (changeInfo.url) {
        console.log("URL changed to " + changeInfo.url);
        chrome.tabs.sendMessage(tabId, {
            message: "urlChange",
            url: changeInfo.url,
        });
    }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvLi9zcmMvYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikge1xuICAgIC8vIHJlYWQgY2hhbmdlSW5mbyBkYXRhIGFuZCBkbyBzb21ldGhpbmcgd2l0aCBpdFxuICAgIC8vIGxpa2Ugc2VuZCB0aGUgbmV3IHVybCB0byBjb250ZW50c2NyaXB0cy5qc1xuICAgIGlmIChjaGFuZ2VJbmZvLnVybCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVSTCBjaGFuZ2VkIHRvIFwiICsgY2hhbmdlSW5mby51cmwpO1xuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICAgICAgbWVzc2FnZTogXCJ1cmxDaGFuZ2VcIixcbiAgICAgICAgICAgIHVybDogY2hhbmdlSW5mby51cmwsXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9