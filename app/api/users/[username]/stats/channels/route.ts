import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, videos } from "@/lib/db"
import { eq, sql, isNotNull, and } from "drizzle-orm"

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
