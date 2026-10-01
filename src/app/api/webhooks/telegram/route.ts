import { NextResponse, after } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { sendTelegramMessage } from '@/lib/messaging';
import { telemetry } from '@/lib/telemetry';
import { claimOnce } from '@/lib/redis';
import { verifyTelegramSecret } from '@/lib/webhook-security';
import { handleChannelMessage } from '@/lib/channel-messages';

export const runtime = 'nodejs';
// Processing (AI call + reply) runs in after(), inside this budget.
export const maxDuration = 60;

const DEDUPE_TTL_SECONDS = 60 * 60 * 24;

const UNLINKED_MESSAGE =
  "Hi! I don't recognize your Telegram account yet.\n\nTo use CORE on Telegram:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter your Telegram ID: {telegramId}\n\nThen come back and try again!";

const SLASH_COMMANDS: Record<string, string> = {
  '/sales':    'show me my sales for today',
  '/stock':    'list my inventory',
  '/profit':   'what is my profit for today',
  '/lowstock': 'which items are low on stock',
};

const WELCOME = (telegramId: string) =>
  `Welcome to CORE!\n\nYour Telegram ID is: <b>${telegramId}</b>\n\nTo get started:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter your Telegram ID above\n\nThen come back and talk to me — record sales, check stock, ask about your business, anything.`;

const HELP =
  `<b>CORE Assistant</b>\n\nJust talk to me naturally:\n\n` +
  `<b>Record transactions</b>\n• "Sold 5 bags of rice at ₦2000 each"\n• "Add 10 tins of tomato at ₦500"\n• "Spent ₦3000 on transport"\n\n` +
  `<b>Check your business</b>\n• "How much did I make today?"\n• "What's my profit this week?"\n• "Which items are running low?"\n• "How many bags of flour do I have?"\n\n` +
  `<b>Quick shortcuts</b>\n/sales /stock /profit /lowstock`;

export async function POST(request: Request) {
  // 1. Authenticate: Telegram echoes the secret_token we registered with setWebhook.
  if (!verifyTelegramSecret(request.headers.get('x-telegram-bot-api-secret-token'))) {
    telemetry.error('Rejected Telegram webhook with invalid secret', undefined, {
      'event.name': 'telegram.invalid_secret',
    });
    return new Response('Unauthorized', { status: 401 });
  }

  let update: any;
  try {
    update = await request.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const message = update?.message;
  const text: string = message?.text?.trim() ?? '';
  if (!text || typeof update?.update_id !== 'number') {
    return NextResponse.json({ ok: true });
  }

  // 2. Dedupe on update_id so a retry never records a sale twice.
  if (!(await claimOnce(`wh:tg:${update.update_id}`, DEDUPE_TTL_SECONDS))) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const chatId: number = message.chat.id;
  const telegramId = String(message.from.id);
  const send = (reply: string, opts?: { parse_mode?: 'HTML' }) =>
    sendTelegramMessage(chatId, reply, opts);

  // 3. Acknowledge immediately; do the slow work after the response is sent.
  after(async () => {
    try {
      if (text === '/start') return await send(WELCOME(telegramId), { parse_mode: 'HTML' });
      if (text === '/help') return await send(HELP, { parse_mode: 'HTML' });

      const user = await usersService.getByTelegramId(telegramId);
      if (!user) {
        telemetry.error('Telegram message from unlinked account', undefined, {
          'event.name': 'telegram.unlinked_user',
          'telegram.id': telegramId,
          'telegram.chat_id': chatId,
        });
        return await send(UNLINKED_MESSAGE.replace('{telegramId}', telegramId));
      }

      const input = SLASH_COMMANDS[text.toLowerCase()] ?? text;
      await handleChannelMessage({ channel: 'telegram', userId: user.id, input, send: (r) => send(r) });
    } catch (error) {
      console.error('Telegram processing failed:', error);
      telemetry.error('Unhandled error in Telegram webhook', undefined, {
        'event.name': 'telegram.webhook_error',
        'error.message': error instanceof Error ? error.message : String(error),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
