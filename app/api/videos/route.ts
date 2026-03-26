import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, videos, words, userVideoStats, users, videoRecommendations } from "@/lib/db"
import { extractWords, todayString } from "@/lib/words"
import { sql } from "drizzle-orm"
import type { VideoPayload } from "@/lib/types"

/** Strip YouTube tracking params so the same video always has one canonical URL */
function normalizeYouTubeUrl(raw: string): string {
  try {
    const u = new URL(raw)
    const v = u.searchParams.get("v")
    if (v) return `https://www.youtube.com/watch?v=${v}`
    const shortsMatch = u.pathname.match(/^\/shorts\/([^/]+)/)
    if (shortsMatch) return `https://www.youtube.com/shorts/${shortsMatch[1]}`
  } catch {}
  return raw
}

// sendBeacon includes credentials (cookies), so we must echo the specific
// origin rather than "*" — otherwise the preflight fails.
function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin") ?? "*"
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Private-Network": "true",
    "Vary": "Origin",
  }
}

export function OPTIONS(request: Request) {
  return new Response(null, { headers: corsHeaders(request) })
}

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext()
    // Accept key via header (fetch) or query param (sendBeacon)
    const apiKey =
      request.headers.get("X-API-Key") ||
      new URL(request.url).searchParams.get("key")
    if (!apiKey || apiKey !== env.API_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders(request) })
    }
    const db = getDb(env.DB)
    const body: VideoPayload[] = await request.json()
    const today = todayString()

    const videoList = Array.isArray(body) ? body : [body]

    // Upsert user
    const username = videoList[0]?.username ?? "default"
    const name = videoList[0]?.name ?? "Unknown"
    await db
      .insert(users)
      .values({ username, name })
      .onConflictDoNothing()

    // Build all statements, then execute via D1 batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statements: any[] = []

    for (const v of videoList) {
      if (!v.url || !v.title) continue
      v.url = normalizeYouTubeUrl(v.url)
      if (v.recommendedFrom) v.recommendedFrom = normalizeYouTubeUrl(v.recommendedFrom)
      const videoUsername = v.username ?? "default"
      const date = v.date ?? today

      const tags = v.tags ?? []
      const tagsJson = JSON.stringify(tags)

      const isWatched = !!v.watched
      const isWatchUpdate = !!v.watchUpdate
      const source = v.source ?? (isWatched || isWatchUpdate ? "watched" : "home")
      const watchSeconds = v.watchSeconds ?? 0
      const channelName = v.channelName ?? null
      const channelUrl = v.channelUrl ?? null
      const channelAvatarUrl = v.channelAvatarUrl ?? null

      // Update channel info only when the incoming value is non-null
      const channelSet = channelName
        ? { channelName: sql`${channelName}`, channelUrl: sql`${channelUrl}`, channelAvatarUrl: sql`${channelAvatarUrl}` }
        : { channelName: sql`COALESCE(${videos.channelName}, NULL)`, channelUrl: sql`COALESCE(${videos.channelUrl}, NULL)`, channelAvatarUrl: sql`COALESCE(${videos.channelAvatarUrl}, NULL)` }

      // Upsert video — use SQLite JSON functions to merge tags without a SELECT
      if (isWatchUpdate) {
        statements.push(
          db
            .insert(videos)
            .values({
              url: v.url,
              title: v.title,
              imageUrl: v.imageUrl ?? null,
              username: videoUsername,
              timesSeen: 0,
              timesWatched: 0,
              watchSeconds,
              tags: tagsJson,
              channelName,
              channelUrl,
              channelAvatarUrl,
            })
            .onConflictDoUpdate({
              target: videos.url,
              set: {
                watchSeconds: sql`${videos.watchSeconds} + ${watchSeconds}`,
                tags: sql`(SELECT json_group_array(DISTINCT value) FROM (SELECT value FROM json_each(${videos.tags}) UNION SELECT value FROM json_each(${tagsJson})))`,
                ...channelSet,
              },
            })
        )
      } else if (isWatched) {
        statements.push(
          db
            .insert(videos)
            .values({
              url: v.url,
              title: v.title,
              imageUrl: v.imageUrl ?? null,
              username: videoUsername,
              timesSeen: 0,
              timesWatched: 1,
              watchSeconds,
              tags: tagsJson,
              channelName,
              channelUrl,
              channelAvatarUrl,
            })
            .onConflictDoUpdate({
              target: videos.url,
              set: {
                timesWatched: sql`${videos.timesWatched} + 1`,
                watchSeconds: sql`${videos.watchSeconds} + ${watchSeconds}`,
                tags: sql`(SELECT json_group_array(DISTINCT value) FROM (SELECT value FROM json_each(${videos.tags}) UNION SELECT value FROM json_each(${tagsJson})))`,
                ...channelSet,
              },
            })
        )
      } else {
        statements.push(
          db
            .insert(videos)
            .values({
              url: v.url,
              title: v.title,
              imageUrl: v.imageUrl ?? null,
              username: videoUsername,
              timesSeen: 1,
              timesWatched: 0,
              watchSeconds: 0,
              tags: tagsJson,
              channelName,
              channelUrl,
              channelAvatarUrl,
            })
            .onConflictDoUpdate({
              target: videos.url,
              set: {
                timesSeen: sql`${videos.timesSeen} + 1`,
                tags: sql`(SELECT json_group_array(DISTINCT value) FROM (SELECT value FROM json_each(${videos.tags}) UNION SELECT value FROM json_each(${tagsJson})))`,
                ...channelSet,
              },
            })
        )
      }

      // Upsert userVideoStats — unique index allows ON CONFLICT, no SELECT needed
      statements.push(
        db
          .insert(userVideoStats)
          .values({
            username: videoUsername,
            date,
            videoUrl: v.url,
            source,
            timesSeen: isWatched || isWatchUpdate ? 0 : 1,
            timesWatched: isWatched ? 1 : 0,
            watchSeconds: isWatched || isWatchUpdate ? watchSeconds : 0,
          })
          .onConflictDoUpdate({
            target: [userVideoStats.username, userVideoStats.date, userVideoStats.videoUrl, userVideoStats.source],
            set: isWatched
              ? {
                  timesWatched: sql`${userVideoStats.timesWatched} + 1`,
                  watchSeconds: sql`${userVideoStats.watchSeconds} + ${watchSeconds}`,
                }
              : isWatchUpdate
              ? { watchSeconds: sql`${userVideoStats.watchSeconds} + ${watchSeconds}` }
              : { timesSeen: sql`${userVideoStats.timesSeen} + 1` },
          })
      )

      // Upsert sidebar recommendation edge (video B recommended from video A)
      if (v.recommendedFrom && source === "sidebar") {
        statements.push(
          db
            .insert(videoRecommendations)
            .values({
              recommendedVideoUrl: v.url,
              fromVideoUrl: v.recommendedFrom,
              username: videoUsername,
              date,
              timesSeen: 1,
            })
            .onConflictDoUpdate({
              target: [videoRecommendations.recommendedVideoUrl, videoRecommendations.fromVideoUrl, videoRecommendations.username, videoRecommendations.date],
              set: { timesSeen: sql`${videoRecommendations.timesSeen} + 1` },
            })
        )
      }

      // Upsert words — unique index allows ON CONFLICT, merge videoUrls via JSON
      const tagWords = tags.flatMap(t => extractWords(t))
      const wordTokens = Array.from(new Set([...extractWords(v.title), ...tagWords]))
      for (const token of wordTokens) {
        const urlJson = JSON.stringify([v.url])
        statements.push(
          db
            .insert(words)
            .values({
              text: token,
              date,
              username: videoUsername,
              videoUrls: urlJson,
              timesSeen: 1,
              timesWatched: 0,
            })
            .onConflictDoUpdate({
              target: [words.text, words.date, words.username],
              set: {
                timesSeen: sql`${words.timesSeen} + 1`,
                videoUrls: sql`(SELECT json_group_array(DISTINCT value) FROM (SELECT value FROM json_each(${words.videoUrls}) UNION SELECT value FROM json_each(${urlJson})))`,
              },
            })
        )
      }
    }

    // Execute all statements in a single D1 batch (one HTTP round trip)
    if (statements.length > 0) {
      await db.batch(statements as [typeof statements[0], ...typeof statements])
    }

    return Response.json({ ok: true }, { headers: corsHeaders(request) })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders(request) })
  }
}
