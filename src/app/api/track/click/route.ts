/**
 * GET /api/track/click?id=meetkevin&cta=cta2-realignment-plan&dest=/call
 *
 * Email CTA click tracking endpoint.
 * Persists to Supabase email_tracking_events table, then redirects.
 *
 * Query params:
 *   id   — prospect identifier
 *   cta  — CTA identifier (matches utm_content value)
 *   dest — destination path (default: /call)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "unknown";
  const cta = request.nextUrl.searchParams.get("cta") ?? "unknown";
  const dest = request.nextUrl.searchParams.get("dest") ?? "/call";
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";

  // Persist to Supabase (await this one — redirect can wait 50ms)
  await supabase
    .from("email_tracking_events")
    .insert({
      event_type: "click",
      prospect_id: id,
      campaign: "audit",
      cta,
      ip_address: ip,
      user_agent: ua.slice(0, 200),
    })
    .then(({ error }) => {
      if (error) console.error("[track/click] Supabase insert failed:", error.message);
    });

  // Build the redirect URL with UTM params preserved
  const redirectUrl = new URL(dest, request.nextUrl.origin);
  redirectUrl.searchParams.set("utm_source", "audit");
  redirectUrl.searchParams.set("utm_medium", "email");
  redirectUrl.searchParams.set("utm_campaign", id);
  redirectUrl.searchParams.set("utm_content", cta);

  return NextResponse.redirect(redirectUrl.toString(), 302);
}
