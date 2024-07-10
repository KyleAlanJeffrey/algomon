# Algomonn: The Youtube Algorithm Monitor

based on boilerplate: [Chrome Extension TypeScript Starter](https://github.com/chibat/chrome-extension-typescript-starter)

## Page Querying
Primarily use:
- document.querySelectorAll("ytd-compact-video-renderer")
- document.querySelectorAll("ytd-rich-item-renderer")

## TODO
- For bubble word cloud, add hover to view what videos the words were used in
- Possibly figure out a way to grab tags?

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

## Import as Visual Studio Code project

...

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Test
`npx jest` or `npm run test`
