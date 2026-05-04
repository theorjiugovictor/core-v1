import { NextResponse } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { executeCommandForUser } from '@/lib/actions';
import { sendTelegramMessage } from '@/lib/messaging';
import { telemetry } from '@/lib/telemetry';
import { historyKey, loadHistory, saveHistory } from '@/lib/conversation-history';
import type { BedrockMessage } from '@/lib/bedrock';

export const runtime = 'nodejs';

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
      telemetry.error('Telegram message from unlinked account', undefined, {
        'event.name': 'telegram.unlinked_user',
        'telegram.id': telegramId,
        'telegram.chat_id': chatId,
      });
      await sendTelegramMessage(chatId,
        UNLINKED_MESSAGE.replace('{telegramId}', telegramId)
      );
      return NextResponse.json({ ok: true });
    }

    // Map slash commands to natural language
    const input = SLASH_COMMANDS[text.toLowerCase()] ?? text;

    // Load conversation history from Redis
    const key = historyKey('tg', user.id);
    const history = await loadHistory(key);

    // Process with full conversation context
    const result = await executeCommandForUser(user.id, input, history);

    const reply = result.success
      ? result.message || '✅ Done!'
      : `❌ ${result.error || 'Something went wrong. Please try again.'}`;

    if (!result.success) {
      telemetry.error('Telegram AI command failed', user.id, {
        'event.name': 'telegram.command_failed',
        'ai.input': input.slice(0, 200),
        'error.message': result.error || 'unknown',
      });
    }

    // Persist updated history (append this exchange)
    if (result.success) {
      const updated: BedrockMessage[] = [
        ...history,
        { role: 'user', content: input },
        { role: 'assistant', content: reply },
      ];
      await saveHistory(key, updated);
    }

    await sendTelegramMessage(chatId, reply);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    telemetry.error('Unhandled error in Telegram webhook', undefined, {
      'event.name': 'telegram.webhook_error',
      'error.message': error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: true });
  }
}
