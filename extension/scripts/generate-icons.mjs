import { Resvg } from "@resvg/resvg-js"
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <!-- Soft dark navy background -->
  <rect width="128" height="128" rx="28" fill="#1a1f2e"/>

  <!-- Bar chart — three rising bars, rounded tops -->
  <rect x="22" y="72" width="22" height="36" rx="6" fill="#e8705a" opacity="0.7"/>
  <rect x="53" y="50" width="22" height="58" rx="6" fill="#e8705a" opacity="0.85"/>
  <rect x="84" y="30" width="22" height="78" rx="6" fill="#e8705a"/>

  <!-- Small play triangle in top-left, subtle -->
  <path d="M18 18 L38 28 L18 38 Z" fill="white" opacity="0.25"/>
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
