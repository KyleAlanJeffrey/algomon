import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, videos } from "@/lib/db"

export const runtime = "edge"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Private-Network": "true",
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function GET() {
  try {
    const { env } = getRequestContext()
    const db = getDb(env.DB)
    const all = await db.select().from(videos).all()
    return Response.json({ totalVideos: all.length }, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
