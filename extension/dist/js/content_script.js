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
// const endpoint = "https://algomon.kyle-jeffrey.com:3001/"
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
        // Wipe the db on every page load
        console.log("Wiping database");
        yield wipeDb();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NKQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFaERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci8uL3NyYy9jb250ZW50X3NjcmlwdC50c3giLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvLi9zcmMvZGIudHMiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvLi9zcmMvaGVscGVycy50cyIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci93ZWJwYWNrL3J1bnRpbWUvbm9kZSBtb2R1bGUgZGVjb3JhdG9yIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2hyb21lLWV4dGVuc2lvbi10eXBlc2NyaXB0LXN0YXJ0ZXIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2Nocm9tZS1leHRlbnNpb24tdHlwZXNjcmlwdC1zdGFydGVyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmltcG9ydCBEZXhpZSBmcm9tIFwiZGV4aWVcIjtcbmltcG9ydCB7IGRiIH0gZnJvbSBcIi4vZGJcIjtcbmltcG9ydCB7IGdldFRvZGF5U3RyaW5nIH0gZnJvbSBcIi4vaGVscGVyc1wiO1xubGV0IHNjcm9sbENhbGxiYWNrID0gc2V0VGltZW91dCgoKSA9PiB7IH0sIDApO1xuY29uc3QgTWVVc2VyID0ge1xuICAgIHVzZXJuYW1lOiBcInNuaWZmbWVmaW5nZXJcIixcbiAgICBuYW1lOiBcIkt5bGUgSmVmZnJleVwiLFxufTtcbi8vIGNvbnN0IGVuZHBvaW50ID0gXCJodHRwczovL2FsZ29tb24ua3lsZS1qZWZmcmV5LmNvbTozMDAxL1wiXG5jb25zdCBlbmRwb2ludCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAxL1wiO1xuZnVuY3Rpb24gd2lwZURiKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIHlpZWxkIGRiLnZpZGVvcy5jbGVhcigpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gdXBsb2FkRGF0YSgpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zdCB2aWRlb3MgPSB5aWVsZCBkYi52aWRlb3Mud2hlcmUoeyB1cGxvYWRlZDogMCB9KS50b0FycmF5KCk7XG4gICAgICAgIGlmICh2aWRlb3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVXBsb2FkaW5nICR7dmlkZW9zLmxlbmd0aH0gdmlkZW9zLi4uYCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIGZldGNoKGVuZHBvaW50LCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHVzZXI6IE1lVXNlciwgdmlkZW9zOiB2aWRlb3MgfSksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgeWllbGQgZGIudmlkZW9zLmJ1bGtQdXQodmlkZW9zLm1hcCgodmlkZW8pID0+IChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHZpZGVvKSwgeyB1cGxvYWRlZDogMSB9KSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChfYSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gdXBsb2FkIHZpZGVvcy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmZ1bmN0aW9uIHdyaXRlVG9EYih2aWRlb3MpIHtcbiAgICBkYi52aWRlb3NcbiAgICAgICAgLmJ1bGtBZGQodmlkZW9zKVxuICAgICAgICAudGhlbigobGFzdEtleSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgQWRkZWQgJHt2aWRlb3MubGVuZ3RofSB2aWRlb3MgdG8gZGIuYCk7XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKERleGllLkJ1bGtFcnJvciwgKGUpID0+IHtcbiAgICAgICAgLy8gRXhwbGljaXRseSBjYXRjaGluZyB0aGUgYnVsa0FkZCgpIG9wZXJhdGlvbiBtYWtlcyB0aG9zZSBzdWNjZXNzZnVsXG4gICAgICAgIC8vIGFkZGl0aW9ucyBjb21taXQgZGVzcGl0ZSB0aGF0IHRoZXJlIHdlcmUgZXJyb3JzLlxuICAgICAgICBjb25zdCBmYWlsZWQgPSB2aWRlb3MubGVuZ3RoIC0gZS5mYWlsdXJlcy5sZW5ndGg7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGFkZCAke2UuZmFpbHVyZXMubGVuZ3RofSB2aWRlb3MuIFByb2JhYmx5IGR1cGxpY2F0ZXMuYCk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmaW5kVmlkZW9zQW5kU2F2ZSgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkZpbmRpbmcgdmlkZW9zIG9uIHRoZSBwYWdlLi4uXCIpO1xuICAgIGNvbnN0IGNvbXBhY3RFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInl0ZC1jb21wYWN0LXZpZGVvLXJlbmRlcmVyXCIpO1xuICAgIGNvbnN0IHJpY2hFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ5dGQtcmljaC1pdGVtLXJlbmRlcmVyXCIpO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gQXJyYXkuZnJvbShjb21wYWN0RWxlbWVudCkuY29uY2F0KEFycmF5LmZyb20ocmljaEVsZW1lbnRzKSk7XG4gICAgY29uc29sZS5sb2coYEZvdW5kICR7ZWxlbWVudHMubGVuZ3RofSB2aWRlb3Mgb24gdGhlIHBhZ2VgKTtcbiAgICBjb25zdCBkYXRlID0gZ2V0VG9kYXlTdHJpbmcoKTtcbiAgICBjb25zdCBudWxsaXNoVmlkZW9zID0gZWxlbWVudHMubWFwKChlbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlby10aXRsZS1saW5rXCIpO1xuICAgICAgICBpZiAoIXRpdGxlRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlby10aXRsZVwiKTtcbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gdGl0bGUudGV4dENvbnRlbnQ7XG4gICAgICAgIGlmICghdGl0bGVUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1cmwgPSB0aXRsZUVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGltYWdlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpO1xuICAgICAgICBsZXQgaW1hZ2VVcmwgPSBudWxsO1xuICAgICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICAgIGltYWdlVXJsID0gaW1hZ2UuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgICAgICAgICAgaWYgKCFpbWFnZVVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHRpdGxlOiB0aXRsZVRleHQsIHVybCwgaW1hZ2VVcmwsIGRhdGUsIHVwbG9hZGVkOiAwIH07XG4gICAgfSk7XG4gICAgLy8gRmlsdGVyIG91dCBudWxsaXNoIHZhbHVlc1xuICAgIGNvbnN0IHZpZGVvcyA9IG51bGxpc2hWaWRlb3MuZmlsdGVyKCh2aWRlbykgPT4gdmlkZW8gIT09IG51bGwpO1xuICAgIHdyaXRlVG9EYih2aWRlb3MpO1xufVxuZnVuY3Rpb24gZ2V0VXJsKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIC8vIHNlZSB0aGUgbm90ZSBiZWxvdyBvbiBob3cgdG8gY2hvb3NlIGN1cnJlbnRXaW5kb3cgb3IgbGFzdEZvY3VzZWRXaW5kb3dcbiAgICAgICAgY29uc3QgW3RhYl0gPSB5aWVsZCBjaHJvbWUudGFicy5xdWVyeSh7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBsYXN0Rm9jdXNlZFdpbmRvdzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0YWIudXJsO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gbWFpbigpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAvLyBXaXBlIHRoZSBkYiBvbiBldmVyeSBwYWdlIGxvYWRcbiAgICAgICAgY29uc29sZS5sb2coXCJXaXBpbmcgZGF0YWJhc2VcIik7XG4gICAgICAgIHlpZWxkIHdpcGVEYigpO1xuICAgICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHNjcm9sbGluZ1xuICAgICAgICB3aW5kb3cub25zY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBBbnkgbmV3IHNjcm9sbCB3aWxsIGNhbmNlbCB0aGUgcHJldmlvdXMgc2Nyb2xsIGV2ZW50XG4gICAgICAgICAgICAvLyBpZiBpdCBoYXNuJ3QgYmVlbiB0cmlnZ2VyZWQgeWV0XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNjcm9sbGluZy4uLlwiKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzY3JvbGxDYWxsYmFjayk7XG4gICAgICAgICAgICBzY3JvbGxDYWxsYmFjayA9IHNldFRpbWVvdXQoZmluZFZpZGVvc0FuZFNhdmUsIDEwMDApO1xuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgaW50ZXJ2YWwgZm9yIHVwbG9hZGluZyB2aWRlb3NcbiAgICAgICAgc2V0SW50ZXJ2YWwodXBsb2FkRGF0YSwgMTAwMCAqIDEpO1xuICAgIH0pO1xufVxubWFpbigpO1xuIiwiLy8gZGIudHNcbmltcG9ydCBEZXhpZSBmcm9tIFwiZGV4aWVcIjtcbmNvbnNvbGUubG9nKFwiT3BlbmluZyBkYXRhYmFzZS4uLlwiKTtcbmNvbnN0IGRiID0gbmV3IERleGllKFwiQWxnb21vbkRhdGFiYXNlXCIpO1xuLy8gU2NoZW1hIGRlY2xhcmF0aW9uOlxuLy8gKytcdEF1dG8taW5jcmVtZW50ZWQgcHJpbWFyeSBrZXlcbi8vICZcdFVuaXF1ZSBpbmRleFxuLy8gKlx0TXVsdGktZW50cnkgaW5kZXhcbi8vIFtBK0JdXHRDb21wb3VuZCBpbmRleCBvciBwcmltYXJ5IGtleVxuZGIudmVyc2lvbigzKS5zdG9yZXMoe1xuICAgIHZpZGVvczogXCJ1cmwsIHRpdGxlLCBpbWFnZVVybCwgZGF0ZSwgdXBsb2FkZWRcIiwgLy8gcHJpbWFyeSBrZXkgXCJ1cmxcIiAoZm9yIHRoZSBydW50aW1lISlcbn0pO1xuZGIub3BlbigpXG4gICAgLnRoZW4oKGUpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkRhdGFiYXNlIG9wZW5lZCBzdWNjZXNzZnVsbHlcIik7XG59KVxuICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuIGZhaWxlZDogXCIgKyBlLnN0YWNrKTtcbn0pO1xuZXhwb3J0IHsgZGIgfTtcbiIsImV4cG9ydCBmdW5jdGlvbiBnZXRUb2RheVN0cmluZygpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KFwiVFwiKVswXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzbGVlcChtcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuZXhwb3J0IGNvbnN0IGJsYWNrbGlzdFdvcmRzID0gW1xuICAgIFwidGhlXCIsXG4gICAgXCJhXCIsXG4gICAgXCJhblwiLFxuICAgIFwiYW5kXCIsXG4gICAgXCJvclwiLFxuICAgIFwib2ZcIixcbiAgICBcInRvXCIsXG4gICAgXCJpblwiLFxuICAgIFwib25cIixcbiAgICBcImF0XCIsXG4gICAgXCJ3aXRoXCIsXG4gICAgXCJ3aXRob3V0XCIsXG4gICAgXCJmb3JcIixcbiAgICBcImZyb21cIixcbiAgICBcImJ5XCIsXG4gICAgXCJhYm91dFwiLFxuICAgIFwiaXNcIixcbiAgICBcImFyZVwiLFxuICAgIFwid2hhdFwiLFxuICAgIFwid2h5XCIsXG4gICAgXCJob3dcIixcbiAgICBcImlcIixcbiAgICBcIm15XCIsXG4gICAgXCJpbnRvXCIsXG4gICAgXCJtb3JlXCIsXG4gICAgJ2Rpcj1cImF1dG9cIicsXG4gICAgXCI8c3BhblwiLFxuICAgIFwiJmFtcFwiLFxuICAgIFwiJmFtcDtcIixcbiAgICAnY2xhc3M9XCJzdHlsZS1zY29wZScsXG4gICAgXCJzdHlsZS1zY29wZVwiLFxuICAgIFwidmlkZW8pXCIsXG4gICAgXCJ0aGlzXCIsXG4gICAgXCJiZVwiLFxuICAgIFwiY2FuXCIsXG4gICAgXCJ5b3VcIixcbiAgICBcIiZcIixcbiAgICBcIml0XCIsXG4gICAgXCJzb1wiLFxuXTtcbmNvbnN0IHVzZXJCbGFja2xpc3RXb3JkcyA9IFtcIihvZmZpY2lhbFwiXTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdGxvYWRlZDogZmFsc2UsXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuXHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubm1kID0gKG1vZHVsZSkgPT4ge1xuXHRtb2R1bGUucGF0aHMgPSBbXTtcblx0aWYgKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRyZXR1cm4gbW9kdWxlO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJjb250ZW50X3NjcmlwdFwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjaHJvbWVfZXh0ZW5zaW9uX3R5cGVzY3JpcHRfc3RhcnRlclwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjaHJvbWVfZXh0ZW5zaW9uX3R5cGVzY3JpcHRfc3RhcnRlclwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9yXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2NvbnRlbnRfc2NyaXB0LnRzeFwiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9