"use client"

import { useQuery } from "@tanstack/react-query"
import { StatSlide } from "@/components/stat-slide"
import { WordCloud } from "@/components/word-cloud"
import { DotNav } from "@/components/dot-nav"
import { useState } from "react"
import Image from "next/image"
import type { WordsResponse, Video } from "@/lib/types"

export default function AllPage() {
  const [slide, setSlide] = useState(0)

  const { data: wordsData, isLoading: wordsLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "all"],
    queryFn: () => fetch("/api/words?limit=100").then(r => r.json()),
  })

  const { data: videosData, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: () => fetch("/api/videos").then(r => r.json()),
  })

  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  videosData?.forEach(v => {
    videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl }
  })

  const topVideos = [...(videosData ?? [])].sort((a, b) => b.timesSeen - a.timesSeen).slice(0, 10)
  const totalVideos = videosData?.length ?? 0
  const topWord = wordsData?.wordData[0]?.text ?? "—"

  if (wordsLoading || videosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/40 text-sm uppercase tracking-widest animate-pulse">Loading all time stats...</p>
      </div>
    )
  }

  const slides = [
    <StatSlide
      key="total"
      gradient={{ from: "#EAB308", to: "#1a1000" }}
      label="ALL TIME · TOTAL VIDEOS SEEN"
      stat={totalVideos.toLocaleString()}
      subtext="unique videos recommended to you"
    />,
    <StatSlide
      key="topword"
      gradient={{ from: "#F97316", to: "#1a0500" }}
      label="ALL-TIME TOP WORD"
      stat={topWord.toUpperCase()}
      subtext={`appeared ${wordsData?.wordData[0]?.timesSeen ?? 0} times across all videos`}
    />,
    // Top 10 most recommended videos
    <StatSlide
      key="topvideos"
      gradient={{ from: "#1a1a2e", to: "#0a0a0a" }}
      label="MOST RECOMMENDED VIDEOS"
    >
      <div className="mt-6 w-full max-w-2xl mx-auto space-y-2">
        {topVideos.map((v, i) => (
          <a
            key={v.url}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-white/30 font-mono text-sm w-6 text-right flex-shrink-0">{i + 1}</span>
            {v.imageUrl && (
              <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                <Image src={v.imageUrl} alt={v.title} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm text-white/80 font-medium line-clamp-2">{v.title}</p>
              <p className="text-xs text-white/40 mt-0.5">seen {v.timesSeen}&times;</p>
            </div>
          </a>
        ))}
      </div>
    </StatSlide>,
    // All-time word cloud
    <StatSlide
      key="cloud"
      gradient={{ from: "#0a0a0a", to: "#0a0a0a" }}
      label="ALL-TIME WORD CLOUD"
    >
      <div className="mt-8 w-full flex justify-center">
        {wordsData && (
          <WordCloud
            words={wordsData.wordData}
            videoData={videoDataMap}
            width={Math.min(typeof window !== "undefined" ? window.innerWidth - 64 : 800, 900)}
            height={480}
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
