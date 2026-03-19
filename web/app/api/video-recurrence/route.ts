import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, userVideoStats, videos } from "@/lib/db"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function GET() {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const [stats, allVideos] = await Promise.all([
      db.select().from(userVideoStats).all(),
      db.select().from(videos).all(),
    ])

    const videoMap = new Map(allVideos.map(v => [v.url, v]))

    // Per-video: collect dates it appeared on
    const byVideo = new Map<string, Set<string>>()
    for (const s of stats) {
      if (!byVideo.has(s.videoUrl)) byVideo.set(s.videoUrl, new Set())
      byVideo.get(s.videoUrl)!.add(s.date)
    }

    // Total tracked days
    const allDates = new Set(stats.map(s => s.date))
    const totalDays = Math.max(allDates.size, 1)

    const result = Array.from(byVideo.entries())
      .map(([url, dates]) => {
        const v = videoMap.get(url)
        const daysAppeared = dates.size
        return {
          url,
          title: v?.title ?? url,
          timesSeen: v?.timesSeen ?? 0,
          daysAppeared,
          consistency: Math.round((daysAppeared / totalDays) * 100),
          firstSeen: Array.from(dates).sort()[0],
          lastSeen: Array.from(dates).sort().at(-1),
        }
      })
      .sort((a, b) => b.daysAppeared - a.daysAppeared)
      .slice(0, 20)

    return Response.json({ totalDays, videos: result }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
