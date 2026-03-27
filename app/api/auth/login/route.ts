import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {

  
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    if (username.length > 100 || password.length > 200) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const result = await pool.query(
      "SELECT id, username, password_hash FROM admin_users WHERE username = $1 LIMIT 1",
      [username.trim()]
    );

    const user = result.rows[0];
    if (!user) {
      await bcrypt.compare("dummy", "$2b$12$dummy.hash.to.prevent.timing.attacks.blah");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ id: user.id, username: user.username });

    const res = NextResponse.json({ success: true, username: user.username });
    res.cookies.set({ ...COOKIE_OPTIONS, value: token });
    return res;
  } catch (error: any){
   // return NextResponse.json({ error: "Server error" }, { status: 500 });
    // Check your VS Code terminal for this log!
    console.error("LOGIN_ROUTE_ERROR:", error); 
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}
