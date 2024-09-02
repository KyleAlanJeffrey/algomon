/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content_script.tsx":
/*!********************************!*\
  !*** ./src/content_script.tsx ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var dexie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dexie */ "./node_modules/dexie/import-wrapper.mjs");
/* harmony import */ var _db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./db */ "./src/db.ts");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



let scrollCallback = setTimeout(() => { }, 0);
const MeUser = {
    username: "sniffmefinger",
    name: "Kyle Jeffrey",
};
// const endpoint = "https://algomon.kyle-jeffrey.com:3001/";
const endpoint = "http://localhost:3001/";
function wipeDb() {
    return __awaiter(this, void 0, void 0, function* () {
        yield _db__WEBPACK_IMPORTED_MODULE_1__.db.videos.clear();
    });
}
function uploadData() {
    return __awaiter(this, void 0, void 0, function* () {
        const videos = yield _db__WEBPACK_IMPORTED_MODULE_1__.db.videos.where({ uploaded: 0 }).toArray();
        if (videos.length !== 0) {
            console.log(`Uploading ${videos.length} videos...`);
            try {
                yield fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user: MeUser, videos: videos }),
                });
                yield _db__WEBPACK_IMPORTED_MODULE_1__.db.videos.bulkPut(videos.map((video) => (Object.assign(Object.assign({}, video), { uploaded: 1 }))));
            }
            catch (_a) {
                console.error("Failed to upload videos.");
            }
        }
    });
}
function writeToDb(videos) {
    _db__WEBPACK_IMPORTED_MODULE_1__.db.videos.bulkAdd(videos)
        .then((lastKey) => {
        console.log(`Added ${videos.length} videos to db.`);
    })
        .catch(dexie__WEBPACK_IMPORTED_MODULE_0__["default"].BulkError, (e) => {
        // Explicitly catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        const failed = videos.length - e.failures.length;
        console.warn(`Failed to add ${e.failures.length} videos. Probably duplicates.`);
    });
}
function findVideosAndSave() {
    console.log("Finding videos on the page...");
    const compactElement = document.querySelectorAll("ytd-compact-video-renderer");
    const richElements = document.querySelectorAll("ytd-rich-item-renderer");
    const elements = Array.from(compactElement).concat(Array.from(richElements));
    console.log(`Found ${elements.length} videos on the page`);
    const nullishVideos = elements.map((element) => {
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
        return {
            title: titleText,
            url,
            imageUrl,
            dateTime: new Date(),
            date: (0,_helpers__WEBPACK_IMPORTED_MODULE_2__.getTodayDate)(),
            uploaded: 0,
        };
    });
    // Filter out nullish values
    const videos = nullishVideos.filter((video) => video !== null);
    writeToDb(videos);
}
function getUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        // see the note below on how to choose currentWindow or lastFocusedWindow
        const [tab] = yield chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
        });
        return tab.url;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
// Add listener for url change. Youtube is a single page app so we need to listen for url changes
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        // listen for messages sent from background.js
        if (request.message === "urlChange") {
            console.log("Wiping database");
            yield wipeDb();
        }
        return true; // tells the browser this is async
    });
});
main();


/***/ }),

/***/ "./src/db.ts":
/*!*******************!*\
  !*** ./src/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "db": () => (/* binding */ db)
/* harmony export */ });
/* harmony import */ var dexie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dexie */ "./node_modules/dexie/import-wrapper.mjs");
// db.ts

console.log("Opening database...");
const db = new dexie__WEBPACK_IMPORTED_MODULE_0__["default"]("AlgomonDatabase");
// Schema declaration:
// ++	Auto-incremented primary key
// &	Unique index
// *	Multi-entry index
// [A+B]	Compound index or primary key
db.version(3).stores({
    videos: "url, title, imageUrl, date, uploaded", // primary key "url" (for the runtime!)
});
db.open()
    .then((e) => {
    console.log("Database opened successfully");
})
    .catch((e) => {
    console.error("Open failed: " + e.stack);
});



