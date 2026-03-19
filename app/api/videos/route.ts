import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, videos, words, userVideoStats, users } from "@/lib/db"
import { extractWords, todayString } from "@/lib/words"
import { eq, and, sql } from "drizzle-orm"
import type { VideoPayload } from "@/lib/types"


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

    for (const v of videoList) {
      if (!v.url || !v.title) continue
      const videoUsername = v.username ?? "default"
      const date = v.date ?? today

      const tags = v.tags ?? []

      const isWatched = !!v.watched
      const isWatchUpdate = !!v.watchUpdate
      const source = v.source ?? (isWatched || isWatchUpdate ? "watched" : "home")
      const watchSeconds = v.watchSeconds ?? 0

      // Upsert video
      const existing = await db.select().from(videos).where(eq(videos.url, v.url)).get()
      const mergedTags = existing
        ? JSON.stringify(Array.from(new Set([...JSON.parse(existing.tags), ...tags])))
        : JSON.stringify(tags)

      if (isWatchUpdate) {
        // Periodic update — only add watch seconds, don't touch timesWatched
        await db
          .insert(videos)
          .values({
            url: v.url,
            title: v.title,
            imageUrl: v.imageUrl ?? null,
            username: videoUsername,
            timesSeen: 0,
            timesWatched: 0,
            watchSeconds,
            tags: mergedTags,
          })
          .onConflictDoUpdate({
            target: videos.url,
            set: {
              watchSeconds: sql`${videos.watchSeconds} + ${watchSeconds}`,
              tags: mergedTags,
            },
          })
      } else if (isWatched) {
        await db
          .insert(videos)
          .values({
            url: v.url,
            title: v.title,
            imageUrl: v.imageUrl ?? null,
            username: videoUsername,
            timesSeen: 0,
            timesWatched: 1,
            watchSeconds,
            tags: mergedTags,
          })
          .onConflictDoUpdate({
            target: videos.url,
            set: {
              timesWatched: sql`${videos.timesWatched} + 1`,
              watchSeconds: sql`${videos.watchSeconds} + ${watchSeconds}`,
              tags: mergedTags,
            },
          })
      } else {
        await db
          .insert(videos)
          .values({
            url: v.url,
            title: v.title,
            imageUrl: v.imageUrl ?? null,
            username: videoUsername,
            timesSeen: 1,
            timesWatched: 0,
            watchSeconds: 0,
            tags: JSON.stringify(tags),
          })
          .onConflictDoUpdate({
            target: videos.url,
            set: { timesSeen: sql`${videos.timesSeen} + 1`, tags: mergedTags },
          })
      }

      // Upsert userVideoStats (keyed by username + date + videoUrl + source)
      const existingStat = await db
        .select()
        .from(userVideoStats)
        .where(
          and(
            eq(userVideoStats.username, videoUsername),
            eq(userVideoStats.date, date),
            eq(userVideoStats.videoUrl, v.url),
            eq(userVideoStats.source, source)
          )
        )
        .get()

      if (existingStat) {
        await db
          .update(userVideoStats)
          .set(
            isWatched
              ? { timesWatched: existingStat.timesWatched + 1, watchSeconds: existingStat.watchSeconds + watchSeconds }
              : isWatchUpdate
              ? { watchSeconds: existingStat.watchSeconds + watchSeconds }
              : { timesSeen: existingStat.timesSeen + 1 }
          )
          .where(eq(userVideoStats.id, existingStat.id))
      } else {
        await db.insert(userVideoStats).values({
          username: videoUsername,
          date,
          videoUrl: v.url,
          source,
          timesSeen: isWatched || isWatchUpdate ? 0 : 1,
          timesWatched: isWatched ? 1 : 0,
          watchSeconds: isWatched || isWatchUpdate ? watchSeconds : 0,
        })
      }

      // Extract words from title + tags and upsert
      const tagWords = tags.flatMap(t => extractWords(t))
      const wordTokens = Array.from(new Set([...extractWords(v.title), ...tagWords]))
      for (const token of wordTokens) {
        const existing = await db
          .select()
          .from(words)
          .where(
            and(
              eq(words.text, token),
              eq(words.date, date),
              eq(words.username, videoUsername)
            )
          )
          .get()

        if (existing) {
          const existingUrls: string[] = JSON.parse(existing.videoUrls)
          const updatedUrls = Array.from(new Set([...existingUrls, v.url]))
          await db
            .update(words)
            .set({
              timesSeen: existing.timesSeen + 1,
              videoUrls: JSON.stringify(updatedUrls),
            })
            .where(eq(words.id, existing.id))
        } else {
          await db.insert(words).values({
            text: token,
            date,
            username: videoUsername,
            videoUrls: JSON.stringify([v.url]),
            timesSeen: 1,
            timesWatched: 0,
          })
        }
      }
    }

    return Response.json({ ok: true }, { headers: corsHeaders(request) })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders(request) })
  }
}

