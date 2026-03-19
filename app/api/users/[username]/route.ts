import { getRequestContext } from "@cloudflare/next-on-pages"
import { getDb, users } from "@/lib/db"
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
    const user = await db.select().from(users).where(eq(users.username, username)).get()
    if (!user) return Response.json({ error: "Not found" }, { status: 404, headers: CORS })
    return Response.json(user, { headers: CORS })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
