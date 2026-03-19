"use client"

import { useQuery } from "@tanstack/react-query"
import { StatSlide } from "@/components/stat-slide"
import { WordCloud } from "@/components/word-cloud"
import { SlideContainer } from "@/components/slide-container"
import { TopVideos } from "@/components/top-videos"
import { MostPushedSlide } from "@/components/most-pushed-slide"
import { useUser } from "@/components/user-context"
import type { WordsResponse, Video } from "@/lib/types"

export default function AllPage() {
  const { username } = useUser()

  const { data: wordsData, isLoading: wordsLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "all", username],
    queryFn: () => fetch(`/api/users/${username}/words?limit=100`).then(r => r.json()),
    enabled: !!username,
  })

  const { data: videosData, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["videos", username],
    queryFn: () => fetch(`/api/users/${username}/videos`).then(r => r.json()),
    enabled: !!username,
  })

  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  videosData?.forEach(v => { videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl } })

  const topVideos = [...(videosData ?? [])].sort((a, b) => b.timesSeen - a.timesSeen).slice(0, 10)
  const totalVideos = videosData?.length ?? 0
  const topWord = wordsData?.wordData[0]?.text ?? "—"

  if (!username || wordsLoading || videosLoading) {
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
      <MostPushedSlide
        key="mostpushed"
        video={topVideos[0]}
        gradient={{ from: "#B45309", to: "#0a0a0a" }}
      />,
      <StatSlide
        key="topvideos"
        gradient={{ from: "#1a1a2e", to: "#0a0a0a" }}
        label="MOST RECOMMENDED VIDEOS"
      >
        <div className="mt-2 w-full max-h-[65vh] overflow-y-auto">
          <TopVideos videos={topVideos} />
        </div>
      </StatSlide>,
      <StatSlide
        key="cloud"
        gradient={{ from: "#0a0a0a", to: "#0a0a0a" }}
        label="ALL-TIME WORD CLOUD"
      >
        <div className="mt-8 w-full flex justify-center">
          {wordsData && <WordCloud words={wordsData.wordData} videoData={videoDataMap} />}
        </div>
        <p className="mt-4 text-white/40 text-sm">Click a word to see videos</p>
      </StatSlide>,
    ]} />
  )
}
