import { ImageResponse } from "next/og"

export const size = { width: 48, height: 48 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Same SVG source as extension/scripts/generate-icons.mjs, no background */}
        <svg width="44" height="28" viewBox="10 30 108 68" fill="none">
          <rect x="10" y="30" width="108" height="68" rx="16" fill="#FF0000" />
          <path d="M26 64 C38 30 90 30 102 64 C90 98 38 98 26 64 Z" fill="white" />
          <circle cx="64" cy="64" r="19" fill="#1a0000" />
          <circle cx="55" cy="53" r="7" fill="white" opacity="0.75" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
