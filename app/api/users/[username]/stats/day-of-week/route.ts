import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, userVideoStats } from "@/lib/db"
import { eq } from "drizzle-orm"


const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { env } = getCloudflareContext()
    const db = getDb(env.DB)
    const stats = await db
      .select()
      .from(userVideoStats)
      .where(eq(userVideoStats.username, username))
      .all()

    const byDate = new Map<string, Set<string>>()
    for (const s of stats) {
      if (!byDate.has(s.date)) byDate.set(s.date, new Set())
      byDate.get(s.date)!.add(s.videoUrl)
    }

    const byDay: Record<number, { totalVideos: number; days: Set<string> }> = {}
    for (let i = 0; i < 7; i++) byDay[i] = { totalVideos: 0, days: new Set() }

    for (const [date, urls] of byDate.entries()) {
      const dow = new Date(date + "T12:00:00").getDay()
      byDay[dow].totalVideos += urls.size
      byDay[dow].days.add(date)
    }

    const result = DAY_NAMES.map((day, i) => ({
      day,
      avgVideos: byDay[i].days.size > 0
        ? Math.round(byDay[i].totalVideos / byDay[i].days.size)
        : 0,
      totalVideos: byDay[i].totalVideos,
      occurrences: byDay[i].days.size,
    }))

    return Response.json(result, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
