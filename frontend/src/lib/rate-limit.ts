/**
 * Minimal in-memory rate limiter. Per-instance only — on a multi-instance
 * deploy (e.g. Vercel scaling to N lambdas) this does not enforce a single
 * global cap, only a per-instance one. Good enough as a baseline against
 * casual scripted abuse; replace with a shared store (Upstash/Redis) if
 * you need a hard global limit.
 */

const buckets = new Map<string, { count: number; windowStart: number }>();

export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }
  bucket.count += 1;
  return bucket.count > maxAttempts;
}
