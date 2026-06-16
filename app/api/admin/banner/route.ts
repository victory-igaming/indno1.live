import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 1. GET banners
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const liveOnly = searchParams.get("live") === "true";

    let query = `
      SELECT id, title, position, image_url, target_url, scheduled_at, is_live, is_active, ad_active, created_at
      FROM banner
      WHERE is_active = TRUE
    `;

    const params: any[] = [];

    if (liveOnly) {
      query += ` AND is_live = $1`;
      params.push(true);
    }

    query += ` ORDER BY is_live DESC, created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    return NextResponse.json({ banner: result.rows });
  } catch (error) {
    console.error("Failed to fetch banner:", error);
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

// 2. POST create banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      position,
      image_url,
      target_url,
      scheduled_at,
      is_live,
      ad_active,
    } = body;

    const query = `
      INSERT INTO banner 
      (title, position, image_url, target_url, scheduled_at, is_live, is_active, ad_active)
      VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
      RETURNING *;
    `;

    const values = [
      title,
      position,
      image_url || null,
      target_url || null,
      scheduled_at || null,
      is_live ?? true,
      ad_active ?? true,
    ];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create banner:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}

// 3. PUT update banner
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      title,
      position,
      image_url,
      target_url,
      scheduled_at,
      is_live,
      is_active,
      ad_active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

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
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Banner item not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update banner:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

// 4. DELETE banner
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const query = `DELETE FROM banner WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Banner item not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Deleted successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Failed to delete banner:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}