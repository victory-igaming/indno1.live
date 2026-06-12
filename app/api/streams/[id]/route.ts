import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const streamId = Number(id);

    if (!streamId || Number.isNaN(streamId)) {
      return NextResponse.json(
        { error: "Invalid stream ID" },
        { status: 400 }
      );
    }

    const streamRes = await pool.query(
      `
      SELECT
        id,
        title,
        sport_type,
        source_type,
        youtube_url,
        obs_stream_url,
        team1,
        team2,
        scheduled_at,
        is_live,
        is_active,
        ad_active,
        active_overlay_id,
        created_at,
        updated_at
      FROM streams
      WHERE id = $1
      LIMIT 1
      `,
      [streamId]
    );

    if (streamRes.rowCount === 0) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    const overlaysRes = await pool.query(
      `
      SELECT
        id,
        type,
        image_url,
        pos_x,
        pos_y,
        width,
        height,
        opacity,
        ad_duration,
        display_order
      FROM overlays
      WHERE stream_id = $1
      AND is_active = true
      ORDER BY display_order ASC, id ASC
      `,
      [streamId]
    );

    return NextResponse.json({
      stream: streamRes.rows[0],
      overlays: overlaysRes.rows,
    });
  } catch (error) {
    console.error("GET public stream error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}