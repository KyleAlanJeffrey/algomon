"use client"

import { useQuery } from "@tanstack/react-query"
import { WordCloud } from "@/components/word-cloud"
import { StatSlide } from "@/components/stat-slide"
import { SlideContainer } from "@/components/slide-container"
import { MostPushedSlide } from "@/components/most-pushed-slide"
import { MostWatchedSlide } from "@/components/most-watched-slide"
import { TopChannelsSlide } from "@/components/top-channels-slide"
import { useUser } from "@/components/user-context"
import { apiRoutes } from "@/lib/api-routes"
import type { WordsResponse, Video } from "@/lib/types"

const MONTH_KEY = new Date().toISOString().slice(0, 7)
const MONTH_LABEL = new Date().toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()

export default function WrappedPage() {
  const { username } = useUser()

  const { data: wordsData, isLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "month", MONTH_KEY, username],
    queryFn: () => fetch(`/api/users/${username}/words?month=${MONTH_KEY}&limit=80`).then(r => r.json()),
    enabled: !!username,
  })

  const { data: videosData } = useQuery<Video[]>({
    queryKey: ["videos", "month", MONTH_KEY, username],
    queryFn: () => fetch(apiRoutes.userVideos(username!, { month: MONTH_KEY })).then(r => r.json()),
    enabled: !!username,
    select: (data) => (Array.isArray(data) ? data : []),
  })

  const { data: channelsData } = useQuery<any[]>({
    queryKey: ["channels", "month", MONTH_KEY, username],
    queryFn: () => fetch(apiRoutes.userStatsChannels(username!, { month: MONTH_KEY })).then(r => r.json()),
    enabled: !!username,
    select: (d) => (Array.isArray(d) ? d : []),
  })

  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  videosData?.forEach(v => { videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl } })

  const topVideos = [...(videosData ?? [])].sort((a, b) => b.timesSeen - a.timesSeen).slice(0, 10)
  const totalVideos = wordsData?.videoMetrics.totalVideos ?? 0
  const topWord = wordsData?.wordData[0]?.text ?? "—"

  if (!username || isLoading) {
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
        videos={topVideos}
        gradient={{ from: "#7C3AED", to: "#0a0a0a" }}
      />,
      <MostWatchedSlide
        key="watched"
        videos={videosData ?? []}
        gradient={{ from: "#065F46", to: "#0a0a0a" }}
      />,
      <TopChannelsSlide
        key="channels"
        channels={channelsData ?? []}
        gradient={{ from: "#B45309", to: "#0a0a0a" }}
      />,
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
