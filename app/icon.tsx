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
          background: "#111",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
          {/* Eye white */}
          <path d="M1 13C6 4 30 4 35 13C30 22 6 22 1 13Z" fill="white" />
          {/* Iris */}
          <circle cx="18" cy="13" r="6.5" fill="#4ade80" />
          {/* Pupil */}
          <circle cx="18" cy="13" r="3" fill="#0a0a0a" />
          {/* Highlight */}
          <circle cx="15.5" cy="10.5" r="1.8" fill="white" opacity="0.75" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
