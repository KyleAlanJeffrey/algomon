import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, words } from "@/lib/db"
import { eq, asc } from "drizzle-orm"


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
    const allWords = await db
      .select()
      .from(words)
      .where(eq(words.username, username))
      .orderBy(asc(words.date))
      .all()

    const byDate = new Map<string, Set<string>>()
    for (const w of allWords) {
      if (!byDate.has(w.date)) byDate.set(w.date, new Set())
      const urls: string[] = JSON.parse(w.videoUrls)
      for (const url of urls) byDate.get(w.date)!.add(url)
    }

    const data = Array.from(byDate.entries())
      .map(([date, urls]) => ({ date, videos: urls.size }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return Response.json(data, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
