"use client"

import { useQuery } from "@tanstack/react-query"
import { StatSlide } from "@/components/stat-slide"
import { WordCloud } from "@/components/word-cloud"
import { SlideContainer } from "@/components/slide-container"
import { MostPushedSlide } from "@/components/most-pushed-slide"
import { MostWatchedSlide } from "@/components/most-watched-slide"
import { TopChannelsSlide } from "@/components/top-channels-slide"
import { useUser } from "@/components/user-context"
import { apiRoutes } from "@/lib/api-routes"
import type { WordsResponse, Video } from "@/lib/types"

export default function AllPage() {
  const { username } = useUser()

  const { data: wordsData, isLoading: wordsLoading } = useQuery<WordsResponse>({
    queryKey: ["words", "all", username],
    queryFn: () => fetch(`/api/users/${username}/words?limit=100`).then(r => r.json()),
    enabled: !!username,
  })

  // Top videos by timesSeen (for "Most Pushed" slide)
  const { data: topVideosResp, isLoading: videosLoading } = useQuery<{ videos: Video[]; total: number }>({
    queryKey: ["videos-top-seen", username],
    queryFn: () => fetch(apiRoutes.userVideos(username!, { limit: 10, sort: "timesSeen" })).then(r => r.json()),
    enabled: !!username,
  })

  // Top videos by watchSeconds (for "Most Watched" slide)
  const { data: topWatchedResp } = useQuery<{ videos: Video[]; total: number }>({
    queryKey: ["videos-top-watched", username],
    queryFn: () => fetch(apiRoutes.userVideos(username!, { limit: 10, sort: "watchSeconds" })).then(r => r.json()),
    enabled: !!username,
  })

  const { data: channelsData } = useQuery<any[]>({
    queryKey: ["channels", username],
    queryFn: () => fetch(apiRoutes.userStatsChannels(username!)).then(r => r.json()),
    enabled: !!username,
    select: (d) => (Array.isArray(d) ? d : []),
  })

  const topVideos = topVideosResp?.videos ?? []
  const totalVideos = topVideosResp?.total ?? 0
  const topWatched = topWatchedResp?.videos ?? []
  const topWord = wordsData?.wordData[0]?.text ?? "—"

  // Best-effort video data map from the small fetches (for word cloud hover)
  const videoDataMap: Record<string, { title: string; imageUrl: string | null }> = {}
  for (const v of [...topVideos, ...topWatched]) {
    videoDataMap[v.url] = { title: v.title, imageUrl: v.imageUrl }
  }

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
        videos={topVideos}
        gradient={{ from: "#B45309", to: "#0a0a0a" }}
      />,
      <MostWatchedSlide
        key="watched"
        videos={topWatched}
        gradient={{ from: "#065F46", to: "#0a0a0a" }}
      />,
      <TopChannelsSlide
        key="channels"
        channels={channelsData ?? []}
        gradient={{ from: "#7C3AED", to: "#0a0a0a" }}
      />,
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
