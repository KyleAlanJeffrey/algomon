"use client"

import { motion } from "framer-motion"

interface StatSlideProps {
  gradient: { from: string; to: string }
  label?: string
  stat?: string | number
  subtext?: string
  scrollable?: boolean
  children?: React.ReactNode
  className?: string
}

export function StatSlide({ gradient, label, stat, subtext, scrollable = false, children, className }: StatSlideProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative min-h-screen flex flex-col items-center px-8 py-20 ${scrollable ? "justify-start" : "justify-center overflow-hidden"} ${className ?? ""}`}
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* Noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center max-w-4xl w-full">
        {label && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-4"
          >
            {label}
          </motion.p>
        )}

        {stat !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="font-black text-white leading-none tracking-tighter mb-6"
            style={{ fontSize: "clamp(4rem, 15vw, 9rem)" }}
          >
            {stat}
          </motion.div>
        )}

        {subtext && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg text-white/70 font-medium"
          >
            {subtext}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
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
