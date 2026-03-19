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
        bg="linear-gradient(135deg, #2d0057 0%, #0a0a0a 100%)"
        accent="#C084FC"
        decoration="rings-tr"
        label={`${MONTH_LABEL} · VIDEOS SEEN`}
        stat={totalVideos.toLocaleString()}
        subtext="unique videos YouTube served you this month."
      />,
      <StatSlide
        key="topword"
        bg="#f0ebe3"
        light
        accent="#7C3AED"
        decoration="squiggle-br"
        label="YOUR MOST SERVED WORD"
        stat={topWord.toUpperCase()}
        subtext={`Appeared ${wordsData?.wordData[0]?.timesSeen ?? 0} times in video titles and tags.`}
      />,
      <MostPushedSlide
        key="mostpushed"
        video={topVideos[0]}
        bg="linear-gradient(135deg, #1e1b4b 0%, #0a0a0a 100%)"
      />,
      <StatSlide
        key="topvideos"
        bg="linear-gradient(135deg, #111827 0%, #0a0a0a 100%)"
        decoration="rings-bl"
        label="MOST RECOMMENDED VIDEOS"
      >
        <TopVideos videos={topVideos} />
      </StatSlide>,
      <StatSlide
        key="cloud"
        bg="#f5f0e8"
        light
        decoration="squiggle-tl"
        label={`${MONTH_LABEL} · YOUR WORD CLOUD`}
      >
        <div className="mt-8 w-full flex justify-center">
          {wordsData && <WordCloud words={wordsData.wordData} videoData={videoDataMap} light />}
        </div>
        <p className="mt-4 text-black/40 text-sm">Click a word to see videos</p>
      </StatSlide>,
    ]} />
  )
}
