import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const streamId = parseInt(id, 10);
    if (isNaN(streamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const result = await pool.query(
      `SELECT id, type, image_url, pos_x, pos_y, width, height, opacity, ad_duration, is_active, display_order
       FROM overlays WHERE stream_id = $1 ORDER BY display_order ASC, id ASC`,
      [streamId]
    );

    return NextResponse.json({ overlays: result.rows });
  } catch (err) {
    console.error("[GET /api/admin/streams/[id]/overlays] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
