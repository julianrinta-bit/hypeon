'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';
import { validatePromoCode } from '@/lib/promo-codes';
import { checkRateLimit } from '@/lib/rate-limit';

// ── Admin client (service role — bypasses RLS) ──────────────────────────────
// Lazy getter: avoids top-level createClient() which fails during Vercel
// static analysis when env vars are not yet available at module evaluation time.

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabase;
}

// ── pgmq client (separate schema) ──────────────────────────────────────────

// pgmq wrappers are in public schema (pgmq_send, pgmq_read, pgmq_delete)

// ── Schema ──────────────────────────────────────────────────────────────────

const AnalyzeSchema = z.object({
  channel_url: z.string().min(1, 'Channel URL is required').refine(
    (url) =>
      url.startsWith('@') ||
      /youtube\.com\/(channel\/|c\/|@|user\/)/.test(url) ||
      /youtube\.com\/@/.test(url),
    { message: 'Must be a valid YouTube channel URL or @handle' }
  ),
  goal: z.enum(['leads', 'audience', 'authority', 'revenue', 'brand']).optional(),
  publishing_frequency: z.enum(['rare', 'monthly', 'weekly', 'daily']).optional(),
  production_level: z.enum(['phone', 'decent', 'pro', 'full']).optional(),
  region: z.enum(['mena', 'europe', 'na', 'latam', 'south_asia', 'apac_south', 'east_asia', 'africa']).optional(),
  name: z.string().max(200).optional(),
  email: z.string().email('Invalid email').max(200),
  promo_code: z.string().optional(),
});

// ── Normalize channel URL ───────────────────────────────────────────────────
// Ensure we always store a full URL, even if user pastes just @handle

function normalizeChannelUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('@')) {
    return `https://www.youtube.com/${trimmed}`;
  }
  if (!trimmed.startsWith('http')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

// ── Result type ─────────────────────────────────────────────────────────────

export type AnalyzeResult = {
  success: boolean;
  publicId?: string;
  error?: string;
};

// ── Main action ─────────────────────────────────────────────────────────────

export async function submitAnalysis(data: {
  channel_url: string;
  goal?: string;
  publishing_frequency?: string;
  production_level?: string;
  region?: string;
  name?: string;
  email: string;
  promo_code?: string;
  /**
   * Must be true — caller is responsible for verifying the email before
   * calling this action. If false, the submission is silently dropped.
   */
  verified?: boolean;
  /** Honeypot field — must be empty; bots fill it automatically */
  website_url?: string;
}): Promise<AnalyzeResult> {
  // 0. Honeypot — bots fill hidden fields; silently accept and return fake success
  if (data.website_url) {
    return { success: true, publicId: 'blocked' };
  }

  // 0b. Email must be verified via OTP before submission is processed
  if (!data.verified) {
    return { success: false, error: 'Email verification required.' };
  }

  // 1. Validate
  const parsed = AnalyzeSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError || 'Invalid input' };
  }

  // 2. Rate limit (5 submissions per IP per hour)
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown';
  const rateCheck = checkRateLimit(ip, { maxRequests: 5, windowMs: 3_600_000 });
  if (!rateCheck.allowed) {
    const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60_000);
    return { success: false, error: `Too many requests. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? '' : 's'}.` };
  }

  const { channel_url: rawUrl, goal, publishing_frequency, production_level, region, name, email, promo_code: rawPromoCode } = parsed.data;
  const channelUrl = normalizeChannelUrl(rawUrl);

  // Server-side re-validation of promo code (anti-tamper)
  // Checks local valid_promo_codes cache first, falls back to Units DB directly.
  const validatedPromoCode = rawPromoCode
    ? await validatePromoCode(rawPromoCode, getSupabase())
    : undefined;

  // 3. Find or create user (admin API — auto-confirmed, no verification email)
  //    Try to create first. If email already exists, look up the existing user.
  let userId: string;

  const password = randomBytes(32).toString('base64url');
  const { data: newUser, error: signupError } = await getSupabase().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { name } : {},
  });

  if (newUser?.user) {
    userId = newUser.user.id;
  } else if (signupError?.message?.toLowerCase().includes('already')) {
    // User exists — find them via profiles table (mirrors auth.users)
    const profileResult = await getSupabase()
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle() as unknown as { data: { id: string } | null; error: unknown };
    const existingProfile = profileResult.data;

    if (!existingProfile) {
      console.error('User exists in auth but not in profiles:', email);
      return { success: false, error: 'Account issue. Please contact support.' };
    }
    userId = existingProfile.id;
  } else {
    console.error('User creation error:', signupError);
    return { success: false, error: 'Failed to initialize. Please try again.' };
  }

  // 4. Check for existing active job (one per user)
  const activeJobResult = await getSupabase()
    .from('analysis_jobs')
    .select('public_id, status')
    .eq('user_id', userId)
    .not('status', 'in', '("complete","failed")')
    .maybeSingle() as unknown as { data: { public_id: string; status: string } | null; error: unknown };
  const activeJob = activeJobResult.data;

  if (activeJob) {
    // Return existing job — don't create a duplicate
    return { success: true, publicId: activeJob.public_id };
  }

  // 5. Upsert channel placeholder (real data resolved during channel_ingesting stage)
  let channelId: string;

  const existingChannelResult = await getSupabase()
    .from('channels')
    .select('id')
    .eq('youtube_channel_id', channelUrl)
    .maybeSingle() as unknown as { data: { id: string } | null; error: unknown };
  const existingChannel = existingChannelResult.data;

  if (existingChannel) {
    channelId = existingChannel.id;
  } else {
    const newChannelResult = await getSupabase()
      .from('channels')
      .insert({ youtube_channel_id: channelUrl, name: 'Pending resolution', is_verified: false })
      .select('id')
      .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

    if (newChannelResult.error || !newChannelResult.data) {
      console.error('Channel insert error:', newChannelResult.error);
      return { success: false, error: 'Failed to initialize analysis. Please try again.' };
    }
    channelId = newChannelResult.data.id;
  }

  // 6. Link user to channel
  await getSupabase()
    .from('user_channels')
    .upsert(
      { user_id: userId, channel_id: channelId, is_active: true },
      { onConflict: 'user_id' }
    );

  // 7. Update profile with declared signals
  const profileUpdate: Record<string, unknown> = {
    channel_url: channelUrl,
    last_active_at: new Date().toISOString(),
  };
  if (goal) profileUpdate.goal = goal;
  if (publishing_frequency) profileUpdate.publishing_frequency = publishing_frequency;
  if (production_level) profileUpdate.production_level = production_level;
  if (region) profileUpdate.region = region;

  await getSupabase().from('profiles').update(profileUpdate).eq('id', userId);

  // 8. Create analysis job
  const jobPayload: Record<string, unknown> = { user_id: userId, channel_id: channelId, status: 'queued' };
  if (goal) jobPayload.goal = goal;
  if (validatedPromoCode) jobPayload.promo_code = validatedPromoCode;

  const jobResult = await getSupabase()
    .from('analysis_jobs')
    .insert(jobPayload)
    .select('id, public_id')
    .single() as unknown as { data: { id: string; public_id: string } | null; error: { message: string } | null };

  if (jobResult.error || !jobResult.data) {
    console.error('Job insert error:', jobResult.error);
    return { success: false, error: 'Failed to queue analysis. Please try again.' };
  }

  const job = jobResult.data;

  // 9. Enqueue in pgmq (non-fatal — cron picks up DB rows anyway)
  const { error: enqueueError } = await getSupabase().rpc('pgmq_send', {
    queue_name: 'analysis_jobs',
    message: { job_id: job.id },
  });

  if (enqueueError) {
    console.warn('pgmq enqueue failed (cron will pick it up):', enqueueError);
  }

  // 10. Return public_id for redirect to waiting room
  return { success: true, publicId: job.public_id };
}
