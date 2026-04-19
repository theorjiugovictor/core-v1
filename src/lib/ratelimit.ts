import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * AI command console — 20 requests per minute per user.
 * Prevents a single account from spamming Gemini/Bedrock.
 */
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:ai',
  analytics: true,
});

/**
 * Login endpoint — 5 attempts per 15 minutes per IP.
 * Prevents brute-force password attacks.
 */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'rl:auth',
  analytics: true,
});
