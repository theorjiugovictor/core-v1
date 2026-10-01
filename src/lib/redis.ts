import { Redis } from '@upstash/redis';

// Single shared Upstash client. Null when the env vars are missing (local dev).
export const redis: Redis | null =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Claim a key exactly once (SET NX). Returns true if this caller won the claim,
 * false if someone already claimed it. Used to dedupe webhook retries and to
 * make sure a cron email goes out at most once per user per day.
 *
 * Without Redis (local dev) it always returns true. If Redis errors, it also
 * returns true: better to risk a rare duplicate than to drop a customer's
 * message on the floor. The error is logged so it shows up in monitoring.
 */
export async function claimOnce(key: string, ttlSeconds: number): Promise<boolean> {
  if (!redis) return true;
  try {
    const res = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
    return res === 'OK';
  } catch (error) {
    console.error(`claimOnce failed for ${key}:`, error);
    return true;
  }
}

/** Release a claim so the work can be retried (e.g. after a failed send). */
export async function releaseClaim(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`releaseClaim failed for ${key}:`, error);
  }
}
