"use client"

import { useQuery } from "@tanstack/react-query"
import { StatSlide } from "@/components/stat-slide"
import { WordCloud } from "@/components/word-cloud"
import { SlideContainer } from "@/components/slide-container"
import { TopVideos } from "@/components/top-videos"
import type { WordsResponse, Video } from "@/lib/types"

const TODAY = new Date().toISOString().split("T")[0]!
const TODAY_LABEL = new Date().toLocaleDateString("default", {
  weekday: "long", month: "long", day: "numeric"
}).toUpperCase()

export default function DailyPage() {
  const { data: wordsData, isLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "daily", TODAY],
    queryFn: () => fetch(`/api/words?date=${TODAY}&limit=60`).then(r => r.json()),
  })

  const { data: videosData } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: () => fetch("/api/videos").then(r => r.json()),
  })

  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  videosData?.forEach(v => { videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl } })

  const topVideos = [...(videosData ?? [])].sort((a, b) => b.timesSeen - a.timesSeen).slice(0, 10)
  const totalToday = wordsData?.videoMetrics.totalVideos ?? 0
  const topWord = wordsData?.wordData[0]?.text ?? "—"

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/40 text-sm uppercase tracking-widest animate-pulse">Loading today...</p>
      </div>
    )
  }

  return (
    <SlideContainer slides={[
      <StatSlide
        key="count"
        gradient={{ from: "#3B82F6", to: "#0a001a" }}
        label={`${TODAY_LABEL} · YOU SAW`}
        stat={totalToday.toLocaleString()}
        subtext="videos recommended to you today"
      />,
      <StatSlide
        key="topword"
        gradient={{ from: "#10B981", to: "#001a0d" }}
        label="TODAY'S TOP WORD"
        stat={topWord.toUpperCase()}
        subtext={`appeared ${wordsData?.wordData[0]?.timesSeen ?? 0} times today`}
      />,
      <StatSlide
        key="topvideos"
        gradient={{ from: "#1a1a2e", to: "#0a0a0a" }}
        label="MOST RECOMMENDED VIDEOS"
      >
        {topVideos.length ? (
          <TopVideos videos={topVideos} />
        ) : (
          <p className="mt-8 text-white/40">No data yet. Browse YouTube with the extension!</p>
        )}
      </StatSlide>,
      <StatSlide
        key="cloud"
        gradient={{ from: "#0a0a0a", to: "#0a0a0a" }}
        label="TODAY'S WORD CLOUD"
      >
        <div className="mt-8 w-full flex justify-center">
          {wordsData?.wordData.length ? (
            <WordCloud words={wordsData.wordData} videoData={videoDataMap} />
          ) : (
            <p className="text-white/40">No data yet. Browse YouTube with the extension!</p>
          )}
        </div>
      </StatSlide>,
    ]} />
  )
}
