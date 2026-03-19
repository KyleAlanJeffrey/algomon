import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, videos } from "@/lib/db"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function GET() {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const allVideos = await db.select().from(videos).all()

    const tagCounts = new Map<string, number>()
    let untagged = 0

    for (const v of allVideos) {
      const tags: string[] = JSON.parse(v.tags ?? "[]")
      if (tags.length === 0) { untagged++; continue }
      for (const tag of tags) {
        const t = tag.toLowerCase().trim()
        if (t.length > 1) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
      }
    }

    const result = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag, count]) => ({ tag, count }))

    return Response.json({ tags: result, untagged, total: allVideos.length }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
