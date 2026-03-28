import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Correct for Next.js 16
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const streamResult = await pool.query(
      `SELECT id, title, sport_type, youtube_url, team1, team2, scheduled_at, is_live, 
              ad_active, active_overlay_id 
       FROM streams WHERE id = $1 AND is_active = TRUE`,
      [id]
    );

    if (!streamResult.rows[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const overlaysResult = await pool.query(
      `SELECT id, type, image_url, pos_x, pos_y, width, height, opacity, ad_duration, display_order 
       FROM overlays WHERE stream_id = $1 AND is_active = TRUE ORDER BY display_order ASC`,
      [id]
    );

    return NextResponse.json({
      stream: streamResult.rows[0],
      overlays: overlaysResult.rows,
    });
  } catch (err) {
    console.error("Database Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stream" },
      { status: 500 }
    );
  }
}

