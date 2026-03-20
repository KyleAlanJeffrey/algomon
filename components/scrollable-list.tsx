"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

interface ScrollableListProps {
  children: React.ReactNode
  buttonLabel?: string
}

export function ScrollableList({ children, buttonLabel = "View all" }: ScrollableListProps) {
  const [expanded, setExpanded] = useState(false)

  const overlay = (
    <AnimatePresence>
      {expanded && (
        <>
          {/* Blurred backdrop — fixed to viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-xl bg-black/30"
            onClick={() => setExpanded(false)}
          />

          {/* Panel — fixed size, always centered in viewport */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed z-50 inset-0 m-auto w-[calc(100%-2rem)] max-w-2xl h-[70vh] flex flex-col rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">{buttonLabel}</span>
              <button
                onClick={() => setExpanded(false)}
                className="px-3 py-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/50 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto p-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {!expanded && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setExpanded(true)}
          className="mt-4 px-6 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-medium text-white/60 hover:text-white transition-colors"
        >
          {buttonLabel}
        </motion.button>
      )}

      {typeof document !== "undefined" ? createPortal(overlay, document.body) : overlay}
    </>
  )
}
