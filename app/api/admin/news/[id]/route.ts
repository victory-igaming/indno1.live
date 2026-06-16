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
    const newsId = parseInt(id, 10);

    if (isNaN(newsId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await pool.query("SELECT * FROM news WHERE id = $1", [newsId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json({ news: result.rows[0] });
  } catch (error) {
    console.error("GET news error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id, 10);

    if (isNaN(newsId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const {
      title,
      newsbf,
      scheduled_at,
      is_live,
      is_active,
      ad_active,
    } = body;

    const query = `
      UPDATE news
      SET 
        title = $1,
        newsbf = $2,
        scheduled_at = $3,
        is_live = $4,
        is_active = $5,
        ad_active = $6
      WHERE id = $7
      RETURNING *;
    `;

    const values = [
      title,
      newsbf,
      scheduled_at || null,
      is_live ?? true,
      is_active ?? true,
      ad_active ?? true,
      newsId,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("PUT news error:", error);
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
    const newsId = parseInt(id, 10);

    if (isNaN(newsId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await pool.query("DELETE FROM news WHERE id = $1", [newsId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE news error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}