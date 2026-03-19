import { Resvg } from "@resvg/resvg-js"
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <!-- Dark background with rounded corners -->
  <rect width="128" height="128" rx="28" fill="#0f0f0f"/>

  <!-- Eye outline -->
  <path
    d="M64 36 C36 36 14 64 14 64 C14 64 36 92 64 92 C92 92 114 64 114 64 C114 64 92 36 64 36 Z"
    fill="none"
    stroke="#FF0000"
    stroke-width="7"
    stroke-linejoin="round"
    stroke-linecap="round"
  />

  <!-- Iris -->
  <circle cx="64" cy="64" r="19" fill="#FF0000"/>

  <!-- Bar chart inside iris (algorithm data) -->
  <rect x="51" y="64" width="6" height="10" rx="1.5" fill="#ffffff"/>
  <rect x="61" y="58" width="6" height="16" rx="1.5" fill="#ffffff"/>
  <rect x="71" y="54" width="6" height="20" rx="1.5" fill="#ffffff"/>

  <!-- Pupil dot -->
  <circle cx="64" cy="64" r="4" fill="#0f0f0f" opacity="0"/>
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
