import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, videos, words, userVideoStats } from "@/lib/db"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function POST() {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    await db.delete(userVideoStats)
    await db.delete(words)
    await db.delete(videos)
    return Response.json({ ok: true }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
