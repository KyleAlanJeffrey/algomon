# Algomon: The Youtube Algorithm Monitor
LIVE ENDOINT: http://algomon.kyle-jeffrey.com/

based on boilerplate: [Chrome Extension TypeScript Starter](https://github.com/chibat/chrome-extension-typescript-starter)

## Page Querying
Primarily use:
- document.querySelectorAll("ytd-compact-video-renderer")
- document.querySelectorAll("ytd-rich-item-renderer")

## TODO
- For bubble word cloud, add hover to view what videos the words were used in. Have a poupup around the word with the thumbnails and titles of the videos.
- Might want to swap wordcloud components or just write my own
- Possibly figure out a way to grab tags?
- Add some way of tracking what a user is. It'd be kinda annoying to write a whole auth system but is probably the correct thing to do. Maybe could just use ip address as an identifier until then.


## Issues
- The indexedDb is only accessible from content_scripts and not the extension popup. This means the data is only accessible when on youtube.

## Project Structure
### *extension*: Chrome Extension directory
* src/typescript: TypeScript source files
* src/assets: static files
* dist: Chrome Extension directory
* dist/js: Generated JavaScript files

```
npm install
```
```
npm run build
```
```
npm run watch
```

### *frontend*: Next App Frontend
```
npm install
```
```
npm run dev
```
```
npm run start
```
```
npm run build
```

### *server*: Nest api server

The nest start:prod is very cpu intensive and dies on my baby ec2 instance, so run build and the run `node dist/main,js` instead.

```
npm install
```
```
npm run start:dev
```
```
npm run start:prod
```
```
npm run build
```

## Load Extension in Chrome
Basic Guide here: https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world

The `dist` directory after eithering building or watching will be the directory to load into chrome.