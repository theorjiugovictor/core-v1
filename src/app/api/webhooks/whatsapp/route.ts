import { NextResponse } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { executeCommandForUser } from '@/lib/actions';
import { sendWhatsAppMessage } from '@/lib/messaging';
import { telemetry } from '@/lib/telemetry';
import { historyKey, loadHistory, saveHistory } from '@/lib/conversation-history';
import type { BedrockMessage } from '@/lib/bedrock';

export const runtime = 'nodejs';

const UNLINKED_MESSAGE =
  "👋 Hi! I don't recognize this number yet.\n\nTo use CORE on WhatsApp:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter this WhatsApp number\n\nThen come back and try again!";

// ─── Webhook verification (Meta sends a GET to confirm the endpoint) ──────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// ─── Incoming messages ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return NextResponse.json({ ok: true });
    }

    const from: string = message.from;
    const text: string = message.text?.body?.trim() || '';

    if (!text) return NextResponse.json({ ok: true });

    const user = await usersService.getByWhatsappPhone(from);

    if (!user) {
      telemetry.error('WhatsApp message from unlinked number', undefined, {
        'event.name': 'whatsapp.unlinked_user',
        'whatsapp.from': from,
      });
      await sendWhatsAppMessage(from, UNLINKED_MESSAGE);
      return NextResponse.json({ ok: true });
    }

    // Load conversation history from Redis
    const key = historyKey('wa', user.id);
    const history = await loadHistory(key);

    // Process with full conversation context
    const result = await executeCommandForUser(user.id, text, history);

    const reply = result.success
      ? result.message || '✅ Done!'
      : `❌ ${result.error || 'Something went wrong. Please try again.'}`;

    if (!result.success) {
      telemetry.error('WhatsApp AI command failed', user.id, {
        'event.name': 'whatsapp.command_failed',
        'ai.input': text.slice(0, 200),
        'error.message': result.error || 'unknown',
      });
    }

    // Persist updated history
    if (result.success) {
      const updated: BedrockMessage[] = [
        ...history,
        { role: 'user', content: text },
        { role: 'assistant', content: reply },
      ];
      await saveHistory(key, updated);
    }

    await sendWhatsAppMessage(from, reply);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    telemetry.error('Unhandled error in WhatsApp webhook', undefined, {
      'event.name': 'whatsapp.webhook_error',
      'error.message': error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: true });
  }
}
