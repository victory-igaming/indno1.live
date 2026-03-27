import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport");
    const liveOnly = searchParams.get("live") === "true";

    let query = `
      SELECT id, title, sport_type, youtube_url, team1, team2,
             scheduled_at, is_live, ad_active, active_overlay_id, created_at
      FROM streams
      WHERE is_active = TRUE
    `;
    const params: (string | boolean)[] = [];
    let paramIdx = 1;

    if (sport && ["cricket", "football", "basketball", "tennis", "other"].includes(sport)) {
      query += ` AND sport_type = $${paramIdx++}`;
      params.push(sport);
    }

    if (liveOnly) {
      query += ` AND is_live = $${paramIdx++}`;
      params.push(true);
    }

    query += " ORDER BY is_live DESC, scheduled_at ASC LIMIT 50";

    const result = await pool.query(query, params);
    return NextResponse.json({ streams: result.rows });
  } catch {
    return NextResponse.json({ error: "Failed to fetch streams" }, { status: 500 });
  }
}
