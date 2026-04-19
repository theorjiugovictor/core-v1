import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { usersService } from '@/lib/firebase/users';
import { executeCommandForUser } from '@/lib/actions';
import { sendTelegramMessage } from '@/lib/messaging';
import type { BedrockMessage } from '@/lib/bedrock';

export const runtime = 'nodejs';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Keep last 20 turns (10 exchanges) per user, expire after 2 hours of inactivity
const HISTORY_KEY = (userId: string) => `tg:conv:${userId}`;
const MAX_TURNS = 20;
const TTL_SECONDS = 60 * 60 * 2;

async function loadHistory(userId: string): Promise<BedrockMessage[]> {
  try {
    const raw = await redis.get<BedrockMessage[]>(HISTORY_KEY(userId));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

async function saveHistory(userId: string, history: BedrockMessage[]) {
  try {
    const trimmed = history.slice(-MAX_TURNS);
    await redis.set(HISTORY_KEY(userId), trimmed, { ex: TTL_SECONDS });
  } catch {
    // Non-fatal — conversation just loses memory
  }
}

const UNLINKED_MESSAGE =
  "👋 Hi! I don't recognize your Telegram account yet.\n\nTo use CORE on Telegram:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter your Telegram ID: {telegramId}\n\nThen come back and try again!";

const SLASH_COMMANDS: Record<string, string> = {
  '/sales':    'show me my sales for today',
  '/stock':    'list my inventory',
  '/profit':   'what is my profit for today',
  '/lowstock': 'which items are low on stock',
};

export async function POST(request: Request) {
  try {
    const update = await request.json();

    const message = update?.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const telegramId: string = String(message.from.id);
    const text: string = message.text.trim();

    // /start — show onboarding (no auth needed)
    if (!text || text === '/start') {
      await sendTelegramMessage(chatId,
        `👋 Welcome to CORE!\n\nYour Telegram ID is: <b>${telegramId}</b>\n\nTo get started:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter your Telegram ID above\n\nThen come back and talk to me — record sales, check stock, ask about your business, anything.`,
        { parse_mode: 'HTML' }
      );
      return NextResponse.json({ ok: true });
    }

    // /help — static guide (no auth needed)
    if (text === '/help') {
      await sendTelegramMessage(chatId,
        `📋 <b>CORE Assistant</b>\n\nJust talk to me naturally:\n\n` +
        `<b>Record transactions</b>\n• "Sold 5 bags of rice at ₦2000 each"\n• "Add 10 tins of tomato at ₦500"\n• "Spent ₦3000 on transport"\n\n` +
        `<b>Check your business</b>\n• "How much did I make today?"\n• "What's my profit this week?"\n• "Which items are running low?"\n• "How many bags of flour do I have?"\n\n` +
        `<b>Quick shortcuts</b>\n/sales /stock /profit /lowstock`,
        { parse_mode: 'HTML' }
      );
      return NextResponse.json({ ok: true });
    }

    // Look up CORE user by Telegram ID
    const user = await usersService.getByTelegramId(telegramId);

    if (!user) {
      await sendTelegramMessage(chatId,
        UNLINKED_MESSAGE.replace('{telegramId}', telegramId)
      );
      return NextResponse.json({ ok: true });
    }

    // Map slash commands to natural language
    const input = SLASH_COMMANDS[text.toLowerCase()] ?? text;

    // Load conversation history from Redis
    const history = await loadHistory(user.id);

    // Process with full conversation context
    const result = await executeCommandForUser(user.id, input, history);

    const reply = result.success
      ? result.message || '✅ Done!'
      : `❌ ${result.error || 'Something went wrong. Please try again.'}`;

    // Persist updated history (append this exchange)
    if (result.success) {
      const updated: BedrockMessage[] = [
        ...history,
        { role: 'user', content: input },
        { role: 'assistant', content: reply },
      ];
      await saveHistory(user.id, updated);
    }

    await sendTelegramMessage(chatId, reply);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
