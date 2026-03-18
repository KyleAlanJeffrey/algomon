import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, videos, words, userVideoStats, users } from "@/lib/db"
import { extractWords, todayString } from "@/lib/words"
import { eq, and, sql } from "drizzle-orm"
import type { VideoPayload } from "@/lib/types"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Private-Network": "true",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext()
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

      // Upsert video (increment timesSeen on conflict)
      await db
        .insert(videos)
        .values({
          url: v.url,
          title: v.title,
          imageUrl: v.imageUrl ?? null,
          username: videoUsername,
          timesSeen: 1,
          timesWatched: 0,
        })
        .onConflictDoUpdate({
          target: videos.url,
          set: { timesSeen: sql`${videos.timesSeen} + 1` },
        })

      // Upsert userVideoStats
      const existingStat = await db
        .select()
        .from(userVideoStats)
        .where(
          and(
            eq(userVideoStats.username, videoUsername),
            eq(userVideoStats.date, date),
            eq(userVideoStats.videoUrl, v.url)
          )
        )
        .get()

      if (existingStat) {
        await db
          .update(userVideoStats)
          .set({ timesSeen: existingStat.timesSeen + 1 })
          .where(eq(userVideoStats.id, existingStat.id))
      } else {
        await db.insert(userVideoStats).values({
          username: videoUsername,
          date,
          videoUrl: v.url,
          timesSeen: 1,
          timesWatched: 0,
        })
      }

      // Extract words and upsert
      const wordTokens = extractWords(v.title)
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

    return Response.json({ ok: true }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    const results = date
      ? await db.select().from(videos).where(eq(videos.username, "default")).all()
      : await db.select().from(videos).all()

    return Response.json(results, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
