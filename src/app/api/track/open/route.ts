/**
 * GET /api/track/open?id=meetkevin&c=audit-v2&eid=uuid
 *
 * Email open tracking pixel endpoint.
 * Writes to BOTH Supabase projects:
 *   1. Hypeon website (email_tracking_events — legacy)
 *   2. Units CRM (email_tracking_events — production, linked to prospector_emails)
 *
 * Query params:
 *   id  — prospect identifier (handle)
 *   c   — campaign identifier
 *   eid — prospector_emails.id (optional, for Units FK)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";

const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

export async function GET(request: NextRequest) {
  const supabaseHypeon = getSupabaseAdmin();

  const unitsUrl = process.env.UNITS_SUPABASE_URL;
  const unitsKey = process.env.UNITS_SUPABASE_SERVICE_KEY;
  const supabaseUnits = unitsUrl && unitsKey ? createClient(unitsUrl, unitsKey) : null;

  const id = request.nextUrl.searchParams.get("id") ?? "unknown";
  const campaign = request.nextUrl.searchParams.get("c") ?? "unknown";
  const emailId = request.nextUrl.searchParams.get("eid") ?? null;
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";

  const row = {
    event_type: "open",
    prospect_id: id,
    campaign,
    email_id: emailId,
    ip_address: ip,
    user_agent: ua.slice(0, 200),
  };

  // Fire-and-forget to both databases
  supabaseHypeon
    .from("email_tracking_events")
    .insert(row)
    .then(({ error }) => {
      if (error) console.error("[track/open] Hypeon insert failed:", error.message);
    });

  if (supabaseUnits) {
    supabaseUnits
      .from("email_tracking_events")
      .insert({ ...row, tenant_id: process.env.UNITS_TENANT_ID ?? null })
      .then(({ error }) => {
        if (error) console.error("[track/open] Units insert failed:", error.message);
      });
  }

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
