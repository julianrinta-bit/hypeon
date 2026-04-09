/**
 * GET /api/track/open?id=meetkevin&c=audit-v2
 *
 * Email open tracking pixel endpoint.
 * Persists to Supabase email_tracking_events table, returns a 1x1 transparent PNG.
 *
 * Query params:
 *   id — prospect identifier (handle or email hash)
 *   c  — campaign identifier (e.g. "audit-v2", "followup-1")
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1x1 transparent PNG (68 bytes)
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "unknown";
  const campaign = request.nextUrl.searchParams.get("c") ?? "unknown";
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";

  // Persist to Supabase (fire and forget — don't block the pixel response)
  supabase
    .from("email_tracking_events")
    .insert({
      event_type: "open",
      prospect_id: id,
      campaign,
      ip_address: ip,
      user_agent: ua.slice(0, 200),
    })
    .then(({ error }) => {
      if (error) console.error("[track/open] Supabase insert failed:", error.message);
    });

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
