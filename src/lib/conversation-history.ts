import { Redis } from '@upstash/redis';
import type { BedrockMessage } from './bedrock';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_TURNS = 20;
const TTL_SECONDS = 60 * 60 * 2;

export function historyKey(channel: 'tg' | 'wa', userId: string) {
  return `${channel}:conv:${userId}`;
}

export async function loadHistory(key: string): Promise<BedrockMessage[]> {
  try {
    const raw = await redis.get<BedrockMessage[]>(key);
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export async function saveHistory(key: string, history: BedrockMessage[]) {
  try {
    const trimmed = history.slice(-MAX_TURNS);
    await redis.set(key, trimmed, { ex: TTL_SECONDS });
  } catch {
    // Non-fatal — conversation loses memory for this turn
  }
}
