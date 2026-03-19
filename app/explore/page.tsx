"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import Image from "next/image"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts"
import { useUser } from "@/components/user-context"
import type { WordsResponse, Video } from "@/lib/types"

// ── Types ────────────────────────────────────────────────────────────────────

interface DailyStat { date: string; videos: number }
interface WordTrendsResponse { words: string[]; rows: Record<string, number | string>[] }
interface DayOfWeekStat { day: string; avgVideos: number; totalVideos: number; occurrences: number }
interface TagStat { tag: string; count: number }
interface TagsResponse { tags: TagStat[]; untagged: number; total: number }
interface RecurrenceVideo {
  url: string; title: string; timesSeen: number
  daysAppeared: number; consistency: number
  firstSeen: string; lastSeen: string
}
interface RecurrenceResponse { totalDays: number; videos: RecurrenceVideo[] }

// ── Helpers ───────────────────────────────────────────────────────────────────

function getThumb(url: string) {
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

const CHART_COLORS = ["#A855F7", "#EC4899", "#3B82F6", "#10B981", "#F97316", "#EAB308"]

const TOOLTIP_STYLE = {
  backgroundColor: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
}

const AXIS_TICK = { fill: "rgba(255,255,255,0.3)", fontSize: 11 }
const GRID = "rgba(255,255,255,0.05)"

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{children}</h2>
}

