"use client"

import { motion } from "framer-motion"

type Decoration = "rings-bl" | "rings-tr" | "squiggle-br" | "squiggle-tl" | "none"

interface StatSlideProps {
  bg?: string                      // solid bg color or gradient string
  light?: boolean                  // light mode (dark text)
  accent?: string                  // stat number color
  label?: string
  stat?: string | number
  subtext?: string
  decoration?: Decoration
  children?: React.ReactNode
  className?: string
}

function DecorationSVG({ type, light }: { type: Decoration; light?: boolean }) {
  const color = light ? "#00000018" : "#ffffff14"
  const colorStrong = light ? "#00000030" : "#ffffff22"

  if (type === "rings-bl") return (
    <svg className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none" viewBox="0 0 256 256" fill="none">
      <circle cx="0" cy="256" r="70"  stroke={colorStrong} strokeWidth="12"/>
      <circle cx="0" cy="256" r="110" stroke={color} strokeWidth="12"/>
      <circle cx="0" cy="256" r="150" stroke={color} strokeWidth="12"/>
      <circle cx="0" cy="256" r="190" stroke={color} strokeWidth="12"/>
      <circle cx="0" cy="256" r="230" stroke={color} strokeWidth="12"/>
    </svg>
  )

  if (type === "rings-tr") return (
    <svg className="absolute top-0 right-0 w-64 h-64 pointer-events-none" viewBox="0 0 256 256" fill="none">
      <circle cx="256" cy="0" r="70"  stroke={colorStrong} strokeWidth="12"/>
      <circle cx="256" cy="0" r="110" stroke={color} strokeWidth="12"/>
      <circle cx="256" cy="0" r="150" stroke={color} strokeWidth="12"/>
      <circle cx="256" cy="0" r="190" stroke={color} strokeWidth="12"/>
      <circle cx="256" cy="0" r="230" stroke={color} strokeWidth="12"/>
    </svg>
  )

  if (type === "squiggle-br") return (
    <svg className="absolute bottom-0 right-0 w-72 h-52 pointer-events-none" viewBox="0 0 288 208" fill="none">
      <path d="M288 208 Q240 160 200 180 Q160 200 120 160 Q80 120 40 140 Q0 160 0 120" stroke={color} strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M288 240 Q240 192 200 212 Q160 232 120 192 Q80 152 40 172 Q0 192 0 152" stroke={color} strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M288 176 Q240 128 200 148 Q160 168 120 128 Q80 88 40 108 Q0 128 0 88" stroke={colorStrong} strokeWidth="10" strokeLinecap="round" fill="none"/>
    </svg>
  )

  if (type === "squiggle-tl") return (
    <svg className="absolute top-0 left-0 w-72 h-52 pointer-events-none" viewBox="0 0 288 208" fill="none">
      <path d="M0 0 Q48 48 88 28 Q128 8 168 48 Q208 88 248 68 Q288 48 288 88" stroke={color} strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M0 32 Q48 80 88 60 Q128 40 168 80 Q208 120 248 100 Q288 80 288 120" stroke={colorStrong} strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M0 64 Q48 112 88 92 Q128 72 168 112 Q208 152 248 132 Q288 112 288 152" stroke={color} strokeWidth="10" strokeLinecap="round" fill="none"/>
    </svg>
  )

  return null
}

export function StatSlide({
  bg = "linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)",
  light = false,
  accent,
  label,
  stat,
  subtext,
  decoration = "none",
  children,
  className,
}: StatSlideProps) {
  const textColor = light ? "text-black/80" : "text-white/60"
  const statColor = accent ?? (light ? "#000000" : "#ffffff")

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative min-h-screen flex flex-col items-center justify-center px-8 py-16 overflow-hidden ${className ?? ""}`}
      style={{ background: bg }}
    >
      <DecorationSVG type={decoration} light={light} />

      <div className="relative z-10 text-center max-w-4xl w-full">
        {label && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-xs font-bold uppercase tracking-[0.25em] mb-5 ${textColor}`}
          >
            {label}
          </motion.p>
        )}

        {stat !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 120, damping: 14 }}
            className="font-black leading-none tracking-tighter mb-6"
            style={{ fontSize: "clamp(4.5rem, 17vw, 10rem)", color: statColor }}
          >
            {stat}
          </motion.div>
        )}

        {subtext && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className={`text-lg font-medium leading-relaxed max-w-sm mx-auto ${light ? "text-black/60" : "text-white/60"}`}
          >
            {subtext}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
