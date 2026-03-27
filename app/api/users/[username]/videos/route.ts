import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, videos, userVideoStats } from "@/lib/db"
import { eq, and, sql, like, desc, asc } from "drizzle-orm"

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
    const date = url.searchParams.get("date")    // exact date YYYY-MM-DD
    const month = url.searchParams.get("month")  // month prefix YYYY-MM

    if (date || month) {
      // Scoped query: join userVideoStats for date filtering, aggregate stats
      const dateFilter = date
        ? eq(userVideoStats.date, date)
        : like(userVideoStats.date, `${month}%`)

      const rows = await db
        .select({
          url: videos.url,
          title: videos.title,
          imageUrl: videos.imageUrl,
          username: videos.username,
          channelName: videos.channelName,
          channelUrl: videos.channelUrl,
          timesWatched: sql<number>`SUM(CASE WHEN ${userVideoStats.source} = 'watched' THEN ${userVideoStats.timesWatched} ELSE 0 END)`,
          timesSeen: sql<number>`SUM(CASE WHEN ${userVideoStats.source} != 'watched' THEN ${userVideoStats.timesSeen} ELSE 0 END)`,
          watchSeconds: sql<number>`SUM(${userVideoStats.watchSeconds})`,
        })
        .from(userVideoStats)
        .innerJoin(videos, eq(userVideoStats.videoUrl, videos.url))
        .where(and(eq(userVideoStats.username, username), dateFilter))
        .groupBy(videos.url)
        .all()

      return Response.json(rows, { headers: CORS })
    }

    // All-time with optional pagination and sorting
    const limit = url.searchParams.get("limit")
    const offset = parseInt(url.searchParams.get("offset") ?? "0")
    const sort = url.searchParams.get("sort") ?? "timesSeen"

    const orderExpr = sort === "title"
      ? asc(videos.title)
      : sort === "watchSeconds"
        ? desc(videos.watchSeconds)
        : desc(videos.timesSeen)

    if (limit) {
      const lim = Math.min(Math.max(parseInt(limit), 1), 200)
      const [rows, countResult] = await Promise.all([
        db.select({
          url: videos.url,
          title: videos.title,
          imageUrl: videos.imageUrl,
          username: videos.username,
          timesWatched: videos.timesWatched,
          timesSeen: videos.timesSeen,
          watchSeconds: videos.watchSeconds,
          tags: videos.tags,
          channelName: videos.channelName,
          channelUrl: videos.channelUrl,
          channelAvatarUrl: videos.channelAvatarUrl,
          timesClicked: sql<number>`COALESCE(SUM(${userVideoStats.timesClicked}), 0)`,
        }).from(videos)
          .leftJoin(userVideoStats, eq(videos.url, userVideoStats.videoUrl))
          .where(eq(videos.username, username))
          .groupBy(videos.url)
          .orderBy(orderExpr)
          .limit(lim).offset(offset).all(),
        db.select({ count: sql<number>`COUNT(*)` }).from(videos)
          .where(eq(videos.username, username)).get(),
      ])
      return Response.json({ videos: rows, total: countResult?.count ?? 0 }, { headers: CORS })
    }

    // No limit: return all (used by other pages)
    const results = await db.select().from(videos).where(eq(videos.username, username)).all()
    return Response.json(results, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
