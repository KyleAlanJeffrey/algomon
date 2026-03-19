import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, words } from "@/lib/db"
import { asc } from "drizzle-orm"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

// Top N words over time — returns { date, [word]: count } rows for a LineChart
export async function GET(request: Request) {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const { searchParams } = new URL(request.url)
    const topN = parseInt(searchParams.get("top") ?? "6")

    const allWords = await db.select().from(words).orderBy(asc(words.date)).all()

    // Aggregate total timesSeen per word to find the top N
    const totals = new Map<string, number>()
    for (const w of allWords) {
      totals.set(w.text, (totals.get(w.text) ?? 0) + w.timesSeen)
    }
    const topWords = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([text]) => text)

    // Build { date -> { word -> count } } map
    const byDate = new Map<string, Record<string, number>>()
    for (const w of allWords) {
      if (!topWords.includes(w.text)) continue
      if (!byDate.has(w.date)) byDate.set(w.date, {})
      const entry = byDate.get(w.date)!
      entry[w.text] = (entry[w.text] ?? 0) + w.timesSeen
    }

    const rows = Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({ date, ...counts }))

    return Response.json({ words: topWords, rows }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
