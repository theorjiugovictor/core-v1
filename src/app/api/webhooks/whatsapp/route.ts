import { NextResponse } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { executeCommandForUser } from '@/lib/actions';
import { sendWhatsAppMessage } from '@/lib/messaging';

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

    // Extract message from WhatsApp payload
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    // Ignore status updates, delivery receipts, etc.
    if (!message || message.type !== 'text') {
      return NextResponse.json({ ok: true });
    }

    const from: string = message.from; // phone number e.g. "2348012345678"
    const text: string = message.text?.body?.trim() || '';

    if (!text) return NextResponse.json({ ok: true });

    // Look up CORE user by WhatsApp phone
    const user = await usersService.getByWhatsappPhone(from);

    if (!user) {
      await sendWhatsAppMessage(from, UNLINKED_MESSAGE);
      return NextResponse.json({ ok: true });
    }

    // Process the command using the shared executor
    const result = await executeCommandForUser(user.id, text);

    const reply = result.success
      ? result.message || '✅ Done!'
      : `❌ ${result.error || 'Something went wrong. Please try again.'}`;

    await sendWhatsAppMessage(from, reply);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    // Always return 200 to prevent Meta from disabling the webhook
    return NextResponse.json({ ok: true });
  }
}
