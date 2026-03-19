"use client"

import { useQuery } from "@tanstack/react-query"
import { StatSlide } from "@/components/stat-slide"
import { WordCloud } from "@/components/word-cloud"
import { SlideContainer } from "@/components/slide-container"
import { TopVideos } from "@/components/top-videos"
import { MostPushedSlide } from "@/components/most-pushed-slide"
import type { WordsResponse, Video } from "@/lib/types"

export default function AllPage() {
  const { data: wordsData, isLoading: wordsLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "all"],
    queryFn: () => fetch("/api/words?limit=100").then(r => r.json()),
  })

  const { data: videosData, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: () => fetch("/api/videos").then(r => r.json()),
  })

  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  videosData?.forEach(v => { videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl } })

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

  return (
    <SlideContainer slides={[
      <StatSlide
        key="total"
        bg="linear-gradient(135deg, #1a1000 0%, #0a0a0a 100%)"
        accent="#FBBF24"
        decoration="rings-tr"
        label="ALL TIME · TOTAL VIDEOS SEEN"
        stat={totalVideos.toLocaleString()}
        subtext="unique videos the algorithm has served you."
      />,
      <StatSlide
        key="topword"
        bg="#fdf6e3"
        light
        accent="#D97706"
        decoration="squiggle-br"
        label="ALL-TIME TOP WORD"
        stat={topWord.toUpperCase()}
        subtext={`Appeared ${wordsData?.wordData[0]?.timesSeen ?? 0} times across all your video titles.`}
      />,
      <MostPushedSlide
        key="mostpushed"
        video={topVideos[0]}
        bg="linear-gradient(135deg, #1c1000 0%, #0a0a0a 100%)"
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
        label="ALL-TIME WORD CLOUD"
      >
        <div className="mt-8 w-full flex justify-center">
          {wordsData && <WordCloud words={wordsData.wordData} videoData={videoDataMap} light />}
        </div>
        <p className="mt-4 text-black/40 text-sm">Click a word to see videos</p>
      </StatSlide>,
    ]} />
  )
}
