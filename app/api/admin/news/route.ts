import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 1. GET news
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const liveOnly = searchParams.get("live") === "true";

    let query = `
      SELECT id, title, newsbf, scheduled_at, is_live, is_active, ad_active, created_at
      FROM news
      WHERE is_active = TRUE
    `;

    const params: any[] = [];

    if (liveOnly) {
      query += ` AND is_live = $1`;
      params.push(true);
    }

    query += ` ORDER BY is_live DESC, created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    return NextResponse.json({ news: result.rows });
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

// 2. POST create news
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      newsbf,
      scheduled_at,
      is_live,
      ad_active,
    } = body;

    const query = `
      INSERT INTO news 
      (title, newsbf, scheduled_at, is_live, is_active, ad_active)
      VALUES ($1, $2, $3, $4, TRUE, $5)
      RETURNING *;
    `;

    const values = [
      title,
      newsbf,
      scheduled_at || null,
      is_live ?? true,
      ad_active ?? true,
    ];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create news:", error);
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}

// 3. PUT update news
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      title,
      newsbf,
      scheduled_at,
      is_live,
      is_active,
      ad_active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

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
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "News item not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update news:", error);
    return NextResponse.json({ error: "Failed to update news" }, { status: 500 });
  }
}

// 4. DELETE news
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const query = `DELETE FROM news WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "News item not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Deleted successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Failed to delete news:", error);
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 });
  }
}