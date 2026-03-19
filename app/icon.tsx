import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0a0a0a",
          borderRadius: 8,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 3,
          padding: "5px 5px 5px 5px",
        }}
      >
        <div style={{ width: 5, height: 8, background: "#4ade80", borderRadius: 2 }} />
        <div style={{ width: 5, height: 14, background: "#4ade80", borderRadius: 2 }} />
        <div style={{ width: 5, height: 10, background: "#4ade80", borderRadius: 2 }} />
        <div style={{ width: 5, height: 18, background: "#4ade80", borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  )
}
