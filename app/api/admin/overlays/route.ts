import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const ALLOWED_TYPES = ["logo", "ad", "banner"];

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { stream_id, type, image_url, pos_x, pos_y, width, height, opacity, ad_duration, display_order } = body;

    if (!stream_id || !type || !image_url) {
      return NextResponse.json({ error: "stream_id, type, and image_url are required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid overlay type" }, { status: 400 });
    }
    try { new URL(image_url, "http://localhost"); } catch {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    const streamCheck = await pool.query("SELECT id FROM streams WHERE id = $1", [parseInt(stream_id, 10)]);
    if (!streamCheck.rows[0]) return NextResponse.json({ error: "Stream not found" }, { status: 404 });

    const result = await pool.query(
      `INSERT INTO overlays (stream_id, type, image_url, pos_x, pos_y, width, height, opacity, ad_duration, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
       RETURNING *`,
      [
        parseInt(stream_id, 10),
        type,
        image_url.trim(),
        parseFloat(pos_x) || 5,
        parseFloat(pos_y) || 5,
        Math.max(parseInt(width) || 120, 10),
        Math.max(parseInt(height) || 60, 10),
        Math.min(Math.max(parseFloat(opacity) || 0.9, 0), 1),
        Math.min(Math.max(parseInt(ad_duration) || 30, 1), 300),
        parseInt(display_order) || 0,
      ]
    );

    return NextResponse.json({ overlay: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/overlays] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
