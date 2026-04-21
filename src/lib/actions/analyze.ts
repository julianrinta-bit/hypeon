'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';
import { validatePromoCode } from '@/lib/promo-codes';
import { checkRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase';

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
    ? await validatePromoCode(rawPromoCode, getSupabaseAdmin())
    : undefined;

  // 3. Find or create user (admin API — auto-confirmed, no verification email)
  //    Try to create first. If email already exists, look up the existing user.
  let userId: string;

  const password = randomBytes(32).toString('base64url');
  const { data: newUser, error: signupError } = await getSupabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { name } : {},
  });

  if (newUser?.user) {
    userId = newUser.user.id;
  } else if (signupError?.message?.toLowerCase().includes('already')) {
    // User exists — find them via profiles table (mirrors auth.users)
    const { data: existingProfile } = await getSupabaseAdmin()
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
  const { data: activeJob } = await getSupabaseAdmin()
    .from('analysis_jobs')
    .select('public_id, status')
    .eq('user_id', userId)
    .not('status', 'in', '("complete","failed")')
    .maybeSingle();

  if (activeJob) {
    // Return existing job — don't create a duplicate
    return { success: true, publicId: activeJob.public_id ?? '' };
  }

  // 5. Upsert channel placeholder (real data resolved during channel_ingesting stage)
  let channelId: string;

  const { data: existingChannel } = await getSupabaseAdmin()
    .from('channels')
    .select('id')
    .eq('youtube_channel_id', channelUrl)
    .maybeSingle();

  if (existingChannel) {
    channelId = existingChannel.id;
  } else {
    const { data: newChannel, error: channelInsertError } = await getSupabaseAdmin()
      .from('channels')
      .insert({ youtube_channel_id: channelUrl, name: 'Pending resolution', is_verified: false })
      .select('id')
      .single();

    if (channelInsertError || !newChannel) {
      console.error('Channel insert error:', channelInsertError);
      return { success: false, error: 'Failed to initialize analysis. Please try again.' };
    }
    channelId = newChannel.id;
  }

  // 6. Link user to channel
  await getSupabaseAdmin()
    .from('user_channels')
    .upsert(
      { user_id: userId, channel_id: channelId, is_active: true },
      { onConflict: 'user_id' }
    );

  // 7. Update profile with declared signals
  await getSupabaseAdmin()
    .from('profiles')
    .update({
      channel_url: channelUrl,
      last_active_at: new Date().toISOString(),
      ...(goal ? { goal } : {}),
      ...(publishing_frequency ? { publishing_frequency } : {}),
      ...(production_level ? { production_level } : {}),
      ...(region ? { region } : {}),
    })
    .eq('id', userId);

  // 8. Create analysis job
  const { data: job, error: jobInsertError } = await getSupabaseAdmin()
    .from('analysis_jobs')
    .insert({
      user_id: userId,
      channel_id: channelId,
      status: 'queued',
      goal: goal ?? 'audience',
      ...(validatedPromoCode ? { promo_code: validatedPromoCode } : {}),
    })
    .select('id, public_id')
    .single();

  if (jobInsertError || !job) {
    console.error('Job insert error:', jobInsertError);
    return { success: false, error: 'Failed to queue analysis. Please try again.' };
  }

  // 9. Enqueue in pgmq (non-fatal — cron picks up DB rows anyway)
  const { error: enqueueError } = await getSupabaseAdmin().rpc('pgmq_send', {
    queue_name: 'analysis_jobs',
    message: { job_id: job.id },
  });

  if (enqueueError) {
    console.warn('pgmq enqueue failed (cron will pick it up):', enqueueError);
  }

  // 10. Return public_id for redirect to waiting room
  return { success: true, publicId: job.public_id ?? '' };
}
