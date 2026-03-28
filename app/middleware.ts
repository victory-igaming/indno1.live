import { NextRequest, NextResponse } from "next/server";

const BLOCKED_UA = [
  "bot",
  "crawler",
  "spider",
  "curl",
  "wget",
  "python",
  "node-fetch",
  "axios",
  "postman",
  "insomnia",
  "httpclient",
  "headless",
  "phantom",
  "puppeteer",
  "playwright",
  "GPTBot",
  "ClaudeBot",
  "Bytespider",
  "Amazonbot",
  "CCBot",
  "meta-externalagent"
];

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";

  // 🚫 Block empty UA
  if (!ua) return new NextResponse("Forbidden", { status: 403 });

  // 🚫 Block known bots
  const isBot = BLOCKED_UA.some(bot => ua.toLowerCase().includes(bot.toLowerCase()));
  if (isBot) return new NextResponse("Blocked", { status: 403 });

  // 🚫 Block non-browser requests
  const accept = req.headers.get("accept") || "";
  if (!accept.includes("text/html")) return new NextResponse("Blocked", { status: 403 });

  // 🚫 Block direct IP access
  const host = req.headers.get("host") || "";
  if (host.match(/\d+\.\d+\.\d+\.\d+/)) return new NextResponse("Blocked", { status: 403 });

  // ✅ Add strong noindex header
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  return res;
}

// Only run on all paths
export const config = {
  matcher: "/:path*",
};
