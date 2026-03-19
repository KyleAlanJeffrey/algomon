import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, userVideoStats } from "@/lib/db"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export async function GET() {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const stats = await db.select().from(userVideoStats).all()

    // For each date, collect unique video URLs
    const byDate = new Map<string, Set<string>>()
    for (const s of stats) {
      if (!byDate.has(s.date)) byDate.set(s.date, new Set())
      byDate.get(s.date)!.add(s.videoUrl)
    }

    // Group by day of week
    const byDay: Record<number, { totalVideos: number; days: Set<string> }> = {}
    for (let i = 0; i < 7; i++) byDay[i] = { totalVideos: 0, days: new Set() }

    for (const [date, urls] of byDate.entries()) {
      const dow = new Date(date + "T12:00:00").getDay() // noon to avoid DST edge cases
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
