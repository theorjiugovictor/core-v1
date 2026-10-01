import { NextResponse, after } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { sendWhatsAppMessage } from '@/lib/messaging';
import { telemetry } from '@/lib/telemetry';
import { claimOnce } from '@/lib/redis';
import { verifyWhatsAppSignature } from '@/lib/webhook-security';
import { handleChannelMessage } from '@/lib/channel-messages';

export const runtime = 'nodejs';
// Processing (AI call + reply) runs in after(), inside this budget.
export const maxDuration = 60;

// Meta retries for up to ~7 days in some failure modes; a day covers normal retries.
const DEDUPE_TTL_SECONDS = 60 * 60 * 24;

const UNLINKED_MESSAGE =
  "Hi! I don't recognize this number yet.\n\nTo use CORE on WhatsApp:\n1. Log in at usecoreapp.com\n2. Go to Settings → Connected Channels\n3. Enter this WhatsApp number\n\nThen come back and try again!";

type WhatsAppTextMessage = { id: string; from: string; type: string; text?: { body?: string } };

// ─── Webhook verification (Meta sends a GET to confirm the endpoint) ──────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// ─── Incoming messages ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Authenticate: the body must be signed by Meta with our app secret.
  const rawBody = await request.text();
  if (!verifyWhatsAppSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    telemetry.error('Rejected WhatsApp webhook with invalid signature', undefined, {
      'event.name': 'whatsapp.invalid_signature',
    });
    return new Response('Invalid signature', { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // 2. Collect every text message in the payload (Meta can batch several).
  const messages: WhatsAppTextMessage[] = [];
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      for (const message of change?.value?.messages ?? []) {
        if (message?.type === 'text' && message.id && message.from && message.text?.body?.trim()) {
          messages.push(message);
        }
      }
    }
  }

  // 3. Dedupe on the WhatsApp message id so a retry never records a sale twice.
  const fresh: WhatsAppTextMessage[] = [];
  for (const message of messages) {
    if (await claimOnce(`wh:wa:${message.id}`, DEDUPE_TTL_SECONDS)) {
      fresh.push(message);
    }
  }

  // 4. Acknowledge immediately; do the slow work after the response is sent.
  if (fresh.length > 0) {
    after(async () => {
      for (const message of fresh) {
        const from = message.from;
        const text = message.text!.body!.trim();
        const send = (reply: string) => sendWhatsAppMessage(from, reply);

        const user = await usersService.getByWhatsappPhone(from);
        if (!user) {
          telemetry.error('WhatsApp message from unlinked number', undefined, {
            'event.name': 'whatsapp.unlinked_user',
            'whatsapp.from': from,
          });
          await send(UNLINKED_MESSAGE).catch((err) =>
            console.error('WhatsApp unlinked reply failed:', err)
          );
          continue;
        }

        await handleChannelMessage({ channel: 'whatsapp', userId: user.id, input: text, send });
      }
    });
  }

  return NextResponse.json({ ok: true });
}
