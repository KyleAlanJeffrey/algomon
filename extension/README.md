# Algomonn: The Youtube Algorithm Monitor

based on boilerplate: [Chrome Extension TypeScript Starter](https://github.com/chibat/chrome-extension-typescript-starter)

## Page Querying
Primarily use:
- document.querySelectorAll("ytd-compact-video-renderer")
- document.querySelectorAll("ytd-rich-item-renderer")

## TODO
- For bubble word cloud, add hover to view what videos the words were used in. Have a poupup around the word with the thumbnails and titles of the videos.
- Might want to swap wordcloud components or just write my own
- Possibly figure out a way to grab tags?
- Maybe offload db to an online one to allow for passive data capturing while browsing youtube and a more robust backend for analysis.

## Issues
- The indexedDb is only accessible from content_scripts and not the extension popup. This means the data is only accessible when on youtube. Possibly want to consider moving all the data into an offline database but this would also require an api to post data to a database. 
## Project Structure

* src/typescript: TypeScript source files
* src/assets: static files
* dist: Chrome Extension directory
* dist/js: Generated JavaScript files

## Setup

```
npm install
```
```
npm run build
```
```
npm run watch
```

## Load Extension in Chrome
Basic Guide here: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world

The `dist` directory after eithering building or watching will be the directory to load into chrome.