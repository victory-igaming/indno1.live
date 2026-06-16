import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);

    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await pool.query("SELECT * FROM banner WHERE id = $1", [
      bannerId,
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner: result.rows[0] });
  } catch (error) {
    console.error("GET banner error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);

    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const {
      title,
      position,
      image_url,
      target_url,
      scheduled_at,
      is_live,
      is_active,
      ad_active,
    } = body;

    const query = `
      UPDATE banner
      SET 
        title = $1,
        position = $2,
        image_url = $3,
        target_url = $4,
        scheduled_at = $5,
        is_live = $6,
        is_active = $7,
        ad_active = $8
      WHERE id = $9
      RETURNING *;
    `;

    const values = [
      title,
      position,
      image_url || null,
      target_url || null,
      scheduled_at || null,
      is_live ?? true,
      is_active ?? true,
      ad_active ?? true,
      bannerId,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("PUT banner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);

    if (isNaN(bannerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await pool.query("DELETE FROM banner WHERE id = $1", [
      bannerId,
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE banner error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}