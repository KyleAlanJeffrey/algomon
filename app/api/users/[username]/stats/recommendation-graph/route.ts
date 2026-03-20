import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, videoRecommendations, videos } from "@/lib/db"
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
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { env } = getCloudflareContext()
    const db = getDb(env.DB)
    const url = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "100"), 10), 500)

    const edges = await db
      .select({
        source: videoRecommendations.fromVideoUrl,
        target: videoRecommendations.recommendedVideoUrl,
        timesSeen: sql<number>`SUM(${videoRecommendations.timesSeen})`,
      })
      .from(videoRecommendations)
      .where(eq(videoRecommendations.username, username))
      .groupBy(videoRecommendations.fromVideoUrl, videoRecommendations.recommendedVideoUrl)
      .orderBy(sql`SUM(${videoRecommendations.timesSeen}) DESC`)
      .limit(limit)
      .all()

    // Collect all unique URLs from edges
    const urlSet = new Set<string>()
    for (const e of edges) {
      urlSet.add(e.source)
      urlSet.add(e.target)
    }

    if (urlSet.size === 0) {
      return Response.json({ nodes: [], edges: [] }, { headers: CORS })
    }

    // Fetch video metadata for all nodes
    const allUrls = Array.from(urlSet)
    const videoRows = await db
      .select({
        url: videos.url,
        title: videos.title,
        channelName: videos.channelName,
        timesSeen: videos.timesSeen,
        timesWatched: videos.timesWatched,
      })
      .from(videos)
      .where(eq(videos.username, username))
      .all()

    const videoMap = new Map(videoRows.map(v => [v.url, v]))

    const nodes = allUrls.map(url => {
      const v = videoMap.get(url)
      return {
        id: url,
        title: v?.title ?? url,
        channelName: v?.channelName ?? null,
        timesSeen: v?.timesSeen ?? 0,
        timesWatched: v?.timesWatched ?? 0,
      }
    })

    return Response.json({ nodes, edges }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