/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "blacklistWords": () => (/* binding */ blacklistWords),
/* harmony export */   "getTodayDate": () => (/* binding */ getTodayDate),
/* harmony export */   "sleep": () => (/* binding */ sleep)
/* harmony export */ });
function getTodayDate() {
    // Get todays date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const blacklistWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "at",
    "with",
    "without",
    "for",
    "from",
    "by",
    "about",
    "is",
    "are",
    "what",
    "why",
    "how",
    "i",
    "my",
    "into",
    "more",
    'dir="auto"',
    "<span",
    "&amp",
    "&amp;",
    'class="style-scope',
    "style-scope",
    "video)",
    "this",
    "be",
    "can",
    "you",
    "&",
    "it",
    "so",
];
const userBlacklistWords = ["(official"];


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"content_script": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkchrome_extension_typescript_starter"] = self["webpackChunkchrome_extension_typescript_starter"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/content_script.tsx")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDSkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvLi9zcmMvY29udGVudF9zY3JpcHQudHN4Iiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyLy4vc3JjL2RiLnRzIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyLy4vc3JjL2hlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL25vZGUgbW9kdWxlIGRlY29yYXRvciIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5pbXBvcnQgRGV4aWUgZnJvbSBcImRleGllXCI7XG5pbXBvcnQgeyBkYiB9IGZyb20gXCIuL2RiXCI7XG5pbXBvcnQgeyBnZXRUb2RheURhdGUgfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5sZXQgc2Nyb2xsQ2FsbGJhY2sgPSBzZXRUaW1lb3V0KCgpID0+IHsgfSwgMCk7XG5jb25zdCBNZVVzZXIgPSB7XG4gICAgdXNlcm5hbWU6IFwic25pZmZtZWZpbmdlclwiLFxuICAgIG5hbWU6IFwiS3lsZSBKZWZmcmV5XCIsXG59O1xuLy8gY29uc3QgZW5kcG9pbnQgPSBcImh0dHBzOi8vYWxnb21vbi5reWxlLWplZmZyZXkuY29tOjMwMDEvXCI7XG5jb25zdCBlbmRwb2ludCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAxL1wiO1xuZnVuY3Rpb24gd2lwZURiKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHlpZWxkIGRiLnZpZGVvcy5jbGVhcigpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gdXBsb2FkRGF0YSgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zdCB2aWRlb3MgPSB5aWVsZCBkYi52aWRlb3Mud2hlcmUoeyB1cGxvYWRlZDogMCB9KS50b0FycmF5KCk7XG4gICAgICAgIGlmICh2aWRlb3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVXBsb2FkaW5nICR7dmlkZW9zLmxlbmd0aH0gdmlkZW9zLi4uYCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGZldGNoKGVuZHBvaW50LCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHVzZXI6IE1lVXNlciwgdmlkZW9zOiB2aWRlb3MgfSksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgeWllbGQgZGIudmlkZW9zLmJ1bGtQdXQodmlkZW9zLm1hcCgodmlkZW8pID0+IChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHZpZGVvKSwgeyB1cGxvYWRlZDogMSB9KSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChfYSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gdXBsb2FkIHZpZGVvcy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmZ1bmN0aW9uIHdyaXRlVG9EYih2aWRlb3MpIHtcbiAgICBkYi52aWRlb3NcbiAgICAgICAgLmJ1bGtBZGQodmlkZW9zKVxuICAgICAgICAudGhlbigobGFzdEtleSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgQWRkZWQgJHt2aWRlb3MubGVuZ3RofSB2aWRlb3MgdG8gZGIuYCk7XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKERleGllLkJ1bGtFcnJvciwgKGUpID0+IHtcbiAgICAgICAgLy8gRXhwbGljaXRseSBjYXRjaGluZyB0aGUgYnVsa0FkZCgpIG9wZXJhdGlvbiBtYWtlcyB0aG9zZSBzdWNjZXNzZnVsXG4gICAgICAgIC8vIGFkZGl0aW9ucyBjb21taXQgZGVzcGl0ZSB0aGF0IHRoZXJlIHdlcmUgZXJyb3JzLlxuICAgICAgICBjb25zdCBmYWlsZWQgPSB2aWRlb3MubGVuZ3RoIC0gZS5mYWlsdXJlcy5sZW5ndGg7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGFkZCAke2UuZmFpbHVyZXMubGVuZ3RofSB2aWRlb3MuIFByb2JhYmx5IGR1cGxpY2F0ZXMuYCk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmaW5kVmlkZW9zQW5kU2F2ZSgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkZpbmRpbmcgdmlkZW9zIG9uIHRoZSBwYWdlLi4uXCIpO1xuICAgIGNvbnN0IGNvbXBhY3RFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInl0ZC1jb21wYWN0LXZpZGVvLXJlbmRlcmVyXCIpO1xuICAgIGNvbnN0IHJpY2hFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ5dGQtcmljaC1pdGVtLXJlbmRlcmVyXCIpO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gQXJyYXkuZnJvbShjb21wYWN0RWxlbWVudCkuY29uY2F0KEFycmF5LmZyb20ocmljaEVsZW1lbnRzKSk7XG4gICAgY29uc29sZS5sb2coYEZvdW5kICR7ZWxlbWVudHMubGVuZ3RofSB2aWRlb3Mgb24gdGhlIHBhZ2VgKTtcbiAgICBjb25zdCBudWxsaXNoVmlkZW9zID0gZWxlbWVudHMubWFwKChlbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlby10aXRsZS1saW5rXCIpO1xuICAgICAgICBpZiAoIXRpdGxlRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlby10aXRsZVwiKTtcbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gdGl0bGUudGV4dENvbnRlbnQ7XG4gICAgICAgIGlmICghdGl0bGVUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1cmwgPSB0aXRsZUVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGltYWdlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpO1xuICAgICAgICBsZXQgaW1hZ2VVcmwgPSBudWxsO1xuICAgICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICAgIGltYWdlVXJsID0gaW1hZ2UuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgICAgICAgICAgaWYgKCFpbWFnZVVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogdGl0bGVUZXh0LFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgaW1hZ2VVcmwsXG4gICAgICAgICAgICBkYXRlVGltZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGRhdGU6IGdldFRvZGF5RGF0ZSgpLFxuICAgICAgICAgICAgdXBsb2FkZWQ6IDAsXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgLy8gRmlsdGVyIG91dCBudWxsaXNoIHZhbHVlc1xuICAgIGNvbnN0IHZpZGVvcyA9IG51bGxpc2hWaWRlb3MuZmlsdGVyKCh2aWRlbykgPT4gdmlkZW8gIT09IG51bGwpO1xuICAgIHdyaXRlVG9EYih2aWRlb3MpO1xufVxuZnVuY3Rpb24gZ2V0VXJsKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIHNlZSB0aGUgbm90ZSBiZWxvdyBvbiBob3cgdG8gY2hvb3NlIGN1cnJlbnRXaW5kb3cgb3IgbGFzdEZvY3VzZWRXaW5kb3dcbiAgICAgICAgY29uc3QgW3RhYl0gPSB5aWVsZCBjaHJvbWUudGFicy5xdWVyeSh7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBsYXN0Rm9jdXNlZFdpbmRvdzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0YWIudXJsO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gbWFpbigpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHNjcm9sbGluZ1xuICAgICAgICB3aW5kb3cub25zY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBBbnkgbmV3IHNjcm9sbCB3aWxsIGNhbmNlbCB0aGUgcHJldmlvdXMgc2Nyb2xsIGV2ZW50XG4gICAgICAgICAgICAvLyBpZiBpdCBoYXNuJ3QgYmVlbiB0cmlnZ2VyZWQgeWV0XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNjcm9sbGluZy4uLlwiKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzY3JvbGxDYWxsYmFjayk7XG4gICAgICAgICAgICBzY3JvbGxDYWxsYmFjayA9IHNldFRpbWVvdXQoZmluZFZpZGVvc0FuZFNhdmUsIDEwMDApO1xuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgaW50ZXJ2YWwgZm9yIHVwbG9hZGluZyB2aWRlb3NcbiAgICAgICAgc2V0SW50ZXJ2YWwodXBsb2FkRGF0YSwgMTAwMCAqIDEpO1xuICAgIH0pO1xufVxuLy8gQWRkIGxpc3RlbmVyIGZvciB1cmwgY2hhbmdlLiBZb3V0dWJlIGlzIGEgc2luZ2xlIHBhZ2UgYXBwIHNvIHdlIG5lZWQgdG8gbGlzdGVuIGZvciB1cmwgY2hhbmdlc1xuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIGxpc3RlbiBmb3IgbWVzc2FnZXMgc2VudCBmcm9tIGJhY2tncm91bmQuanNcbiAgICAgICAgaWYgKHJlcXVlc3QubWVzc2FnZSA9PT0gXCJ1cmxDaGFuZ2VcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJXaXBpbmcgZGF0YWJhc2VcIik7XG4gICAgICAgICAgICB5aWVsZCB3aXBlRGIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gdGVsbHMgdGhlIGJyb3dzZXIgdGhpcyBpcyBhc3luY1xuICAgIH0pO1xufSk7XG5tYWluKCk7XG4iLCIvLyBkYi50c1xuaW1wb3J0IERleGllIGZyb20gXCJkZXhpZVwiO1xuY29uc29sZS5sb2coXCJPcGVuaW5nIGRhdGFiYXNlLi4uXCIpO1xuY29uc3QgZGIgPSBuZXcgRGV4aWUoXCJBbGdvbW9uRGF0YWJhc2VcIik7XG4vLyBTY2hlbWEgZGVjbGFyYXRpb246XG4vLyArK1x0QXV0by1pbmNyZW1lbnRlZCBwcmltYXJ5IGtleVxuLy8gJlx0VW5pcXVlIGluZGV4XG4vLyAqXHRNdWx0aS1lbnRyeSBpbmRleFxuLy8gW0ErQl1cdENvbXBvdW5kIGluZGV4IG9yIHByaW1hcnkga2V5XG5kYi52ZXJzaW9uKDMpLnN0b3Jlcyh7XG4gICAgdmlkZW9zOiBcInVybCwgdGl0bGUsIGltYWdlVXJsLCBkYXRlLCB1cGxvYWRlZFwiLCAvLyBwcmltYXJ5IGtleSBcInVybFwiIChmb3IgdGhlIHJ1bnRpbWUhKVxufSk7XG5kYi5vcGVuKClcbiAgICAudGhlbigoZSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiRGF0YWJhc2Ugb3BlbmVkIHN1Y2Nlc3NmdWxseVwiKTtcbn0pXG4gICAgLmNhdGNoKChlKSA9PiB7XG4gICAgY29uc29sZS5lcnJvcihcIk9wZW4gZmFpbGVkOiBcIiArIGUuc3RhY2spO1xufSk7XG5leHBvcnQgeyBkYiB9O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldFRvZGF5RGF0ZSgpIHtcbiAgICAvLyBHZXQgdG9kYXlzIGRhdGUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBkYXlcbiAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgdG9kYXkuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gICAgcmV0dXJuIHRvZGF5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwKG1zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5leHBvcnQgY29uc3QgYmxhY2tsaXN0V29yZHMgPSBbXG4gICAgXCJ0aGVcIixcbiAgICBcImFcIixcbiAgICBcImFuXCIsXG4gICAgXCJhbmRcIixcbiAgICBcIm9yXCIsXG4gICAgXCJvZlwiLFxuICAgIFwidG9cIixcbiAgICBcImluXCIsXG4gICAgXCJvblwiLFxuICAgIFwiYXRcIixcbiAgICBcIndpdGhcIixcbiAgICBcIndpdGhvdXRcIixcbiAgICBcImZvclwiLFxuICAgIFwiZnJvbVwiLFxuICAgIFwiYnlcIixcbiAgICBcImFib3V0XCIsXG4gICAgXCJpc1wiLFxuICAgIFwiYXJlXCIsXG4gICAgXCJ3aGF0XCIsXG4gICAgXCJ3aHlcIixcbiAgICBcImhvd1wiLFxuICAgIFwiaVwiLFxuICAgIFwibXlcIixcbiAgICBcImludG9cIixcbiAgICBcIm1vcmVcIixcbiAgICAnZGlyPVwiYXV0b1wiJyxcbiAgICBcIjxzcGFuXCIsXG4gICAgXCImYW1wXCIsXG4gICAgXCImYW1wO1wiLFxuICAgICdjbGFzcz1cInN0eWxlLXNjb3BlJyxcbiAgICBcInN0eWxlLXNjb3BlXCIsXG4gICAgXCJ2aWRlbylcIixcbiAgICBcInRoaXNcIixcbiAgICBcImJlXCIsXG4gICAgXCJjYW5cIixcbiAgICBcInlvdVwiLFxuICAgIFwiJlwiLFxuICAgIFwiaXRcIixcbiAgICBcInNvXCIsXG5dO1xuY29uc3QgdXNlckJsYWNrbGlzdFdvcmRzID0gW1wiKG9mZmljaWFsXCJdO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0bG9hZGVkOiBmYWxzZSxcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG5cdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubm1kID0gKG1vZHVsZSkgPT4ge1xuXHRtb2R1bGUucGF0aHMgPSBbXTtcblx0aWYgKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRyZXR1cm4gbW9kdWxlO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJjb250ZW50X3NjcmlwdFwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjaHJvbWVfZXh0ZW5zaW9uX3R5cGVzY3JpcHRfc3RhcnRlclwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjaHJvbWVfZXh0ZW5zaW9uX3R5cGVzY3JpcHRfc3RhcnRlclwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9yXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2NvbnRlbnRfc2NyaXB0LnRzeFwiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9