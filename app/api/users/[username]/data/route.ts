import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, videos, words, userVideoStats } from "@/lib/db"
import { eq } from "drizzle-orm"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    await db.delete(userVideoStats).where(eq(userVideoStats.username, username))
    await db.delete(words).where(eq(words.username, username))
    await db.delete(videos).where(eq(videos.username, username))
    return Response.json({ ok: true }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
