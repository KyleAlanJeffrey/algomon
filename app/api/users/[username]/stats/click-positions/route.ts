import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb, clickEvents } from "@/lib/db"
import { eq, and, sql } from "drizzle-orm"

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
    const { env } = getCloudflareContext()
    const db = getDb(env.DB)

    const rows = await db
      .select({
        source: clickEvents.source,
        position: clickEvents.position,
        count: sql<number>`COUNT(*)`,
      })
      .from(clickEvents)
      .where(eq(clickEvents.username, username))
      .groupBy(clickEvents.source, clickEvents.position)
      .orderBy(clickEvents.source, clickEvents.position)
      .all()

    return Response.json(rows, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
