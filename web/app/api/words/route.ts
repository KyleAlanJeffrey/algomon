import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, words, videos } from "@/lib/db"
import { desc } from "drizzle-orm"
import type { WordsResponse } from "@/lib/types"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Private-Network": "true",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const month = searchParams.get("month") // YYYY-MM
    const limit = parseInt(searchParams.get("limit") ?? "100")

    const allWords = await db.select().from(words).orderBy(desc(words.timesSeen)).all()

    const filtered = allWords
      .filter(w => {
        if (date) return w.date === date
        if (month) return w.date.startsWith(month)
        return true
      })
      .slice(0, limit)

    const totalVideos = await db.select().from(videos).all()

    const wordData = filtered.map(w => ({
      text: w.text,
      date: w.date,
      username: w.username,
      videoUrls: JSON.parse(w.videoUrls) as string[],
      timesWatched: w.timesWatched,
      timesSeen: w.timesSeen,
    }))

    const response: WordsResponse = {
      videoMetrics: { totalVideos: totalVideos.length },
      wordData,
    }

    return Response.json(response, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
