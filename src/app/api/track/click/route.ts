/**
 * GET /api/track/click?id=meetkevin&cta=cta2-realignment-plan&dest=/call&eid=uuid
 *
 * Email CTA click tracking endpoint.
 * Writes to BOTH Supabase projects, then redirects.
 *
 * Query params:
 *   id   — prospect identifier
 *   cta  — CTA identifier
 *   dest — destination path (default: /call)
 *   eid  — prospector_emails.id (optional, for Units FK)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabaseHypeon = getSupabaseAdmin();

  const unitsUrl = process.env.UNITS_SUPABASE_URL;
  const unitsKey = process.env.UNITS_SUPABASE_SERVICE_KEY;
  // Units DB uses a different project — untyped client is acceptable here
  // since Units has its own schema and we're only writing a simple tracking row
  const supabaseUnits = unitsUrl && unitsKey ? createClient(unitsUrl, unitsKey) : null;

  const id = request.nextUrl.searchParams.get("id") ?? "unknown";
  const cta = request.nextUrl.searchParams.get("cta") ?? "unknown";
  const dest = request.nextUrl.searchParams.get("dest") ?? "/call";
  const emailId = request.nextUrl.searchParams.get("eid") ?? null;
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";

  const row = {
    event_type: "click",
    prospect_id: id,
    campaign: "audit",
    cta,
    email_id: emailId,
    ip_address: ip,
    user_agent: ua.slice(0, 200),
  };

  // Write to both — await at least one for reliability
  const writes = [
    supabaseHypeon.from("email_tracking_events").insert(row),
  ];

  if (supabaseUnits) {
    writes.push(
      supabaseUnits.from("email_tracking_events").insert({
        ...row,
        tenant_id: process.env.UNITS_TENANT_ID ?? null,
      }),
    );
  }

  await Promise.allSettled(writes);

  const redirectUrl = new URL(dest, request.nextUrl.origin);
  redirectUrl.searchParams.set("utm_source", "audit");
  redirectUrl.searchParams.set("utm_medium", "email");
  redirectUrl.searchParams.set("utm_campaign", id);
  redirectUrl.searchParams.set("utm_content", cta);

  return NextResponse.redirect(redirectUrl.toString(), 302);
}
