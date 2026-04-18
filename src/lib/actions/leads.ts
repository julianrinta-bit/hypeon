'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { headers } from 'next/headers';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

const LeadSchema = z.object({
  service_interest: z.enum(['youtube', 'creative', 'products', 'unsure']),
  channel_url: z.string().url().optional().or(z.literal('')),
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').max(200),
  message: z.string().max(2000).optional().or(z.literal('')),
  honeypot: z.string().max(0).optional().or(z.literal('')),
});

// In-memory rate limit (resets on PM2 reload — acceptable for Phase 1)
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

export type LeadResult = { success: boolean; error?: string };

export async function submitLead(formData: FormData): Promise<LeadResult> {
  const raw = Object.fromEntries(formData);
  const parsed = LeadSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: 'Please check your input and try again.' };
  }

  // Honeypot check — return fake success for bots
  if (parsed.data.honeypot) {
    return { success: true };
  }

  // Rate limit by IP
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return { success: false, error: 'Too many submissions. Please try again later.' };
  }

  const { error } = await getSupabase().from('leads').insert({
    service_interest: parsed.data.service_interest,
    channel_url: parsed.data.channel_url || null,
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message || null,
    ip_address: ip !== 'unknown' ? ip : null,
  });

  if (error) {
    console.error('Lead insert error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}
