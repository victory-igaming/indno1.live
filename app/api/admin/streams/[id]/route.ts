import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const ALLOWED_SPORTS = ["cricket", "football", "basketball", "tennis", "other"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const streamId = parseInt(id, 10);

    if (isNaN(streamId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const {
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
    } = body;

    const finalSourceType =
      source_type === "obs" || source_type === "youtube"
        ? source_type
        : "youtube";

    if (!title || !sport_type) {
      return NextResponse.json(
        { error: "title and sport_type are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_SPORTS.includes(sport_type)) {
      return NextResponse.json(
        { error: "Invalid sport type" },
        { status: 400 }
      );
    }

    if (finalSourceType === "youtube") {
      if (!youtube_url) {
        return NextResponse.json(
          { error: "YouTube URL is required" },
          { status: 400 }
        );
      }

      try {
        new URL(youtube_url);
      } catch {
        return NextResponse.json(
          { error: "Invalid YouTube URL" },
          { status: 400 }
        );
      }

      if (!youtube_url.includes("youtube.com") && !youtube_url.includes("youtu.be")) {
        return NextResponse.json(
          { error: "URL must be a YouTube URL" },
          { status: 400 }
        );
      }
    }

    if (finalSourceType === "obs") {
      if (!obs_stream_url) {
        return NextResponse.json(
          { error: "OBS stream URL is required" },
          { status: 400 }
        );
      }

      try {
        new URL(obs_stream_url);
      } catch {
        return NextResponse.json(
          { error: "Invalid OBS stream URL" },
          { status: 400 }
        );
      }

      if (!obs_stream_url.includes(".m3u8")) {
        return NextResponse.json(
          { error: "OBS stream URL must be a .m3u8 URL" },
          { status: 400 }
        );
      }
    }

    console.log("ADMIN STREAM PUT BODY:", {
      streamId,
      source_type: finalSourceType,
      youtube_url,
      obs_stream_url,
    });

    const result = await pool.query(
      `
      UPDATE streams
      SET
        title = $1,
        sport_type = $2,
        source_type = $3,
        youtube_url = $4,
        obs_stream_url = $5,
        team1 = $6,
        team2 = $7,
        scheduled_at = $8,
        is_live = $9,
        is_active = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING
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
      `,
      [
        title.trim(),
        sport_type,
        finalSourceType,
        finalSourceType === "youtube" ? youtube_url : null,
        finalSourceType === "obs" ? obs_stream_url : null,
        team1 || null,
        team2 || null,
        scheduled_at || null,
        Boolean(is_live),
        is_active !== false,
        streamId,
      ]
    );

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    console.log("ADMIN STREAM UPDATED:", result.rows[0]);

    return NextResponse.json({ stream: result.rows[0] });
  } catch (error) {
    console.error("PUT admin stream error:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const streamId = parseInt(id, 10);
    if (isNaN(streamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await pool.query("DELETE FROM streams WHERE id = $1", [streamId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
