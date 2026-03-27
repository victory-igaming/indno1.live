import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const overlayId = parseInt(id, 10);
    if (isNaN(overlayId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const { image_url, pos_x, pos_y, width, height, opacity, ad_duration, is_active, display_order } = body;

    if (image_url) {
      try { new URL(image_url, "http://localhost"); } catch {
        return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
      }
    }

    const result = await pool.query(
      `UPDATE overlays SET
        image_url = COALESCE($1, image_url),
        pos_x = COALESCE($2, pos_x),
        pos_y = COALESCE($3, pos_y),
        width = COALESCE($4, width),
        height = COALESCE($5, height),
        opacity = COALESCE($6, opacity),
        ad_duration = COALESCE($7, ad_duration),
        is_active = COALESCE($8, is_active),
        display_order = COALESCE($9, display_order)
       WHERE id = $10 RETURNING *`,
      [
        image_url?.trim() || null,
        pos_x !== undefined ? parseFloat(pos_x) : null,
        pos_y !== undefined ? parseFloat(pos_y) : null,
        width ? Math.max(parseInt(width), 10) : null,
        height ? Math.max(parseInt(height), 10) : null,
        opacity !== undefined ? Math.min(Math.max(parseFloat(opacity), 0), 1) : null,
        ad_duration ? Math.min(Math.max(parseInt(ad_duration), 1), 300) : null,
        is_active !== undefined ? !!is_active : null,
        display_order !== undefined ? parseInt(display_order) : null,
        overlayId,
      ]
    );

    if (!result.rows[0]) return NextResponse.json({ error: "Overlay not found" }, { status: 404 });
    return NextResponse.json({ overlay: result.rows[0] });
  } catch (err) {
    console.error("[PUT /api/admin/overlays/[id]] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const overlayId = parseInt(id, 10);
    if (isNaN(overlayId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await pool.query("DELETE FROM overlays WHERE id = $1", [overlayId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
