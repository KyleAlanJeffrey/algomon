import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, videos } from "@/lib/db"
import { eq } from "drizzle-orm"

export const runtime = "edge"

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
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const results = await db.select().from(videos).where(eq(videos.username, username)).all()
    return Response.json(results, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
