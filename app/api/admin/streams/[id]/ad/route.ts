import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const streamId = parseInt(id, 10);
    if (isNaN(streamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const { ad_active, active_overlay_id } = body;

    const result = await pool.query(
      `UPDATE streams SET
        ad_active = $1,
        active_overlay_id = $2,
        updated_at = NOW()
       WHERE id = $3
       RETURNING id, ad_active, active_overlay_id`,
      [!!ad_active, active_overlay_id || null, streamId]
    );

    if (!result.rows[0]) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    return NextResponse.json({ stream: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
