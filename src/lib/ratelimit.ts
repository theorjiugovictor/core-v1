import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

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
