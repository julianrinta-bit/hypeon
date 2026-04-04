'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';
import { isValidPromoCode } from '@/config/promoCodes';
import { checkRateLimit } from '@/lib/rate-limit';

// ── Admin client (service role — bypasses RLS) ──────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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
  /** Honeypot field — must be empty; bots fill it automatically */
  website_url?: string;
}): Promise<AnalyzeResult> {
  // 0. Honeypot — bots fill hidden fields; silently accept and return fake success
  if (data.website_url) {
    return { success: true, publicId: 'blocked' };
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
  const validatedPromoCode = rawPromoCode && isValidPromoCode(rawPromoCode) ? rawPromoCode.toUpperCase().trim() : undefined;

  // 3. Find or create user (admin API — auto-confirmed, no verification email)
  //    Try to create first. If email already exists, look up the existing user.
  let userId: string;

  const password = randomBytes(32).toString('base64url');
  const { data: newUser, error: signupError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { name } : {},
  });

  if (newUser?.user) {
    userId = newUser.user.id;
  } else if (signupError?.message?.toLowerCase().includes('already')) {
    // User exists — find them via profiles table (mirrors auth.users)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

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
  const { data: activeJob } = await supabase
    .from('analysis_jobs')
    .select('public_id, status')
    .eq('user_id', userId)
    .not('status', 'in', '("complete","failed")')
    .maybeSingle();

  if (activeJob) {
    // Return existing job — don't create a duplicate
    return { success: true, publicId: activeJob.public_id };
  }

  // 5. Upsert channel placeholder (real data resolved during channel_ingesting stage)
  let channelId: string;

  const { data: existingChannel } = await supabase
    .from('channels')
    .select('id')
    .eq('youtube_channel_id', channelUrl)
    .maybeSingle();

  if (existingChannel) {
    channelId = existingChannel.id;
  } else {
    const { data: newChannel, error: channelError } = await supabase
      .from('channels')
      .insert({ youtube_channel_id: channelUrl, name: 'Pending resolution', is_verified: false })
      .select('id')
      .single();

    if (channelError || !newChannel) {
      console.error('Channel insert error:', channelError);
      return { success: false, error: 'Failed to initialize analysis. Please try again.' };
    }
    channelId = newChannel.id;
  }

  // 6. Link user to channel
  await supabase
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

  await supabase.from('profiles').update(profileUpdate).eq('id', userId);

  // 8. Create analysis job
  const jobPayload: Record<string, unknown> = { user_id: userId, channel_id: channelId, status: 'queued' };
  if (goal) jobPayload.goal = goal;
  if (validatedPromoCode) jobPayload.promo_code = validatedPromoCode;

  const { data: job, error: jobError } = await supabase
    .from('analysis_jobs')
    .insert(jobPayload)
    .select('id, public_id')
    .single();

  if (jobError || !job) {
    console.error('Job insert error:', jobError);
    return { success: false, error: 'Failed to queue analysis. Please try again.' };
  }

  // 9. Enqueue in pgmq (non-fatal — cron picks up DB rows anyway)
  const { error: enqueueError } = await supabase.rpc('pgmq_send', {
    queue_name: 'analysis_jobs',
    message: { job_id: job.id },
  });

  if (enqueueError) {
    console.warn('pgmq enqueue failed (cron will pick it up):', enqueueError);
  }

  // 10. Return public_id for redirect to waiting room
  return { success: true, publicId: job.public_id };
}
