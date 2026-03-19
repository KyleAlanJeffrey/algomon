import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, userVideoStats, videos } from "@/lib/db"
import { eq } from "drizzle-orm"


const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { env } = getCloudflareContext()
    const db = getDb(env.DB)
    const [stats, allVideos] = await Promise.all([
      db.select().from(userVideoStats).where(eq(userVideoStats.username, username)).all(),
      db.select().from(videos).where(eq(videos.username, username)).all(),
    ])

    const videoMap = new Map(allVideos.map(v => [v.url, v]))

    const byVideo = new Map<string, Set<string>>()
    for (const s of stats) {
      if (!byVideo.has(s.videoUrl)) byVideo.set(s.videoUrl, new Set())
      byVideo.get(s.videoUrl)!.add(s.date)
    }

    const allDates = new Set(stats.map(s => s.date))
    const totalDays = Math.max(allDates.size, 1)

    const result = Array.from(byVideo.entries())
      .map(([url, dates]) => {
        const v = videoMap.get(url)
        return {
          url,
          title: v?.title ?? url,
          timesSeen: v?.timesSeen ?? 0,
          daysAppeared: dates.size,
          consistency: Math.round((dates.size / totalDays) * 100),
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
