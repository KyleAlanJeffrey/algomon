"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface VideoPanelProps {
  word: string | null
  videoUrls: string[]
  videoData: Record<string, { title: string; imageUrl: string | null }>
  onClose: () => void
}

export function VideoPanel({ word, videoUrls, videoData, onClose }: VideoPanelProps) {
  return (
    <AnimatePresence>
      {word && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Videos about</p>
                <h2 className="text-2xl font-black text-white">{word}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white text-2xl leading-none"
              >
                &#x2715;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videoUrls.map(url => {
                const data = videoData[url]
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {data?.imageUrl && (
                      <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                        <Image
                          src={data.imageUrl}
                          alt={data.title ?? "Video thumbnail"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm text-white/80 line-clamp-3 font-medium leading-snug">
                      {data?.title ?? url}
                    </p>
                  </a>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
