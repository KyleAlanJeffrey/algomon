"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import Image from "next/image"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { WordsResponse, Video } from "@/lib/types"

interface DailyStat { date: string; videos: number }

function getYouTubeThumbnail(url: string) {
  try {
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://img.youtube.com/vi/${v}/mqdefault.jpg`
    const parts = u.pathname.split("/")
    const idx = parts.indexOf("shorts")
    if (idx !== -1 && parts[idx + 1]) return `https://img.youtube.com/vi/${parts[idx + 1]}/mqdefault.jpg`
  } catch {}
  return null
}

function Card({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{title}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

const TOOLTIP_STYLE = {
  backgroundColor: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
}

export default function ExplorePage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"timesSeen" | "title">("timesSeen")

  const { data: wordsData } = useQuery<WordsResponse>({
    queryKey: ["words", "all", "explore"],
    queryFn: () => fetch("/api/words?limit=500").then(r => r.json()),
  })

  const { data: videosData } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: () => fetch("/api/videos").then(r => r.json()),
  })

  const { data: dailyStats } = useQuery<DailyStat[]>({
    queryKey: ["daily-stats"],
    queryFn: () => fetch("/api/daily-stats").then(r => r.json()),
  })

  const topWords = useMemo(() => {
    const map = new Map<string, number>()
    for (const w of wordsData?.wordData ?? []) {
      map.set(w.text, (map.get(w.text) ?? 0) + w.timesSeen)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([word, count]) => ({ word, count }))
  }, [wordsData])

  const filteredVideos = useMemo(() => {
    const videos = videosData ?? []
    const q = search.toLowerCase()
    return videos
      .filter(v => !q || v.title.toLowerCase().includes(q) || v.url.includes(q))
      .sort((a, b) =>
        sortBy === "timesSeen"
          ? b.timesSeen - a.timesSeen
          : a.title.localeCompare(b.title)
      )
  }, [videosData, search, sortBy])

  const totalVideos = videosData?.length ?? 0
  const totalWords = new Map(wordsData?.wordData.map(w => [w.text, true])).size
  const daysTracked = new Set(wordsData?.wordData.map(w => w.date)).size
  const mostSeen = videosData ? Math.max(...videosData.map(v => v.timesSeen), 0) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-16 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black tracking-tight mb-1">Explore</h1>
      <p className="text-white/40 text-sm mb-8">All your YouTube algorithm data in one place.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <Card title="Total Videos" value={totalVideos.toLocaleString()} />
        <Card title="Unique Words" value={totalWords.toLocaleString()} />
        <Card title="Days Tracked" value={daysTracked} />
        <Card title="Max Times Seen" value={mostSeen} sub="single video" />
      </div>

      {/* Time-series chart */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Videos per Day</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyStats ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
              <Area type="monotone" dataKey="videos" stroke="#A855F7" strokeWidth={2} fill="url(#grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top words chart */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Top 25 Words</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topWords} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="word" width={80} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" fill="#EC4899" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Video table */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">All Videos</h2>
          <div className="flex gap-2 sm:ml-auto">
            <input
              type="text"
              placeholder="Search titles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 w-52"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as "timesSeen" | "title")}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            >
              <option value="timesSeen">Sort: Most seen</option>
              <option value="title">Sort: Title A–Z</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto] text-xs uppercase tracking-widest text-white/30 px-4 py-3 border-b border-white/10">
            <span className="w-8">#</span>
            <span>Title</span>
            <span className="text-right w-20">Seen</span>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {filteredVideos.map((v, i) => {
              const thumb = getYouTubeThumbnail(v.url)
              return (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <span className="text-white/25 font-mono text-xs w-8">{i + 1}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    {thumb && (
                      <div className="relative w-16 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                        <Image src={thumb} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <span className="text-sm text-white/80 truncate">{v.title}</span>
                  </div>
                  <span className="text-sm font-bold text-white/60 text-right w-20">{v.timesSeen}×</span>
                </a>
              )
            })}
            {filteredVideos.length === 0 && (
              <p className="px-4 py-8 text-center text-white/30 text-sm">No videos match your search.</p>
            )}
          </div>
        </div>
        <p className="text-xs text-white/20 mt-2 text-right">{filteredVideos.length} videos</p>
      </section>
    </div>
  )
}
