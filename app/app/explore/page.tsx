"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts"
import { useUser } from "@/components/user-context"
import { apiRoutes } from "@/lib/api-routes"
import type { WordsResponse, Video } from "@/lib/types"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

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
interface SourceRow {
  source: string; timesSeen: number; timesWatched: number
  uniqueVideos: number; totalWatchSeconds: number
}
interface ChannelRow {
  channelName: string; channelUrl: string | null
  videoCount: number; totalSeen: number
  totalWatched: number; totalWatchSeconds: number
}
interface GraphNode {
  id: string; title: string; channelName: string | null
  timesSeen: number; timesWatched: number
}
interface GraphEdge {
  source: string; target: string; timesSeen: number
}
interface GraphResponse {
  nodes: GraphNode[]; edges: GraphEdge[]
}

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
  backgroundColor: "#18181b",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
  boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
}

const SOURCE_COLORS: Record<string, string> = {
  home: "#A855F7",
  sidebar: "#3B82F6",
  shorts: "#EC4899",
  watched: "#10B981",
}

const SOURCE_LABELS: Record<string, string> = {
  home: "Home Feed",
  sidebar: "Sidebar",
  shorts: "Shorts",
  watched: "Watched",
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
  const [graphEdgeLimit, setGraphEdgeLimit] = useState(100)

  const { data: wordsData } = useQuery<WordsResponse>({
    queryKey: ["words", "all", "explore", username],
    queryFn: () => fetch(apiRoutes.userWords(username!, { limit: 500 })).then(r => r.json()),
    enabled: !!username,
  })
  const { data: videosData } = useQuery<Video[]>({
    queryKey: ["videos", username],
    queryFn: () => fetch(apiRoutes.userVideos(username!)).then(r => r.json()),
    enabled: !!username,
    select: (d) => (Array.isArray(d) ? d : []),
  })
  const { data: dailyStats } = useQuery<DailyStat[]>({
    queryKey: ["daily-stats", username],
    queryFn: () => fetch(apiRoutes.userStatsDaily(username!)).then(r => r.json()),
    enabled: !!username,
  })
  const { data: wordTrends } = useQuery<WordTrendsResponse>({
    queryKey: ["word-trends", username],
    queryFn: () => fetch(apiRoutes.userStatsWordTrends(username!)).then(r => r.json()),
    enabled: !!username,
  })
  const { data: dowStats } = useQuery<DayOfWeekStat[]>({
    queryKey: ["day-of-week", username],
    queryFn: () => fetch(apiRoutes.userStatsDayOfWeek(username!)).then(r => r.json()),
    enabled: !!username,
  })
  const { data: tagsData } = useQuery<TagsResponse>({
    queryKey: ["tags-distribution", username],
    queryFn: () => fetch(apiRoutes.userStatsTagsDistribution(username!)).then(r => r.json()),
    enabled: !!username,
  })
  const { data: recurrenceData } = useQuery<RecurrenceResponse>({
    queryKey: ["video-recurrence", username],
    queryFn: () => fetch(apiRoutes.userStatsVideoRecurrence(username!)).then(r => r.json()),
    enabled: !!username,
  })
  const { data: sourceData } = useQuery<SourceRow[]>({
    queryKey: ["source-distribution", username],
    queryFn: () => fetch(apiRoutes.userStatsSourceDistribution(username!)).then(r => r.json()),
    enabled: !!username,
    select: (d) => (Array.isArray(d) ? d : []),
  })
  const { data: channelsData } = useQuery<ChannelRow[]>({
    queryKey: ["channels", username],
    queryFn: () => fetch(apiRoutes.userStatsChannels(username!)).then(r => r.json()),
    enabled: !!username,
    select: (d) => (Array.isArray(d) ? d : []),
  })
  const { data: graphData } = useQuery<GraphResponse>({
    queryKey: ["recommendation-graph", username, graphEdgeLimit],
    queryFn: () => fetch(apiRoutes.userStatsRecommendationGraph(username!, graphEdgeLimit)).then(r => r.json()),
    enabled: !!username,
  })

  // ── Derived metrics ──

  const totalVideos = videosData?.length ?? 0
  const totalWords = useMemo(() => new Set(wordsData?.wordData.map(w => w.text)).size, [wordsData])
  const daysTracked = useMemo(() => new Set(wordsData?.wordData.map(w => w.date)).size, [wordsData])

  const watchedRow = useMemo(() => sourceData?.find(r => r.source === "watched"), [sourceData])
  const totalWatchSeconds = watchedRow?.totalWatchSeconds ?? 0
  const totalWatchHours = totalWatchSeconds > 0 ? (totalWatchSeconds / 3600).toFixed(1) : null
  const totalWatched = watchedRow?.timesWatched ?? 0

  const sourceChartData = useMemo(() =>
    (sourceData ?? [])
      .filter(r => r.source !== "watched")
      .map(r => ({ name: SOURCE_LABELS[r.source] ?? r.source, value: r.timesSeen, color: SOURCE_COLORS[r.source] ?? "#666" }))
      .sort((a, b) => b.value - a.value),
    [sourceData]
  )

  const mostWatched = useMemo(() =>
    [...(videosData ?? [])]
      .filter(v => v.timesWatched > 0)
      .sort((a, b) => b.watchSeconds - a.watchSeconds)
      .slice(0, 10),
    [videosData]
  )

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

  // Graph data for force-directed layout
  const graphForceData = useMemo(() => {
    if (!graphData?.nodes?.length) return null
    const channels = Array.from(new Set(graphData.nodes.map(n => n.channelName).filter(Boolean)))
    const channelColorMap = new Map(channels.map((ch, i) => [ch, CHART_COLORS[i % CHART_COLORS.length]]))

    const links = graphData.edges.map(e => ({
      source: e.source,
      target: e.target,
      value: e.timesSeen,
    }))
    // Count connections per node (in + out)
    const connCount = new Map<string, number>()
    for (const e of graphData.edges) {
      connCount.set(e.source, (connCount.get(e.source) ?? 0) + 1)
      connCount.set(e.target, (connCount.get(e.target) ?? 0) + 1)
    }
    const maxConn = Math.max(1, ...connCount.values())

    const nodes = graphData.nodes.map(n => ({
      id: n.id,
      title: n.title,
      channelName: n.channelName,
      timesSeen: n.timesSeen,
      timesWatched: n.timesWatched,
      val: Math.max(2, Math.sqrt(n.timesSeen)),
      color: n.channelName ? channelColorMap.get(n.channelName) ?? "#666" : "#666",
      connections: connCount.get(n.id) ?? 0,
      connRatio: (connCount.get(n.id) ?? 0) / maxConn,
    }))
    return { nodes, links }
  }, [graphData])

  const graphContainerRef = useRef<HTMLDivElement>(null)
  const [graphWidth, setGraphWidth] = useState(800)
  useEffect(() => {
    if (!graphContainerRef.current) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) setGraphWidth(entry.contentRect.width)
    })
    obs.observe(graphContainerRef.current)
    return () => obs.disconnect()
  }, [])

  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [showGraph, setShowGraph] = useState(false)
  const [graphFullscreen, setGraphFullscreen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node?.id ?? null)
  }, [])

  // Thumbnail image cache for graph nodes
  const thumbCache = useRef<Map<string, HTMLImageElement | null>>(new Map())
  const loadThumb = useCallback((url: string): HTMLImageElement | null => {
    if (thumbCache.current.has(url)) return thumbCache.current.get(url) ?? null
    // Mark as loading
    thumbCache.current.set(url, null)
    const thumbUrl = getThumb(url)
    if (!thumbUrl) return null
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.src = thumbUrl
    img.onload = () => { thumbCache.current.set(url, img) }
    return null
  }, [])

  // Obsidian-like physics config
  const graphRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  useEffect(() => {
    if (!graphRef.current) return
    const fg = graphRef.current
    // Obsidian-style physics: strong repulsion, moderate centering, velocity decay
    fg.d3Force("charge")?.strength(-120).distanceMax(300)
    fg.d3Force("link")?.distance(80)
    fg.d3Force("center")?.strength(0.05)
    fg.d3VelocityDecay?.(0.3)
  }, [graphForceData])

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
            sub="of videos = 80% of all recommendations"
          />
        )}
        <StatCard title="Videos Watched" value={totalWatched.toLocaleString()} sub="times you actually clicked play" />
        {totalWatchHours && (
          <StatCard title="Watch Time" value={`${totalWatchHours}h`} sub="total tracked" />
        )}
      </div>

      {/* ── Where videos come from ── */}
      {sourceChartData.length > 0 && (
        <div className="mb-10">
          <SectionHeading>Where Recommendations Come From</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sourceChartData.map(s => {
              const total = sourceChartData.reduce((acc, r) => acc + r.value, 0)
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
              return (
                <div key={s.name} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <p className="text-xs uppercase tracking-widest text-white/40">{s.name}</p>
                  </div>
                  <p className="text-3xl font-black text-white">{pct}%</p>
                  <p className="text-xs text-white/40 mt-1">{s.value.toLocaleString()} recommendations</p>
                  <div className="mt-3 h-1 rounded-full bg-white/10">
                    <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Top Channels ── */}
      {channelsData && channelsData.length > 0 && (
        <div className="mb-10">
          <SectionHeading>Top Channels</SectionHeading>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs uppercase tracking-widest text-white/30 px-4 py-3 border-b border-white/10 gap-4">
              <span>Channel</span>
              <span className="text-right w-16">Videos</span>
              <span className="text-right w-16">Seen</span>
              <span className="text-right w-20">Watched</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {channelsData.slice(0, 20).map(ch => {
                const watchMins = Math.round(ch.totalWatchSeconds / 60)
                return (
                  <a
                    key={ch.channelName}
                    href={ch.channelUrl ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(ch.channelName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm text-white/80 truncate">{ch.channelName}</span>
                    <span className="text-sm font-bold text-white/60 text-right w-16">{ch.videoCount}</span>
                    <span className="text-sm font-bold text-white/60 text-right w-16">{ch.totalSeen}×</span>
                    <span className="text-sm font-bold text-[#10B981] text-right w-20">
                      {watchMins > 0 ? `${watchMins}m` : ch.totalWatched > 0 ? `${ch.totalWatchSeconds}s` : "—"}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Recommendation Graph ── */}
      {graphForceData && graphForceData.nodes.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <SectionHeading>Recommendation Graph</SectionHeading>
            <button
              onClick={() => setShowGraph(g => !g)}
              className="text-xs font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors mb-4"
            >
              {showGraph ? "Hide" : "Show"}
            </button>
            {showGraph && (
              <div className="flex items-center gap-1.5 mb-4">
                <label className="text-xs text-white/40 mr-1">Edges:</label>
                {[25, 50, 100, 200, 500].map(n => (
                  <button
                    key={n}
                    onClick={() => setGraphEdgeLimit(n)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      graphEdgeLimit === n
                        ? "border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
          {showGraph && (
            <>
              <div
                ref={graphContainerRef}
                className={
                  graphFullscreen
                    ? "fixed inset-0 z-50 bg-[#0a0a0a]"
                    : "bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative"
                }
                style={graphFullscreen ? undefined : { height: 600 }}
              >
                {/* Controls overlay */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button
                    onClick={() => { setGraphFullscreen(f => !f); setSelectedNode(null) }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white/60 hover:text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                  >
                    {graphFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </button>
                </div>

                <ForceGraph2D
                  ref={graphRef}
                  width={graphFullscreen ? (typeof window !== "undefined" ? window.innerWidth : 1200) : graphWidth}
                  height={graphFullscreen ? (typeof window !== "undefined" ? window.innerHeight : 800) : 600}
                  graphData={graphForceData}
                  nodeRelSize={4}
                  nodeLabel=""
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    const isHovered = hoveredNode === node.id
                    const isSelected = selectedNode === node.id
                    const connRatio = node.connRatio ?? 0
                    const connections = node.connections ?? 0

                    // Scale thumbnail size by connection count
                    const sizeScale = 1 + connRatio * 0.8
                    const THUMB_W = 16 * sizeScale
                    const THUMB_H = 9 * sizeScale
                    const hoverScale = isHovered || isSelected ? 1.2 : 1
                    const w = THUMB_W * hoverScale
                    const h = THUMB_H * hoverScale
                    const x = node.x - w / 2
                    const y = node.y - h / 2
                    const r = 2

                    // Glow for highly connected nodes (>= 3 connections)
                    if (connections >= 3) {
                      ctx.save()
                      ctx.shadowColor = node.color ?? "#A855F7"
                      ctx.shadowBlur = 6 + connRatio * 14
                      ctx.beginPath()
                      ctx.roundRect(x, y, w, h, r)
                      ctx.fillStyle = node.color ?? "#A855F7"
                      ctx.globalAlpha = 0.15 + connRatio * 0.2
                      ctx.fill()
                      ctx.restore()
                    }

                    // Try to draw thumbnail
                    const img = loadThumb(node.id)
                    if (img?.complete && img.naturalWidth > 0) {
                      ctx.save()
                      ctx.beginPath()
                      ctx.roundRect(x, y, w, h, r)
                      ctx.clip()
                      ctx.drawImage(img, x, y, w, h)
                      ctx.restore()

                      ctx.beginPath()
                      ctx.roundRect(x, y, w, h, r)
                      ctx.strokeStyle = isHovered || isSelected ? "#fff"
                        : connections >= 3 ? (node.color ?? "#A855F7")
                        : "rgba(255,255,255,0.2)"
                      ctx.lineWidth = isHovered || isSelected ? 0.8 : connections >= 3 ? 0.6 : 0.3
                      ctx.stroke()
                    } else {
                      ctx.beginPath()
                      ctx.roundRect(x, y, w, h, r)
                      ctx.fillStyle = node.color ?? "#333"
                      ctx.globalAlpha = isHovered ? 1 : 0.5 + connRatio * 0.4
                      ctx.fill()
                      ctx.globalAlpha = 1

                      const fontSize = Math.max(2, 3)
                      ctx.font = `${fontSize}px Sans-Serif`
                      ctx.fillStyle = "#fff"
                      ctx.textAlign = "center"
                      ctx.textBaseline = "middle"
                      const label = node.title?.length > 20 ? node.title.slice(0, 17) + "…" : node.title
                      ctx.fillText(label ?? "", node.x, node.y)
                    }

                    // Connection count badge
                    if (connections >= 3 && !isHovered) {
                      const badgeR = Math.max(2.5, 3 * sizeScale)
                      const bx = x + w - badgeR * 0.3
                      const by = y + badgeR * 0.3
                      ctx.beginPath()
                      ctx.arc(bx, by, badgeR, 0, Math.PI * 2)
                      ctx.fillStyle = node.color ?? "#A855F7"
                      ctx.fill()
                      ctx.font = `bold ${badgeR * 1.1}px Sans-Serif`
                      ctx.fillStyle = "#fff"
                      ctx.textAlign = "center"
                      ctx.textBaseline = "middle"
                      ctx.fillText(String(connections), bx, by)
                    }

                    // Title label on hover
                    if (isHovered) {
                      const fontSize = Math.max(3.5, 8 / globalScale)
                      const title = node.title?.length > 50 ? node.title.slice(0, 47) + "…" : node.title
                      ctx.font = `bold ${fontSize}px Sans-Serif`
                      ctx.textAlign = "center"
                      ctx.textBaseline = "bottom"

                      const metrics = ctx.measureText(title ?? "")
                      const pad = 2
                      ctx.fillStyle = "rgba(0,0,0,0.8)"
                      ctx.beginPath()
                      ctx.roundRect(node.x - metrics.width / 2 - pad, y - fontSize - pad * 2, metrics.width + pad * 2, fontSize + pad * 2, 2)
                      ctx.fill()

                      ctx.fillStyle = "#fff"
                      ctx.fillText(title ?? "", node.x, y - pad)

                      if (node.channelName) {
                        const chFontSize = fontSize * 0.75
                        ctx.font = `${chFontSize}px Sans-Serif`
                        ctx.fillStyle = "rgba(255,255,255,0.5)"
                        ctx.fillText(`${node.channelName} · ${connections} connections`, node.x, y - fontSize - pad * 2)
                      }
                    }
                  }}
                  nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                    const connRatio = node.connRatio ?? 0
                    const sizeScale = 1 + connRatio * 0.8
                    const w = 16 * sizeScale, h = 9 * sizeScale
                    ctx.fillStyle = color
                    ctx.fillRect(node.x - w / 2, node.y - h / 2, w, h)
                  }}
                  linkColor={() => "rgba(255,255,255,0.06)"}
                  linkWidth={(link: any) => Math.max(0.3, Math.sqrt(link.value ?? 1) * 0.5)}
                  linkDirectionalArrowLength={3}
                  linkDirectionalArrowRelPos={0.9}
                  linkDirectionalArrowColor={() => "rgba(255,255,255,0.15)"}
                  onNodeHover={handleNodeHover}
                  onNodeClick={(node: any) => {
                    if (node.id) setSelectedNode(prev => prev === node.id ? null : node.id)
                  }}
                  onBackgroundClick={() => setSelectedNode(null)}
                  onNodeDragEnd={(node: any) => {
                    node.fx = node.x
                    node.fy = node.y
                  }}
                  enableNodeDrag={true}
                  backgroundColor="transparent"
                  cooldownTicks={200}
                  warmupTicks={50}
                />

                {/* Video info popup */}
                {selectedNode && (() => {
                  const gNode = graphForceData.nodes.find(n => n.id === selectedNode)
                  const videoInfo = videosData?.find(v => v.url === selectedNode)
                  if (!gNode) return null
                  const thumb = getThumb(selectedNode)
                  const connections = (gNode as any).connections ?? 0
                  const watchMins = videoInfo ? Math.round(videoInfo.watchSeconds / 60) : 0

                  // Find connected videos
                  const recommendedFrom = graphData?.edges
                    .filter(e => e.target === selectedNode)
                    .map(e => {
                      const n = graphForceData.nodes.find(n => n.id === e.source)
                      return n ? { url: e.source, title: n.title, timesSeen: e.timesSeen } : null
                    })
                    .filter(Boolean) ?? []
                  const recommendsTo = graphData?.edges
                    .filter(e => e.source === selectedNode)
                    .map(e => {
                      const n = graphForceData.nodes.find(n => n.id === e.target)
                      return n ? { url: e.target, title: n.title, timesSeen: e.timesSeen } : null
                    })
                    .filter(Boolean) ?? []

                  return (
                    <div className="absolute top-3 left-3 z-10 w-80 bg-black/90 border border-white/15 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
                      {/* Thumbnail header */}
                      {thumb && (
                        <div className="relative w-full aspect-video bg-white/5">
                          <Image src={thumb} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-sm font-medium text-white leading-snug">{gNode.title}</p>
                        {gNode.channelName && (
                          <p className="text-xs text-white/40 mt-1">{gNode.channelName}</p>
                        )}

                        {/* Stats row */}
                        <div className="flex gap-4 mt-3 text-xs">
                          <div>
                            <span className="text-white/30">Seen </span>
                            <span className="text-white/70 font-bold">{videoInfo?.timesSeen ?? gNode.timesSeen}×</span>
                          </div>
                          {(videoInfo?.timesWatched ?? gNode.timesWatched) > 0 && (
                            <div>
                              <span className="text-white/30">Watched </span>
                              <span className="text-white/70 font-bold">{videoInfo?.timesWatched ?? gNode.timesWatched}×</span>
                            </div>
                          )}
                          {watchMins > 0 && (
                            <div>
                              <span className="text-white/30">Time </span>
                              <span className="text-[#10B981] font-bold">{watchMins}m</span>
                            </div>
                          )}
                          <div>
                            <span className="text-white/30">Links </span>
                            <span className="text-white/70 font-bold">{connections}</span>
                          </div>
                        </div>

                        {/* Recommended from */}
                        {recommendedFrom.length > 0 && (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Recommended from</p>
                            {recommendedFrom.map((v: any) => (
                              <button
                                key={v.url}
                                onClick={(e) => { e.stopPropagation(); setSelectedNode(v.url) }}
                                className="block w-full text-left text-xs text-white/60 hover:text-white truncate py-0.5"
                              >
                                {v.title} <span className="text-white/25">{v.timesSeen}×</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Recommends to */}
                        {recommendsTo.length > 0 && (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Leads to</p>
                            {recommendsTo.map((v: any) => (
                              <button
                                key={v.url}
                                onClick={(e) => { e.stopPropagation(); setSelectedNode(v.url) }}
                                className="block w-full text-left text-xs text-white/60 hover:text-white truncate py-0.5"
                              >
                                {v.title} <span className="text-white/25">{v.timesSeen}×</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <a
                            href={selectedNode}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center text-xs font-medium px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                          >
                            Open on YouTube
                          </a>
                          <button
                            onClick={() => setSelectedNode(null)}
                            className="text-xs font-medium px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
              {!graphFullscreen && (
                <p className="text-xs text-white/20 mt-2">
                  Drag nodes to pin them. Click for details. Scroll to zoom. Colors = channels. Bigger = more connections.
                </p>
              )}
            </>
          )}
        </div>
      )}

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

      {/* ── Most watched ── */}
      {mostWatched.length > 0 && (
        <div className="mb-10">
          <SectionHeading>Videos You Actually Watched</SectionHeading>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] text-xs uppercase tracking-widest text-white/30 px-4 py-3 border-b border-white/10 gap-3">
              <span>Video</span>
              <span className="text-right w-20">Watch Time</span>
              <span className="text-right w-16">Times</span>
            </div>
            <div className="divide-y divide-white/5">
              {mostWatched.map(v => {
                const thumb = getThumb(v.url)
                const mins = Math.round(v.watchSeconds / 60)
                return (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {thumb && (
                        <div className="relative w-16 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                          <Image src={thumb} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <span className="text-sm text-white/80 truncate">{v.title}</span>
                    </div>
                    <span className="text-sm font-bold text-[#10B981] text-right w-20">
                      {mins > 0 ? `${mins}m` : `${v.watchSeconds}s`}
                    </span>
                    <span className="text-sm font-bold text-white/50 text-right w-16">{v.timesWatched}×</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}

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
