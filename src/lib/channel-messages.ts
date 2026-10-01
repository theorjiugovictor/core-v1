import 'server-only';
import type { BedrockMessage } from './bedrock';
import { executeCommandForUser } from './commands';
import { aiLimiter } from './ratelimit';
import { redis } from './redis';
import { telemetry } from './telemetry';

// Keep the last 20 turns (10 exchanges) per user; forget after 2 hours idle.
const MAX_TURNS = 20;
const TTL_SECONDS = 60 * 60 * 2;

async function loadHistory(key: string): Promise<BedrockMessage[]> {
  if (!redis) return [];
  try {
    const raw = await redis.get<BedrockMessage[]>(key);
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

async function saveHistory(key: string, history: BedrockMessage[]) {
  if (!redis) return;
  try {
    await redis.set(key, history.slice(-MAX_TURNS), { ex: TTL_SECONDS });
  } catch {
    // Non-fatal: the conversation just loses its memory.
  }
}

/**
 * Run one inbound chat message (WhatsApp or Telegram) for an already-verified,
 * already-linked user, and send the reply through `send`.
 *
 * Called from `after()` in the webhook routes, so it runs once the platform has
 * already received its 200 and will not retry.
 */
export async function handleChannelMessage(opts: {
  channel: 'whatsapp' | 'telegram';
  userId: string;
  input: string;
  send: (text: string) => Promise<void>;
}) {
  const { channel, userId, input, send } = opts;
  const historyKey = `${channel === 'whatsapp' ? 'wa' : 'tg'}:conv:${userId}`;

  try {
    // Same budget as the web console: one user can't run up the AI bill by
    // switching channels.
    const { success: withinLimit } = await aiLimiter.limit(userId);
    if (!withinLimit) {
      telemetry.rateLimitHit(userId, 'ai');
      await send("You're sending messages very quickly. Please wait a minute and try again.");
      return;
    }

    const history = await loadHistory(historyKey);
    const start = Date.now();
    const result = await executeCommandForUser(userId, input, history);

    const reply = result.success
      ? result.message || 'Done.'
      : result.error || 'Something went wrong. Please try again.';

    const action = Array.isArray((result as any).data) && (result as any).data[0]?.action
      ? (result as any).data[0].action
      : 'UNKNOWN';
    telemetry.aiCommand(userId, input, action, result.success, Date.now() - start);

    if (!result.success) {
      telemetry.error(`${channel} AI command failed`, userId, {
        'event.name': `${channel}.command_failed`,
        'ai.input': input.slice(0, 200),
        'error.message': result.error || 'unknown',
      });
    } else {
      await saveHistory(historyKey, [
        ...history,
        { role: 'user', content: input },
        { role: 'assistant', content: reply },
      ]);
    }

    await send(reply);
  } catch (error) {
    console.error(`${channel} message handling failed:`, error);
    telemetry.error(`Unhandled error processing ${channel} message`, userId, {
      'event.name': `${channel}.processing_error`,
      'error.message': error instanceof Error ? error.message : String(error),
    });
    try {
      await send('Something went wrong on our side. Please try again in a moment.');
    } catch {
      // Nothing more we can do.
    }
  }
}
