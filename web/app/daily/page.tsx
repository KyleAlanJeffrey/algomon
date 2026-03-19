"use client"

import { useQuery } from "@tanstack/react-query"
import { StatSlide } from "@/components/stat-slide"
import { WordCloud } from "@/components/word-cloud"
import { SlideContainer } from "@/components/slide-container"
import { TopVideos } from "@/components/top-videos"
import { MostPushedSlide } from "@/components/most-pushed-slide"
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
        bg="linear-gradient(135deg, #0c2340 0%, #0a0a0a 100%)"
        accent="#60A5FA"
        decoration="rings-tr"
        label={`${TODAY_LABEL} · YOU SAW`}
        stat={totalToday.toLocaleString()}
        subtext="videos recommended to you today."
      />,
      <StatSlide
        key="topword"
        bg="#eef6ee"
        light
        accent="#16A34A"
        decoration="squiggle-br"
        label="TODAY'S TOP WORD"
        stat={topWord.toUpperCase()}
        subtext={`Appeared ${wordsData?.wordData[0]?.timesSeen ?? 0} times in today's video titles.`}
      />,
      <MostPushedSlide
        key="mostpushed"
        video={topVideos[0]}
        bg="linear-gradient(135deg, #1a0a2e 0%, #0a0a0a 100%)"
      />,
      <StatSlide
        key="topvideos"
        bg="linear-gradient(135deg, #111827 0%, #0a0a0a 100%)"
        decoration="rings-bl"
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
        bg="#f5f0e8"
        light
        decoration="squiggle-tl"
        label="TODAY'S WORD CLOUD"
      >
        <div className="mt-8 w-full flex justify-center">
          {wordsData?.wordData.length ? (
            <WordCloud words={wordsData.wordData} videoData={videoDataMap} light />
          ) : (
            <p className="text-black/40">No data yet. Browse YouTube with the extension!</p>
          )}
        </div>
      </StatSlide>,
    ]} />
  )
}
