import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const ALLOWED_SPORTS = ["cricket", "football", "basketball", "tennis", "other"];


export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const streamId = parseInt(id, 10);
    if (isNaN(streamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const result = await pool.query("SELECT * FROM banner WHERE id = $1", [streamId]);
    //const result = await pool.query(query, params);
    //return NextResponse.json(result.rows);
    return NextResponse.json({ banner: result.rows });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// 2. PUT - Update news item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, position, image_url, target_url, scheduled_at, is_live, is_active, ad_active } = body;

    const query = `
      UPDATE banner 
      SET title = $1, position = $2  , image_url = $3 , target_url = $4 , scheduled_at = $5, is_live = $6, is_active = $7, ad_active = $8
      WHERE id = $9
      RETURNING *;
    `;

    const values = [
      title,
      position,
      image_url,
      target_url,
      scheduled_at || null,
      !!is_live,
      !!is_active,
      !!ad_active,     
      id
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const streamId = parseInt(id, 10);
    if (isNaN(streamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await pool.query("DELETE FROM banner WHERE id = $1", [streamId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