function ChartCard({ children, height = "h-56" }: { children: React.ReactNode; height?: string }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${height}`}>
      {children}
    </div>
  )
}

function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{title}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const { username } = useUser()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"timesSeen" | "title">("timesSeen")

  const { data: wordsData } = useQuery<WordsResponse>({
    queryKey: ["words", "all", "explore", username],
    queryFn: () => fetch(`/api/users/${username}/words?limit=500`).then(r => r.json()),
    enabled: !!username,
  })
  const { data: videosData } = useQuery<Video[]>({
    queryKey: ["videos", username],
    queryFn: () => fetch(`/api/users/${username}/videos`).then(r => r.json()),
    enabled: !!username,
  })
  const { data: dailyStats } = useQuery<DailyStat[]>({
    queryKey: ["daily-stats", username],
    queryFn: () => fetch(`/api/users/${username}/stats/daily`).then(r => r.json()),
    enabled: !!username,
  })
  const { data: wordTrends } = useQuery<WordTrendsResponse>({
    queryKey: ["word-trends", username],
    queryFn: () => fetch(`/api/users/${username}/stats/word-trends?top=6`).then(r => r.json()),
    enabled: !!username,
  })
  const { data: dowStats } = useQuery<DayOfWeekStat[]>({
    queryKey: ["day-of-week", username],
    queryFn: () => fetch(`/api/users/${username}/stats/day-of-week`).then(r => r.json()),
    enabled: !!username,
  })
  const { data: tagsData } = useQuery<TagsResponse>({
    queryKey: ["tags-distribution", username],
    queryFn: () => fetch(`/api/users/${username}/stats/tags-distribution`).then(r => r.json()),
    enabled: !!username,
  })
  const { data: recurrenceData } = useQuery<RecurrenceResponse>({
    queryKey: ["video-recurrence", username],
    queryFn: () => fetch(`/api/users/${username}/stats/video-recurrence`).then(r => r.json()),
    enabled: !!username,
  })

  // ── Derived metrics ──

  const totalVideos = videosData?.length ?? 0
  const totalWords = useMemo(() => new Set(wordsData?.wordData.map(w => w.text)).size, [wordsData])
  const daysTracked = useMemo(() => new Set(wordsData?.wordData.map(w => w.date)).size, [wordsData])

  // Content concentration: what % of videos account for 80% of total recommendations
  const concentration = useMemo(() => {
    if (!videosData?.length) return null
    const sorted = [...videosData].sort((a, b) => b.timesSeen - a.timesSeen)
    const total = sorted.reduce((s, v) => s + v.timesSeen, 0)
    let cum = 0, i = 0
    while (cum < total * 0.8 && i < sorted.length) { cum += sorted[i].timesSeen; i++ }
    return { topCount: i, topPct: Math.round((i / sorted.length) * 100), total }
  }, [videosData])

  // Top words for bar chart
  const topWords = useMemo(() => {
    const map = new Map<string, number>()
    for (const w of wordsData?.wordData ?? []) map.set(w.text, (map.get(w.text) ?? 0) + w.timesSeen)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([word, count]) => ({ word, count }))
  }, [wordsData])

  // Filtered video table
  const filteredVideos = useMemo(() => {
    const videos = videosData ?? []
    const q = search.toLowerCase()
    return videos
      .filter(v => !q || v.title.toLowerCase().includes(q))
      .sort((a, b) => sortBy === "timesSeen" ? b.timesSeen - a.timesSeen : a.title.localeCompare(b.title))
  }, [videosData, search, sortBy])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-20 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black tracking-tight mb-1">Explore</h1>
      <p className="text-white/40 text-sm mb-8">Deep dive into your YouTube algorithm data.</p>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard title="Total Videos" value={totalVideos.toLocaleString()} />
        <StatCard title="Unique Words" value={totalWords.toLocaleString()} />
        <StatCard title="Days Tracked" value={daysTracked} />
        {concentration && (
          <StatCard
            title="Algorithm Focus"
            value={`${concentration.topPct}%`}
            sub={`of videos = 80% of all recommendations`}
          />
        )}
      </div>

      {/* ── Videos per day + Word trends side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <div>
          <SectionHeading>Videos Discovered per Day</SectionHeading>
          <ChartCard>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                <Area type="monotone" dataKey="videos" stroke="#A855F7" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div>
          <SectionHeading>Top Word Trends Over Time</SectionHeading>
          <ChartCard>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wordTrends?.rows ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
                {(wordTrends?.words ?? []).map((word, i) => (
                  <Line
                    key={word}
                    type="monotone"
                    dataKey={word}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* ── Day of week + Tags side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <div>
          <SectionHeading>Average Videos by Day of Week</SectionHeading>
          <ChartCard>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dowStats ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="day" tickFormatter={d => d.slice(0, 3)} tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val, _name, props) => [`${val} avg (${props.payload.occurrences} ${props.payload.occurrences === 1 ? "day" : "days"})`, "Videos"]}
                />
                <Bar dataKey="avgVideos" radius={[4, 4, 0, 0]}>
                  {(dowStats ?? []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div>
          <SectionHeading>Top Content Tags</SectionHeading>
          <ChartCard height="h-56">
            {tagsData && tagsData.tags.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tagsData.tags.slice(0, 15)}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
                >
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="tag" width={90} tick={{ ...AXIS_TICK, fill: "rgba(255,255,255,0.6)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="count" fill="#EC4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/30 text-sm">No tag data yet — browse watch pages with the extension to collect tags.</p>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* ── Top 25 words ── */}
      <div className="mb-10">
        <SectionHeading>Top 25 Words (All Time)</SectionHeading>
        <ChartCard height="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topWords} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="word" width={80} tick={{ ...AXIS_TICK, fill: "rgba(255,255,255,0.6)" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topWords.map((_, i) => (
                  <Cell key={i} fill={`hsl(${280 - i * 8}, 70%, ${65 - i * 1.2}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Video recurrence ── */}
      <div className="mb-10">
        <SectionHeading>
          Most Persistent Videos — appeared on the most separate days
        </SectionHeading>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs uppercase tracking-widest text-white/30 px-4 py-3 border-b border-white/10 gap-3">
            <span>Video</span>
            <span className="text-right w-16">Days</span>
            <span className="text-right w-16">Times Seen</span>
            <span className="text-right w-20">Consistency</span>
          </div>
          <div className="divide-y divide-white/5">
            {(recurrenceData?.videos ?? []).map(v => {
              const thumb = getThumb(v.url)
              return (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {thumb && (
                      <div className="relative w-16 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                        <Image src={thumb} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-white/80 truncate">{v.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">{v.firstSeen} → {v.lastSeen}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white/60 text-right w-16">{v.daysAppeared}d</span>
                  <span className="text-sm font-bold text-white/60 text-right w-16">{v.timesSeen}×</span>
                  <div className="w-20 text-right">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `hsl(${v.consistency * 1.2}, 70%, 20%)`,
                        color: `hsl(${v.consistency * 1.2}, 80%, 65%)`,
                      }}
                    >
                      {v.consistency}%
                    </span>
                  </div>
                </a>
              )
            })}
            {!recurrenceData?.videos.length && (
              <p className="px-4 py-8 text-center text-white/30 text-sm">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Video table ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <SectionHeading>All Videos</SectionHeading>
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
              <option value="timesSeen">Most seen</option>
              <option value="title">Title A–Z</option>
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
              const thumb = getThumb(v.url)
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
              <p className="px-4 py-8 text-center text-white/30 text-sm">No videos match.</p>
            )}
          </div>
        </div>
        <p className="text-xs text-white/20 mt-2 text-right">{filteredVideos.length} videos</p>
      </div>
    </div>
  )
}
