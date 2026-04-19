import { NextResponse } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { executeCommandForUser } from '@/lib/actions';
import { sendTelegramMessage } from '@/lib/messaging';

export const runtime = 'nodejs';

const UNLINKED_MESSAGE =
  "👋 Hi! I don't recognize your Telegram account yet.\n\nTo use CORE on Telegram:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter your Telegram ID: {telegramId}\n\nThen come back and try again!";

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Only handle regular text messages
    const message = update?.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const telegramId: string = String(message.from.id);
    const text: string = message.text.trim();

    if (!text || text === '/start') {
      await sendTelegramMessage(chatId,
        `👋 Welcome to CORE!\n\nYour Telegram ID is: <b>${telegramId}</b>\n\nTo get started:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter your Telegram ID above\n\nThen come back and send any command like:\n"Sold 10 bags of rice at ₦2000 each"`,
        { parse_mode: 'HTML' }
      );
      return NextResponse.json({ ok: true });
    }

    // Map slash commands to natural language so they go through the AI parser
    const commandMap: Record<string, string> = {
      '/sales':    'show me my sales for today',
      '/stock':    'list my inventory',
      '/profit':   'what is my profit for today',
      '/lowstock': 'which items are low on stock',
      '/help':     'HELP',
    };

    const mappedText = commandMap[text.toLowerCase()] ?? text;

    if (text === '/help') {
      await sendTelegramMessage(chatId,
        `📋 <b>CORE Commands</b>\n\nYou can type naturally or use shortcuts:\n\n` +
        `/sales — Today's sales\n/stock — Inventory list\n/profit — Today's profit\n/lowstock — Low stock alert\n\n` +
        `<b>Examples:</b>\n• "Sold 5 bags of rice at ₦2000 each"\n• "Add 10 tins of tomato at ₦500"\n• "Spent ₦3000 on transport"\n• "How many bags of flour do I have?"`
        , { parse_mode: 'HTML' }
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

    // Process the command using the shared executor
    const result = await executeCommandForUser(user.id, mappedText);

    const reply = result.success
      ? result.message || '✅ Done!'
      : `❌ ${result.error || 'Something went wrong. Please try again.'}`;

    await sendTelegramMessage(chatId, reply);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Always return 200 — Telegram will retry on non-200 responses
    return NextResponse.json({ ok: true });
  }
}
