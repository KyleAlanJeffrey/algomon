"use client"

import { useQuery } from "@tanstack/react-query"
import { WordCloud } from "@/components/word-cloud"
import { StatSlide } from "@/components/stat-slide"
import { SlideContainer } from "@/components/slide-container"
import { TopVideos } from "@/components/top-videos"
import { MostPushedSlide } from "@/components/most-pushed-slide"
import type { WordsResponse, Video } from "@/lib/types"

const MONTH_KEY = new Date().toISOString().slice(0, 7)
const MONTH_LABEL = new Date().toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()

export default function WrappedPage() {
  const { data: wordsData, isLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "month", MONTH_KEY],
    queryFn: () => fetch(`/api/words?month=${MONTH_KEY}&limit=80`).then(r => r.json()),
  })

  const { data: videosData } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: () => fetch("/api/videos").then(r => r.json()),
  })

  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  videosData?.forEach(v => { videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl } })

  const topVideos = [...(videosData ?? [])].sort((a, b) => b.timesSeen - a.timesSeen).slice(0, 10)
  const totalVideos = wordsData?.videoMetrics.totalVideos ?? 0
  const topWord = wordsData?.wordData[0]?.text ?? "—"

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/40 text-sm uppercase tracking-widest animate-pulse">Loading your wrap...</p>
      </div>
    )
  }

  return (
    <SlideContainer slides={[
      <StatSlide
        key="stats"
        gradient={{ from: "#A855F7", to: "#1a0030" }}
        label={`${MONTH_LABEL} · TOTAL VIDEOS`}
        stat={totalVideos.toLocaleString()}
        subtext="videos recommended to you"
      />,
      <StatSlide
        key="topword"
        gradient={{ from: "#EC4899", to: "#4C0033" }}
        label="YOUR MOST RECOMMENDED WORD"
        stat={topWord.toUpperCase()}
        subtext={`appeared ${wordsData?.wordData[0]?.timesSeen ?? 0} times in video titles`}
      />,
      <MostPushedSlide
        key="mostpushed"
        video={topVideos[0]}
        gradient={{ from: "#7C3AED", to: "#0a0a0a" }}
      />,
      <StatSlide
        key="topvideos"
        scrollable
        gradient={{ from: "#1a1a2e", to: "#0a0a0a" }}
        label="MOST RECOMMENDED VIDEOS"
      >
        <TopVideos videos={topVideos} />
      </StatSlide>,
      <StatSlide
        key="cloud"
        gradient={{ from: "#0f0020", to: "#0a0a0a" }}
        label={`${MONTH_LABEL} · YOUR WORD CLOUD`}
      >
        <div className="mt-8 w-full flex justify-center">
          {wordsData && <WordCloud words={wordsData.wordData} videoData={videoDataMap} />}
        </div>
        <p className="mt-4 text-white/40 text-sm">Click a word to see videos</p>
      </StatSlide>,
    ]} />
  )
}
