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
          <path d="M22 64 C40 42 88 42 106 64 C88 86 40 86 22 64 Z" fill="white" />
          <circle cx="64" cy="64" r="17" fill="#CC0000" />
          <circle cx="64" cy="64" r="8" fill="#7a0000" />
          <circle cx="57" cy="57" r="5" fill="white" opacity="0.7" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
