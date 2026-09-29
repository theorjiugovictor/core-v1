import { Ratelimit } from '@upstash/ratelimit';
import { redis, isProduction } from './redis';

/**
 * Behaviour when Redis is unavailable:
 * - Not configured in production: fail CLOSED. Running without rate limits in
 *   production means unlimited AI spend and unlimited login attempts, so a
 *   missing env var should be loud, not silent.
 * - Not configured locally: allow (so `npm run dev` works without Upstash).
 * - Configured but erroring (transient outage): allow and log. Blocking every
 *   login during a short Upstash blip is worse than briefly losing limits.
 */
function createSafeLimiter(limiterConfig: {
  limiter: ReturnType<typeof Ratelimit.slidingWindow>;
  prefix: string;
  analytics?: boolean;
}) {
  const instance = redis
    ? new Ratelimit({
        redis,
        ...limiterConfig,
      })
    : null;

  return {
    async limit(key: string): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
      if (!instance) {
        if (isProduction) {
          console.error(
            `Rate limiter ${limiterConfig.prefix} has no Redis configured in production; denying request. ` +
            'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
          );
          return { success: false };
        }
        return { success: true };
      }
      try {
        return await instance.limit(key);
      } catch (error) {
        console.error(`Rate limiter error (${limiterConfig.prefix}):`, error);
        return { success: true };
      }
    },
  };
}

/**
 * AI command console — 20 requests per minute per user.
 * Prevents a single account from spamming Gemini/Bedrock.
 */
export const aiLimiter = createSafeLimiter({
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:ai',
  analytics: true,
});

/**
 * Login endpoint — 5 attempts per 15 minutes per IP.
 * Prevents brute-force password attacks.
 */
export const authLimiter = createSafeLimiter({
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'rl:auth',
  analytics: true,
});

/**
 * Per-email login limiter — 5 failures per 30 minutes per email address.
 * Catches credential stuffing that rotates IPs.
 */
export const emailAuthLimiter = createSafeLimiter({
  limiter: Ratelimit.slidingWindow(5, '30 m'),
  prefix: 'rl:auth:email',
  analytics: true,
});
