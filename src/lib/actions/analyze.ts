'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';

// ── Admin client (service role — bypasses RLS) ──────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── pgmq client (separate schema) ──────────────────────────────────────────

const pgmq = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: 'pgmq_public' }, auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Schema ──────────────────────────────────────────────────────────────────

const AnalyzeSchema = z.object({
  channel_url: z.string().min(1, 'Channel URL is required').refine(
    (url) =>
      url.startsWith('@') ||
      /youtube\.com\/(channel\/|c\/|@|user\/)/.test(url) ||
      /youtube\.com\/@/.test(url),
    { message: 'Must be a valid YouTube channel URL or @handle' }
  ),
  goal: z.enum(['leads', 'audience', 'authority', 'revenue', 'brand']),
  publishing_frequency: z.enum(['rare', 'monthly', 'weekly', 'daily']).optional(),
  production_level: z.enum(['phone', 'decent', 'pro', 'full']).optional(),
  region: z.enum(['mena', 'europe', 'na', 'latam', 'south_asia', 'apac_south', 'east_asia', 'africa']).optional(),
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').max(200),
});

// ── Rate limiter ────────────────────────────────────────────────────────────

const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

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
  goal: string;
  publishing_frequency?: string;
  production_level?: string;
  region?: string;
  name: string;
  email: string;
}): Promise<AnalyzeResult> {
  // 1. Validate
  const parsed = AnalyzeSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError || 'Invalid input' };
  }

  // 2. Rate limit
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return { success: false, error: 'Too many submissions. Please try again later.' };
  }

  const { channel_url: rawUrl, goal, publishing_frequency, production_level, region, name, email } = parsed.data;
  const channelUrl = normalizeChannelUrl(rawUrl);

  // 3. Find or create user (admin API — auto-confirmed, no verification email)
  //    Try to create first. If email already exists, look up the existing user.
  let userId: string;

  const password = randomBytes(32).toString('base64url');
  const { data: newUser, error: signupError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
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
    goal,
    channel_url: channelUrl,
    last_active_at: new Date().toISOString(),
  };
  if (publishing_frequency) profileUpdate.publishing_frequency = publishing_frequency;
  if (production_level) profileUpdate.production_level = production_level;
  if (region) profileUpdate.region = region;

  await supabase.from('profiles').update(profileUpdate).eq('id', userId);

  // 8. Create analysis job
  const { data: job, error: jobError } = await supabase
    .from('analysis_jobs')
    .insert({ user_id: userId, channel_id: channelId, goal, status: 'queued' })
    .select('id, public_id')
    .single();

  if (jobError || !job) {
    console.error('Job insert error:', jobError);
    return { success: false, error: 'Failed to queue analysis. Please try again.' };
  }

  // 9. Enqueue in pgmq (non-fatal — cron picks up DB rows anyway)
  const { error: enqueueError } = await pgmq.rpc('send', {
    queue_name: 'analysis_jobs',
    message: { job_id: job.id },
  });

  if (enqueueError) {
    console.warn('pgmq enqueue failed (cron will pick it up):', enqueueError);
  }

  // 10. Return public_id for redirect to waiting room
  return { success: true, publicId: job.public_id };
}
