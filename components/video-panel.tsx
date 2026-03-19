"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface VideoPanelProps {
  word: string | null
  videoUrls: string[]
  videoData: Record<string, { title: string; imageUrl: string | null }>
  onClose: () => void
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    // Standard watch URL: youtube.com/watch?v=ID
    const v = u.searchParams.get("v")
    if (v) return v
    // Shorts: youtube.com/shorts/ID
    const parts = u.pathname.split("/")
    const shortsIdx = parts.indexOf("shorts")
    if (shortsIdx !== -1 && parts[shortsIdx + 1]) return parts[shortsIdx + 1]
  } catch {}
  return null
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
                const videoId = getYouTubeId(url)
                const thumbnailUrl = videoId
                  ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                  : null

                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {thumbnailUrl && (
                      <div className="relative w-32 h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                        <Image
                          src={thumbnailUrl}
                          alt={data?.title ?? "Video thumbnail"}
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
