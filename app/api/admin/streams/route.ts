import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const ALLOWED_SPORTS = ["cricket", "football", "basketball", "tennis", "other"];

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport");

    let query = `SELECT id, title, sport_type, youtube_url, team1, team2, scheduled_at, is_live, is_active, created_at
                 FROM streams`;
    const params: string[] = [];
    if (sport && ALLOWED_SPORTS.includes(sport)) {
      query += " WHERE sport_type = $1";
      params.push(sport);
    }
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    return NextResponse.json({ streams: result.rows });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, sport_type, youtube_url, team1, team2, scheduled_at, is_live } = body;

    if (!title || !sport_type || !youtube_url) {
      return NextResponse.json({ error: "title, sport_type and youtube_url are required" }, { status: 400 });
    }
    if (!ALLOWED_SPORTS.includes(sport_type)) {
      return NextResponse.json({ error: "Invalid sport type" }, { status: 400 });
    }
    if (typeof title !== "string" || title.length > 255) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    try { new URL(youtube_url); } catch {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }
    if (!youtube_url.includes("youtube.com") && !youtube_url.includes("youtu.be")) {
      return NextResponse.json({ error: "URL must be a YouTube URL" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO streams (title, sport_type, youtube_url, team1, team2, scheduled_at, is_live)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, sport_type, youtube_url, team1, team2, scheduled_at, is_live`,
      [
        title.trim(),
        sport_type,
        youtube_url.trim(),
        team1?.trim() || null,
        team2?.trim() || null,
        scheduled_at || null,
        !!is_live,
      ]
    );

    return NextResponse.json({ stream: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
