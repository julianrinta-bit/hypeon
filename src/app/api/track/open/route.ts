/**
 * GET /api/track/open?id=meetkevin&c=audit-v2
 *
 * Email open tracking pixel endpoint.
 * Logs the open event and returns a 1x1 transparent PNG.
 *
 * Query params:
 *   id — prospect identifier (handle or email hash)
 *   c  — campaign identifier (e.g. "audit-v2", "followup-1")
 */

import { NextRequest, NextResponse } from "next/server";

// 1x1 transparent PNG (68 bytes)
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "unknown";
  const campaign = request.nextUrl.searchParams.get("c") ?? "unknown";
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";

  // Log the open event
  // TODO: Replace with Supabase insert or SQLite write for production
  console.log(
    JSON.stringify({
      event: "email_open",
      prospect: id,
      campaign,
      ip,
      ua: ua.slice(0, 100),
      ts: new Date().toISOString(),
    }),
  );

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
