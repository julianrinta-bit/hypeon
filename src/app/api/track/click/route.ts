/**
 * GET /api/track/click?id=meetkevin&cta=cta2-realignment-plan&dest=/call
 *
 * Email CTA click tracking endpoint.
 * Logs the click event and redirects to the destination.
 *
 * Query params:
 *   id   — prospect identifier
 *   cta  — CTA identifier (matches utm_content value)
 *   dest — destination path (default: /call)
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "unknown";
  const cta = request.nextUrl.searchParams.get("cta") ?? "unknown";
  const dest = request.nextUrl.searchParams.get("dest") ?? "/call";
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";

  // Log the click event
  // TODO: Replace with Supabase insert for production
  console.log(
    JSON.stringify({
      event: "email_click",
      prospect: id,
      cta,
      ip,
      ua: ua.slice(0, 100),
      ts: new Date().toISOString(),
    }),
  );

  // Build the redirect URL with UTM params preserved
  const redirectUrl = new URL(dest, request.nextUrl.origin);
  redirectUrl.searchParams.set("utm_source", "audit");
  redirectUrl.searchParams.set("utm_medium", "email");
  redirectUrl.searchParams.set("utm_campaign", id);
  redirectUrl.searchParams.set("utm_content", cta);

  return NextResponse.redirect(redirectUrl.toString(), 302);
}
