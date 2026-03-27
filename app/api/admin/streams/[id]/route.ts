import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const ALLOWED_SPORTS = ["cricket", "football", "basketball", "tennis", "other"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const streamId = parseInt(id, 10);
    if (isNaN(streamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const { title, sport_type, youtube_url, team1, team2, scheduled_at, is_live, is_active } = body;

    if (sport_type && !ALLOWED_SPORTS.includes(sport_type)) {
      return NextResponse.json({ error: "Invalid sport type" }, { status: 400 });
    }
    if (youtube_url) {
      try { new URL(youtube_url); } catch {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      }
      if (!youtube_url.includes("youtube.com") && !youtube_url.includes("youtu.be")) {
        return NextResponse.json({ error: "URL must be a YouTube URL" }, { status: 400 });
      }
    }

    const result = await pool.query(
      `UPDATE streams SET
        title = COALESCE($1, title),
        sport_type = COALESCE($2, sport_type),
        youtube_url = COALESCE($3, youtube_url),
        team1 = COALESCE($4, team1),
        team2 = COALESCE($5, team2),
        scheduled_at = COALESCE($6, scheduled_at),
        is_live = COALESCE($7, is_live),
        is_active = COALESCE($8, is_active),
        updated_at = NOW()
       WHERE id = $9
       RETURNING id, title, sport_type, youtube_url, team1, team2, scheduled_at, is_live, is_active`,
      [
        title?.trim() || null,
        sport_type || null,
        youtube_url?.trim() || null,
        team1 !== undefined ? (team1?.trim() || null) : undefined,
        team2 !== undefined ? (team2?.trim() || null) : undefined,
        scheduled_at !== undefined ? scheduled_at || null : undefined,
        is_live !== undefined ? !!is_live : null,
        is_active !== undefined ? !!is_active : null,
        streamId,
      ]
    );

    if (!result.rows[0]) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    return NextResponse.json({ stream: result.rows[0] });
  } catch {
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
