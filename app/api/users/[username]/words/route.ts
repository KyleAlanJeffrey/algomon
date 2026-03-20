import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, words, userVideoStats } from "@/lib/db"
import { eq, and, desc, like, sql } from "drizzle-orm"
import type { WordsResponse } from "@/lib/types"

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
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const month = searchParams.get("month")
    const limit = parseInt(searchParams.get("limit") ?? "100")

    // Build where conditions for words
    const conditions = [eq(words.username, username)]
    if (date) conditions.push(eq(words.date, date))
    else if (month) conditions.push(like(words.date, `${month}%`))

    // When date-scoped, aggregate across days (same word on different days = summed)
    // When not scoped, still aggregate since words table has one row per (text, date, username)
    const wordRows = await db
      .select({
        text: words.text,
        date: date ? words.date : sql<string>`MIN(${words.date})`,
        username: words.username,
        videoUrls: sql<string>`'[' || GROUP_CONCAT(DISTINCT REPLACE(REPLACE(${words.videoUrls}, '[', ''), ']', '')) || ']'`,
        timesWatched: sql<number>`SUM(${words.timesWatched})`,
        timesSeen: sql<number>`SUM(${words.timesSeen})`,
      })
      .from(words)
      .where(and(...conditions))
      .groupBy(words.text)
      .orderBy(desc(sql`SUM(${words.timesSeen})`))
      .limit(limit)
      .all()

    // Video count — use userVideoStats for date-scoped count, otherwise count distinct URLs
    let totalVideos: number
    if (date || month) {
      const dateFilter = date
        ? eq(userVideoStats.date, date)
        : like(userVideoStats.date, `${month}%`)
      const [row] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${userVideoStats.videoUrl})` })
        .from(userVideoStats)
        .where(and(eq(userVideoStats.username, username), dateFilter))
        .all()
      totalVideos = row?.count ?? 0
    } else {
      const [row] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${userVideoStats.videoUrl})` })
        .from(userVideoStats)
        .where(eq(userVideoStats.username, username))
        .all()
      totalVideos = row?.count ?? 0
    }

    // Parse the concatenated videoUrls back into arrays
    const wordData = wordRows.map(w => {
      let urls: string[] = []
      try {
        // GROUP_CONCAT produces: ["url1","url2","url3"] but with possible quotes
        const raw = w.videoUrls as string
        // Split the inner content and dedupe
        const inner = raw.replace(/^\[/, "").replace(/\]$/, "")
        urls = inner
          ? Array.from(new Set(inner.split(",").map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean)))
          : []
      } catch {}
      return {
        text: w.text,
        date: w.date,
        username: w.username,
        videoUrls: urls,
        timesWatched: w.timesWatched,
        timesSeen: w.timesSeen,
      }
    })

    const response: WordsResponse = {
      videoMetrics: { totalVideos },
      wordData,
    }

    return Response.json(response, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
