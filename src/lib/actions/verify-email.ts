'use server';

import { checkRateLimit } from '@/lib/rate-limit';

// ── In-memory code store ─────────────────────────────────────────────────────
// Server restart clears codes — acceptable for short-lived OTPs.

type CodeEntry = {
  code: string;
  expiresAt: number;
  attempts: number;
};

const codeStore = new Map<string, CodeEntry>();

// Purge expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of codeStore) {
    if (entry.expiresAt < now) codeStore.delete(email);
  }
}, 900_000);

// ── sendVerificationCode ─────────────────────────────────────────────────────

export async function sendVerificationCode(
  email: string
): Promise<{ success: true } | { error: string }> {
  // 1. Basic email validation
  if (!email || !email.includes('@') || email.length > 200) {
    return { error: 'Invalid email address.' };
  }

  // 2. Rate limit: 3 codes per email per hour
  const rateKey = `code:${email.toLowerCase()}`;
  const rateCheck = checkRateLimit(rateKey, { maxRequests: 3, windowMs: 3_600_000 });
  if (!rateCheck.allowed) {
    const mins = Math.ceil(rateCheck.retryAfterMs / 60_000);
    return { error: `Too many code requests. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` };
  }

  // 3. Generate 6-digit code
  const code = String(Math.floor(100_000 + Math.random() * 900_000));

  // 4. Store with 10-minute expiry
  codeStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 10 * 60_000,
    attempts: 0,
  });

  // 5. Send via Resend (or log in development)
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Development fallback
    console.log(`[verify-email] Code for ${email}: ${code}`);
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Hype On Media <noreply@hypeon.media>',
        to: [email],
        subject: `Your verification code: ${code}`,
        text: [
          `Enter this code to start your channel audit: ${code}`,
          '',
          'This code expires in 10 minutes.',
          '',
          'If you did not request this, you can ignore this email.',
          '',
          '— Hype On Media',
        ].join('\n'),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      console.error('[verify-email] Resend error:', body);
      return { error: 'Failed to send verification email. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[verify-email] Network error:', err);
    return { error: 'Failed to send verification email. Please try again.' };
  }
}

// ── verifyCode ───────────────────────────────────────────────────────────────

export async function verifyCode(
  email: string,
  code: string
): Promise<{ verified: true } | { verified: false; error: string }> {
  const key = email.toLowerCase();
  const entry = codeStore.get(key);

  if (!entry) {
    return { verified: false, error: 'No code found. Request a new one.' };
  }

  // Expired?
  if (Date.now() > entry.expiresAt) {
    codeStore.delete(key);
    return { verified: false, error: 'Code expired. Request a new one.' };
  }

  // Too many attempts?
  if (entry.attempts >= 5) {
    codeStore.delete(key);
    return { verified: false, error: 'Too many attempts. Request a new code.' };
  }

  // Wrong code?
  if (entry.code !== code.trim()) {
    entry.attempts++;
    const remaining = 5 - entry.attempts;
    return {
      verified: false,
      error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Valid — remove from store (one-time use)
  codeStore.delete(key);
  return { verified: true };
}
