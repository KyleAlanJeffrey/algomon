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
function uploadData() {
    return __awaiter(this, void 0, void 0, function* () {
        const videos = yield _db__WEBPACK_IMPORTED_MODULE_1__.db.videos.where({ uploaded: 0 }).toArray();
        if (videos.length !== 0) {
            console.log(`Uploading ${videos.length} videos...`);
            try {
                yield fetch("http://localhost:3001/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(videos),
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
        console.log(`Added ${videos.length} videos.`);
        chrome.runtime.sendMessage({ action: "uploadVideos" });
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
    const date = (0,_helpers__WEBPACK_IMPORTED_MODULE_2__.getTodayString)();
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
        return { title: titleText, url, imageUrl, date, uploaded: 0 };
    });
    // Filter out nullish values
    const videos = nullishVideos.filter((video) => video !== null);
    writeToDb(videos);
}
function main() {
    console.log("Content script is running...");
    // Listen for messages from the popup
    console.log("Listening for messages...");
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log(sender.tab
            ? "from a content script:" + sender.tab.url
            : "from the extension");
        if (request.action === "getVideos") {
            (() => __awaiter(this, void 0, void 0, function* () {
                const videos = yield _db__WEBPACK_IMPORTED_MODULE_1__.db.videos.toArray();
                sendResponse(videos);
            }))();
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
    setInterval(uploadData, 1000 * 1);
}
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
/* harmony export */   "getTodayString": () => (/* binding */ getTodayString),
/* harmony export */   "sleep": () => (/* binding */ sleep)
/* harmony export */ });
function getTodayString() {
    return new Date().toISOString().split("T")[0];
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ0pBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyLy4vc3JjL2NvbnRlbnRfc2NyaXB0LnRzeCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci8uL3NyYy9kYi50cyIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci8uL3NyYy9oZWxwZXJzLnRzIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9ub2RlIG1vZHVsZSBkZWNvcmF0b3IiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuaW1wb3J0IERleGllIGZyb20gXCJkZXhpZVwiO1xuaW1wb3J0IHsgZGIgfSBmcm9tIFwiLi9kYlwiO1xuaW1wb3J0IHsgZ2V0VG9kYXlTdHJpbmcgfSBmcm9tIFwiLi9oZWxwZXJzXCI7XG5sZXQgc2Nyb2xsQ2FsbGJhY2sgPSBzZXRUaW1lb3V0KCgpID0+IHsgfSwgMCk7XG5mdW5jdGlvbiB1cGxvYWREYXRhKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHZpZGVvcyA9IHlpZWxkIGRiLnZpZGVvcy53aGVyZSh7IHVwbG9hZGVkOiAwIH0pLnRvQXJyYXkoKTtcbiAgICAgICAgaWYgKHZpZGVvcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVcGxvYWRpbmcgJHt2aWRlb3MubGVuZ3RofSB2aWRlb3MuLi5gKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgeWllbGQgZmV0Y2goXCJodHRwOi8vbG9jYWxob3N0OjMwMDEvXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHZpZGVvcyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgeWllbGQgZGIudmlkZW9zLmJ1bGtQdXQodmlkZW9zLm1hcCgodmlkZW8pID0+IChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHZpZGVvKSwgeyB1cGxvYWRlZDogMSB9KSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChfYSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gdXBsb2FkIHZpZGVvcy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmZ1bmN0aW9uIHdyaXRlVG9EYih2aWRlb3MpIHtcbiAgICBkYi52aWRlb3NcbiAgICAgICAgLmJ1bGtBZGQodmlkZW9zKVxuICAgICAgICAudGhlbigobGFzdEtleSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgQWRkZWQgJHt2aWRlb3MubGVuZ3RofSB2aWRlb3MuYCk7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgYWN0aW9uOiBcInVwbG9hZFZpZGVvc1wiIH0pO1xuICAgIH0pXG4gICAgICAgIC5jYXRjaChEZXhpZS5CdWxrRXJyb3IsIChlKSA9PiB7XG4gICAgICAgIC8vIEV4cGxpY2l0bHkgY2F0Y2hpbmcgdGhlIGJ1bGtBZGQoKSBvcGVyYXRpb24gbWFrZXMgdGhvc2Ugc3VjY2Vzc2Z1bFxuICAgICAgICAvLyBhZGRpdGlvbnMgY29tbWl0IGRlc3BpdGUgdGhhdCB0aGVyZSB3ZXJlIGVycm9ycy5cbiAgICAgICAgY29uc3QgZmFpbGVkID0gdmlkZW9zLmxlbmd0aCAtIGUuZmFpbHVyZXMubGVuZ3RoO1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBhZGQgJHtlLmZhaWx1cmVzLmxlbmd0aH0gdmlkZW9zLiBQcm9iYWJseSBkdXBsaWNhdGVzLmApO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZmluZFZpZGVvc0FuZFNhdmUoKSB7XG4gICAgY29uc29sZS5sb2coXCJGaW5kaW5nIHZpZGVvcyBvbiB0aGUgcGFnZS4uLlwiKTtcbiAgICBjb25zdCBjb21wYWN0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ5dGQtY29tcGFjdC12aWRlby1yZW5kZXJlclwiKTtcbiAgICBjb25zdCByaWNoRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwieXRkLXJpY2gtaXRlbS1yZW5kZXJlclwiKTtcbiAgICBjb25zdCBlbGVtZW50cyA9IEFycmF5LmZyb20oY29tcGFjdEVsZW1lbnQpLmNvbmNhdChBcnJheS5mcm9tKHJpY2hFbGVtZW50cykpO1xuICAgIGNvbnNvbGUubG9nKGBGb3VuZCAke2VsZW1lbnRzLmxlbmd0aH0gdmlkZW9zIG9uIHRoZSBwYWdlYCk7XG4gICAgY29uc3QgZGF0ZSA9IGdldFRvZGF5U3RyaW5nKCk7XG4gICAgY29uc3QgbnVsbGlzaFZpZGVvcyA9IGVsZW1lbnRzLm1hcCgoZWxlbWVudCkgPT4ge1xuICAgICAgICBjb25zdCB0aXRsZUVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8tdGl0bGUtbGlua1wiKTtcbiAgICAgICAgaWYgKCF0aXRsZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8tdGl0bGVcIik7XG4gICAgICAgIGlmICghdGl0bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpdGxlVGV4dCA9IHRpdGxlLnRleHRDb250ZW50O1xuICAgICAgICBpZiAoIXRpdGxlVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXJsID0gdGl0bGVFbGVtZW50LmdldEF0dHJpYnV0ZShcImhyZWZcIik7XG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWFnZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcImltZ1wiKTtcbiAgICAgICAgbGV0IGltYWdlVXJsID0gbnVsbDtcbiAgICAgICAgaWYgKGltYWdlKSB7XG4gICAgICAgICAgICBpbWFnZVVybCA9IGltYWdlLmdldEF0dHJpYnV0ZShcInNyY1wiKTtcbiAgICAgICAgICAgIGlmICghaW1hZ2VVcmwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0aXRsZTogdGl0bGVUZXh0LCB1cmwsIGltYWdlVXJsLCBkYXRlLCB1cGxvYWRlZDogMCB9O1xuICAgIH0pO1xuICAgIC8vIEZpbHRlciBvdXQgbnVsbGlzaCB2YWx1ZXNcbiAgICBjb25zdCB2aWRlb3MgPSBudWxsaXNoVmlkZW9zLmZpbHRlcigodmlkZW8pID0+IHZpZGVvICE9PSBudWxsKTtcbiAgICB3cml0ZVRvRGIodmlkZW9zKTtcbn1cbmZ1bmN0aW9uIG1haW4oKSB7XG4gICAgY29uc29sZS5sb2coXCJDb250ZW50IHNjcmlwdCBpcyBydW5uaW5nLi4uXCIpO1xuICAgIC8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgcG9wdXBcbiAgICBjb25zb2xlLmxvZyhcIkxpc3RlbmluZyBmb3IgbWVzc2FnZXMuLi5cIik7XG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhzZW5kZXIudGFiXG4gICAgICAgICAgICA/IFwiZnJvbSBhIGNvbnRlbnQgc2NyaXB0OlwiICsgc2VuZGVyLnRhYi51cmxcbiAgICAgICAgICAgIDogXCJmcm9tIHRoZSBleHRlbnNpb25cIik7XG4gICAgICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJnZXRWaWRlb3NcIikge1xuICAgICAgICAgICAgKCgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2aWRlb3MgPSB5aWVsZCBkYi52aWRlb3MudG9BcnJheSgpO1xuICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh2aWRlb3MpO1xuICAgICAgICAgICAgfSkpKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGhpcyB0ZWxscyBydW50aW1lIHRoaXMgaXMgYXN5bmNcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciBzY3JvbGxpbmdcbiAgICB3aW5kb3cub25zY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIEFueSBuZXcgc2Nyb2xsIHdpbGwgY2FuY2VsIHRoZSBwcmV2aW91cyBzY3JvbGwgZXZlbnRcbiAgICAgICAgLy8gaWYgaXQgaGFzbid0IGJlZW4gdHJpZ2dlcmVkIHlldFxuICAgICAgICBjb25zb2xlLmxvZyhcIlNjcm9sbGluZy4uLlwiKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbENhbGxiYWNrKTtcbiAgICAgICAgc2Nyb2xsQ2FsbGJhY2sgPSBzZXRUaW1lb3V0KGZpbmRWaWRlb3NBbmRTYXZlLCAxMDAwKTtcbiAgICB9O1xuICAgIC8vIEFkZCBpbnRlcnZhbCBmb3IgdXBsb2FkaW5nIHZpZGVvc1xuICAgIHNldEludGVydmFsKHVwbG9hZERhdGEsIDEwMDAgKiAxKTtcbn1cbm1haW4oKTtcbiIsIi8vIGRiLnRzXG5pbXBvcnQgRGV4aWUgZnJvbSBcImRleGllXCI7XG5jb25zb2xlLmxvZyhcIk9wZW5pbmcgZGF0YWJhc2UuLi5cIik7XG5jb25zdCBkYiA9IG5ldyBEZXhpZShcIkFsZ29tb25EYXRhYmFzZVwiKTtcbi8vIFNjaGVtYSBkZWNsYXJhdGlvbjpcbi8vICsrXHRBdXRvLWluY3JlbWVudGVkIHByaW1hcnkga2V5XG4vLyAmXHRVbmlxdWUgaW5kZXhcbi8vICpcdE11bHRpLWVudHJ5IGluZGV4XG4vLyBbQStCXVx0Q29tcG91bmQgaW5kZXggb3IgcHJpbWFyeSBrZXlcbmRiLnZlcnNpb24oMykuc3RvcmVzKHtcbiAgICB2aWRlb3M6IFwidXJsLCB0aXRsZSwgaW1hZ2VVcmwsIGRhdGUsIHVwbG9hZGVkXCIsIC8vIHByaW1hcnkga2V5IFwidXJsXCIgKGZvciB0aGUgcnVudGltZSEpXG59KTtcbmRiLm9wZW4oKVxuICAgIC50aGVuKChlKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJEYXRhYmFzZSBvcGVuZWQgc3VjY2Vzc2Z1bGx5XCIpO1xufSlcbiAgICAuY2F0Y2goKGUpID0+IHtcbiAgICBjb25zb2xlLmVycm9yKFwiT3BlbiBmYWlsZWQ6IFwiICsgZS5zdGFjayk7XG59KTtcbmV4cG9ydCB7IGRiIH07XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0VG9kYXlTdHJpbmcoKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdChcIlRcIilbMF07XG59XG5leHBvcnQgZnVuY3Rpb24gc2xlZXAobXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cbmV4cG9ydCBjb25zdCBibGFja2xpc3RXb3JkcyA9IFtcbiAgICBcInRoZVwiLFxuICAgIFwiYVwiLFxuICAgIFwiYW5cIixcbiAgICBcImFuZFwiLFxuICAgIFwib3JcIixcbiAgICBcIm9mXCIsXG4gICAgXCJ0b1wiLFxuICAgIFwiaW5cIixcbiAgICBcIm9uXCIsXG4gICAgXCJhdFwiLFxuICAgIFwid2l0aFwiLFxuICAgIFwid2l0aG91dFwiLFxuICAgIFwiZm9yXCIsXG4gICAgXCJmcm9tXCIsXG4gICAgXCJieVwiLFxuICAgIFwiYWJvdXRcIixcbiAgICBcImlzXCIsXG4gICAgXCJhcmVcIixcbiAgICBcIndoYXRcIixcbiAgICBcIndoeVwiLFxuICAgIFwiaG93XCIsXG4gICAgXCJpXCIsXG4gICAgXCJteVwiLFxuICAgIFwiaW50b1wiLFxuICAgIFwibW9yZVwiLFxuICAgICdkaXI9XCJhdXRvXCInLFxuICAgIFwiPHNwYW5cIixcbiAgICBcIiZhbXBcIixcbiAgICBcIiZhbXA7XCIsXG4gICAgJ2NsYXNzPVwic3R5bGUtc2NvcGUnLFxuICAgIFwic3R5bGUtc2NvcGVcIixcbiAgICBcInZpZGVvKVwiLFxuICAgIFwidGhpc1wiLFxuICAgIFwiYmVcIixcbiAgICBcImNhblwiLFxuICAgIFwieW91XCIsXG4gICAgXCImXCIsXG4gICAgXCJpdFwiLFxuICAgIFwic29cIixcbl07XG5jb25zdCB1c2VyQmxhY2tsaXN0V29yZHMgPSBbXCIob2ZmaWNpYWxcIl07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHRsb2FkZWQ6IGZhbHNlLFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcblx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5tZCA9IChtb2R1bGUpID0+IHtcblx0bW9kdWxlLnBhdGhzID0gW107XG5cdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0cmV0dXJuIG1vZHVsZTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwiY29udGVudF9zY3JpcHRcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rY2hyb21lX2V4dGVuc2lvbl90eXBlc2NyaXB0X3N0YXJ0ZXJcIl0gPSBzZWxmW1wid2VicGFja0NodW5rY2hyb21lX2V4dGVuc2lvbl90eXBlc2NyaXB0X3N0YXJ0ZXJcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvclwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9jb250ZW50X3NjcmlwdC50c3hcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==