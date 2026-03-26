import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Algomon — YouTube Algorithm Monitor"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)",
          position: "relative",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "15%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(29,185,84,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Eye icon */}
        <div
          style={{
            display: "flex",
            marginBottom: 32,
          }}
        >
          <svg width="88" height="56" viewBox="10 30 108 68" fill="none">
            <rect x="10" y="30" width="108" height="68" rx="16" fill="#FF0000" />
            <path d="M26 64 C38 30 90 30 102 64 C90 98 38 98 26 64 Z" fill="white" />
            <circle cx="64" cy="64" r="19" fill="#1a0000" />
            <circle cx="55" cy="53" r="7" fill="white" opacity="0.75" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Your Algorithm,
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              background: "linear-gradient(90deg, #a78bfa, #34d399)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Exposed.
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            marginTop: 32,
            letterSpacing: "0.02em",
          }}
        >
          Track and visualize your YouTube recommendations
        </div>

        {/* URL badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 18,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em",
          }}
        >
          algomon.app
        </div>
      </div>
    ),
    { ...size }
  )
}
