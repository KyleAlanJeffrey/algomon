"use client"

import { useQuery } from "@tanstack/react-query"
import { WordCloud } from "@/components/word-cloud"
import { StatSlide } from "@/components/stat-slide"
import { DotNav } from "@/components/dot-nav"
import { useState } from "react"
import type { WordsResponse, Video } from "@/lib/types"

const MONTH_KEY = new Date().toISOString().slice(0, 7) // YYYY-MM
const MONTH_LABEL = new Date().toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()

export default function WrappedPage() {
  const [slide, setSlide] = useState(0)

  const { data: wordsData, isLoading: wordsLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "month", MONTH_KEY],
    queryFn: () => fetch(`/api/words?month=${MONTH_KEY}&limit=80`).then(r => r.json()),
  })

  const { data: videosData } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: () => fetch("/api/videos").then(r => r.json()),
  })

  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  videosData?.forEach(v => {
    videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl }
  })

  const totalVideos = wordsData?.videoMetrics.totalVideos ?? 0
  const totalWords = wordsData?.wordData.length ?? 0
  const topWord = wordsData?.wordData[0]?.text ?? "—"

  if (wordsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/40 text-sm uppercase tracking-widest animate-pulse">Loading your wrap...</p>
      </div>
    )
  }

  const slides = [
    // Slide 0: Stats overview
    <StatSlide
      key="stats"
      gradient={{ from: "#A855F7", to: "#1a0030" }}
      label={`${MONTH_LABEL} · TOTAL VIDEOS`}
      stat={totalVideos.toLocaleString()}
      subtext="videos recommended to you"
    />,
    // Slide 1: Top word
    <StatSlide
      key="topword"
      gradient={{ from: "#EC4899", to: "#4C0033" }}
      label="YOUR MOST RECOMMENDED WORD"
      stat={topWord.toUpperCase()}
      subtext={`appeared ${wordsData?.wordData[0]?.timesSeen ?? 0} times in video titles`}
    />,
    // Slide 2: Unique words
    <StatSlide
      key="uniquewords"
      gradient={{ from: "#F97316", to: "#1a0a00" }}
      label="UNIQUE WORDS IN YOUR FEED"
      stat={totalWords.toLocaleString()}
      subtext="distinct topics the algorithm served you"
    />,
    // Slide 3: Word cloud
    <StatSlide
      key="cloud"
      gradient={{ from: "#0f0020", to: "#0a0a0a" }}
      label={`${MONTH_LABEL} · YOUR WORD CLOUD`}
    >
      <div className="mt-8 w-full flex justify-center">
        {wordsData && (
          <WordCloud
            words={wordsData.wordData}
            videoData={videoDataMap}
            width={Math.min(typeof window !== "undefined" ? window.innerWidth - 64 : 800, 900)}
            height={500}
          />
        )}
      </div>
      <p className="mt-4 text-white/40 text-sm">Click a word to see videos</p>
    </StatSlide>,
  ]

  return (
    <div className="relative">
      {slides[slide]}
      <DotNav total={slides.length} current={slide} onChange={setSlide} />
    </div>
  )
}
