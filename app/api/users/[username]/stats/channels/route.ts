import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, videos, userVideoStats } from "@/lib/db"
import { eq, sql, isNotNull, and, like } from "drizzle-orm"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { env } = getCloudflareContext()
    const db = getDb(env.DB)
    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const month = url.searchParams.get("month")

    if (date || month) {
      // Scoped: join through userVideoStats for date filtering
      const dateFilter = date
        ? eq(userVideoStats.date, date)
        : like(userVideoStats.date, `${month}%`)

      const rows = await db
        .select({
          channelName: videos.channelName,
          channelUrl: videos.channelUrl,
          channelAvatarUrl: sql<string | null>`MAX(${videos.channelAvatarUrl})`,
          videoCount: sql<number>`COUNT(DISTINCT ${videos.url})`,
          totalSeen: sql<number>`SUM(CASE WHEN ${userVideoStats.source} != 'watched' THEN ${userVideoStats.timesSeen} ELSE 0 END)`,
          totalWatched: sql<number>`SUM(CASE WHEN ${userVideoStats.source} = 'watched' THEN ${userVideoStats.timesWatched} ELSE 0 END)`,
          totalWatchSeconds: sql<number>`SUM(${userVideoStats.watchSeconds})`,
        })
        .from(userVideoStats)
        .innerJoin(videos, eq(userVideoStats.videoUrl, videos.url))
        .where(and(eq(userVideoStats.username, username), dateFilter, isNotNull(videos.channelName)))
        .groupBy(videos.channelName)
        .orderBy(sql`COUNT(DISTINCT ${videos.url}) DESC`)
        .limit(30)
        .all()

      return Response.json(rows, { headers: CORS })
    }

    // All-time: query videos table directly
    const rows = await db
      .select({
        channelName: videos.channelName,
        channelUrl: videos.channelUrl,
        channelAvatarUrl: sql<string | null>`MAX(${videos.channelAvatarUrl})`,
        videoCount: sql<number>`COUNT(*)`,
        totalSeen: sql<number>`SUM(${videos.timesSeen})`,
        totalWatched: sql<number>`SUM(${videos.timesWatched})`,
        totalWatchSeconds: sql<number>`SUM(${videos.watchSeconds})`,
      })
      .from(videos)
      .where(and(eq(videos.username, username), isNotNull(videos.channelName)))
      .groupBy(videos.channelName)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(30)
      .all()

    return Response.json(rows, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
