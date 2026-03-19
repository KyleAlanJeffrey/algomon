import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, userVideoStats } from "@/lib/db"
import { eq, sql } from "drizzle-orm"

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
        source: userVideoStats.source,
        timesSeen: sql<number>`SUM(${userVideoStats.timesSeen})`,
        timesWatched: sql<number>`SUM(${userVideoStats.timesWatched})`,
        uniqueVideos: sql<number>`COUNT(DISTINCT ${userVideoStats.videoUrl})`,
        totalWatchSeconds: sql<number>`SUM(${userVideoStats.watchSeconds})`,
      })
      .from(userVideoStats)
      .where(eq(userVideoStats.username, username))
      .groupBy(userVideoStats.source)
      .all()

    return Response.json(rows, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
