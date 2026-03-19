"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

const MONTH = new Date().toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()

export default function Home() {
  const [wiping, setWiping] = useState(false)
  const [wiped, setWiped] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleWipe() {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setWiping(true)
    try {
      await fetch("/api/wipe", { method: "POST" })
      setWiped(true)
    } finally {
      setWiping(false)
      setConfirm(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1DB954 0%, #191414 60%, #0a0a0a 100%)" }}
    >
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#1DB954]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50 mb-6"
        >
          {MONTH}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
          className="font-black text-white leading-none tracking-tighter mb-6"
          style={{ fontSize: "clamp(3rem, 12vw, 7rem)" }}
        >
          YOUR ALGO&shy;RITHM,{" "}
          <span className="text-[#1DB954]">EXPOSED.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-white/60 text-lg mb-12"
        >
          See exactly what YouTube has been feeding you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/wrapped"
            className="px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:scale-105 transition-transform"
          >
            THIS MONTH&apos;S WRAP
          </Link>
          <Link
            href="/daily"
            className="px-8 py-4 border border-white/30 text-white font-bold text-sm tracking-wide rounded-full hover:bg-white/10 transition-colors"
          >
            TODAY
          </Link>
          <Link
            href="/all"
            className="px-8 py-4 border border-white/30 text-white font-bold text-sm tracking-wide rounded-full hover:bg-white/10 transition-colors"
          >
            ALL TIME
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <button
          onClick={handleWipe}
          disabled={wiping}
          className={`text-xs font-semibold tracking-widest uppercase transition-colors ${
            wiped
              ? "text-[#1DB954]"
              : confirm
              ? "text-red-400 hover:text-red-300"
              : "text-white/20 hover:text-white/50"
          }`}
        >
          {wiped ? "✓ Data wiped" : wiping ? "Wiping..." : confirm ? "Click again to confirm" : "Wipe all data"}
        </button>
      </motion.div>
    </main>
  )
}
