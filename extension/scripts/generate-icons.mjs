import { Resvg } from "@resvg/resvg-js"
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Same design as the website favicon (app/icon.tsx):
// YouTube-style red rounded rect with an eye replacing the play button.
// Extension icons add a dark background since they show in Chrome's toolbar.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#1a1f2e"/>
  <rect x="10" y="30" width="108" height="68" rx="16" fill="#FF0000"/>
  <path d="M22 64 C40 36 88 36 106 64 C88 92 40 92 22 64 Z" fill="white"/>
  <circle cx="64" cy="64" r="12" fill="#1a0000"/>
  <circle cx="58" cy="58" r="4" fill="white" opacity="0.6"/>
</svg>
`

const sizes = [16, 32, 48, 128]

for (const size of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
  })
  const png = resvg.render().asPng()
  const filename = size === 128 ? "icon.png" : `icon${size}.png`
  const outPath = join(__dirname, "../public", filename)
  writeFileSync(outPath, png)
  console.log(`✓ ${filename} (${size}x${size})`)
}
