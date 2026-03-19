import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, videos, words, userVideoStats } from "@/lib/db"
import { eq } from "drizzle-orm"


const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { env } = getCloudflareContext()

    const apiKey = request.headers.get("X-API-Key")
    if (!apiKey || apiKey !== env.API_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS })
    }

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
