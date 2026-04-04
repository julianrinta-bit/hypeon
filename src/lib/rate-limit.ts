// ── In-memory rate limiter ──────────────────────────────────────────────────
// Uses a sliding-window algorithm: keeps timestamps of each request within the
// window rather than a fixed counter. Resets on server restart — acceptable
// for our scale (no Redis dependency required).

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

// Purge stale entries every 10 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => now - t < 3_600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 600_000);

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Check whether an IP is within the allowed rate limit window.
 *
 * @param ip          - Client IP address (use 'unknown' as fallback)
 * @param options     - maxRequests per windowMs (default: 5 per hour)
 * @returns           - { allowed, remaining, retryAfterMs }
 *
 * Side effect: records a new timestamp when allowed === true.
 */
export function checkRateLimit(
  ip: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 5, windowMs: 3_600_000 },
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip) ?? { timestamps: [] };

  // Slide the window — discard timestamps outside the current window
  entry.timestamps = entry.timestamps.filter(t => now - t < options.windowMs);

  if (entry.timestamps.length >= options.maxRequests) {
    // Oldest timestamp in the window determines when the slot opens up
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = options.windowMs - (now - oldestInWindow);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  // Record this request
  entry.timestamps.push(now);
  store.set(ip, entry);

  return {
    allowed: true,
    remaining: options.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}
