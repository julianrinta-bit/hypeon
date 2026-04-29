'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

// ── Device parsing ───────────────────────────────────────────────────────────

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ParsedDevice {
  device_type: DeviceType;
  os: string;
  browser: string;
}

function parseDevice(ua: string): ParsedDevice {
  // Device type
  let device_type: DeviceType = 'desktop';
  if (/Mobile|iPhone|Android.*Mobile/i.test(ua)) {
    device_type = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    device_type = 'tablet';
  }

  // OS
  let os = 'Unknown';
  if (/iPhone|iPad/.test(ua) || /CPU OS/.test(ua)) {
    const match = ua.match(/CPU(?: iPhone)? OS ([\d_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Android/.test(ua)) {
    const match = ua.match(/Android ([\d.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/Windows NT/.test(ua)) {
    const match = ua.match(/Windows NT ([\d.]+)/);
    const ntMap: Record<string, string> = {
      '10.0': 'Windows 11/10',
      '6.3': 'Windows 8.1',
      '6.2': 'Windows 8',
      '6.1': 'Windows 7',
    };
    os = match ? (ntMap[match[1]] ?? `Windows NT ${match[1]}`) : 'Windows';
  } else if (/Mac OS X/.test(ua)) {
    const match = ua.match(/Mac OS X ([\d_.]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // Browser (check Edge before Chrome — Edge UA contains "Chrome")
  let browser = 'Unknown';
  if (/Edg\/([\d.]+)/.test(ua)) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = match ? `Edge ${match[1]}` : 'Edge';
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = match ? `Firefox ${match[1]}` : 'Firefox';
  } else if (/Chrome\/([\d.]+)/.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = match ? `Chrome ${match[1]}` : 'Chrome';
  } else if (/Version\/([\d.]+).*Safari/.test(ua)) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = match ? `Safari ${match[1]}` : 'Safari';
  } else if (/Safari/.test(ua)) {
    browser = 'Safari';
  }

  return { device_type, os, browser };
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const CreateVisitorSessionSchema = z.object({
  visitor_id: z.string().min(1),
  utm_source: z.string().nullable().optional(),
  utm_medium: z.string().nullable().optional(),
  utm_campaign: z.string().nullable().optional(),
  utm_content: z.string().nullable().optional(),
  utm_term: z.string().nullable().optional(),
  fbclid: z.string().nullable().optional(),
  gclid: z.string().nullable().optional(),
  referrer: z.string().nullable().optional(),
  landing_page: z.string().min(1),
  screen_width: z.number().int().positive(),
  screen_height: z.number().int().positive(),
  language: z.string().min(1),
  timezone: z.string().min(1),
  is_returning: z.boolean(),
});

const UpdateSessionBehaviorSchema = z.object({
  session_id: z.string().uuid(),
  max_scroll_pct: z.number().min(0).max(100),
  time_on_site_s: z.number().min(0),
});

// ── Result types ─────────────────────────────────────────────────────────────

export type CreateVisitorSessionResult =
  | { session_id: string }
  | { error: string };

export type UpdateSessionBehaviorResult =
  | { success: true }
  | { error: string };

// ── createVisitorSession ─────────────────────────────────────────────────────

export async function createVisitorSession(
  clientData: z.input<typeof CreateVisitorSessionSchema>
): Promise<CreateVisitorSessionResult> {
  // 1. Validate client input
  const parsed = CreateVisitorSessionSchema.safeParse(clientData);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid session data' };
  }

  const data = parsed.data;

  // 2. Server-side enrichment — read headers (never trust client for these)
  const headersList = await headers();

  const country_code = headersList.get('x-vercel-ip-country') ?? null;
  const region = headersList.get('x-vercel-ip-country-region') ?? null;
  const city = headersList.get('x-vercel-ip-city') ?? null;

  const ua = headersList.get('user-agent') ?? '';
  const { device_type, os, browser } = parseDevice(ua);

  // 3. Insert visitor session row
  const { data: row, error: insertError } = await getSupabaseAdmin()
    .from('visitor_sessions')
    .insert({
      visitor_id: data.visitor_id,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      utm_content: data.utm_content ?? null,
      utm_term: data.utm_term ?? null,
      fbclid: data.fbclid ?? null,
      gclid: data.gclid ?? null,
      referrer: data.referrer ?? null,
      landing_page: data.landing_page,
      screen_width: data.screen_width,
      screen_height: data.screen_height,
      language: data.language,
      timezone: data.timezone,
      is_returning: data.is_returning,
      // Server-side enrichment
      country_code,
      region,
      city,
      device_type,
      os,
      browser,
    })
    .select('id')
    .single();

  if (insertError || !row) {
    console.error('visitor_sessions insert error:', insertError);
    return { error: 'Failed to create session' };
  }

  return { session_id: row.id };
}

// ── updateSessionBehavior ────────────────────────────────────────────────────

export async function updateSessionBehavior(
  data: z.input<typeof UpdateSessionBehaviorSchema>
): Promise<UpdateSessionBehaviorResult> {
  // 1. Validate input
  const parsed = UpdateSessionBehaviorSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid behavior data' };
  }

  const { session_id, max_scroll_pct, time_on_site_s } = parsed.data;

  // 2. Update the session row
  const { error: updateError } = await getSupabaseAdmin()
    .from('visitor_sessions')
    .update({
      max_scroll_pct,
      time_on_site_s,
    })
    .eq('id', session_id);

  if (updateError) {
    console.error('visitor_sessions update error:', updateError);
    return { error: 'Failed to update session behavior' };
  }

  return { success: true };
}
