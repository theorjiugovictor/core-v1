import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { usersService } from '@/lib/firebase/users';
import { executeCommandForUser } from '@/lib/actions';
import { sendWhatsAppMessage } from '@/lib/messaging';
import type { BedrockMessage } from '@/lib/bedrock';

export const runtime = 'nodejs';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const HISTORY_KEY = (userId: string) => `wa:conv:${userId}`;
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
    // Non-fatal
  }
}

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
      await sendWhatsAppMessage(from, UNLINKED_MESSAGE);
      return NextResponse.json({ ok: true });
    }

    // Load conversation history from Redis
    const history = await loadHistory(user.id);

    // Process with full conversation context
    const result = await executeCommandForUser(user.id, text, history);

    const reply = result.success
      ? result.message || '✅ Done!'
      : `❌ ${result.error || 'Something went wrong. Please try again.'}`;

    // Persist updated history
    if (result.success) {
      const updated: BedrockMessage[] = [
        ...history,
        { role: 'user', content: text },
        { role: 'assistant', content: reply },
      ];
      await saveHistory(user.id, updated);
    }

    await sendWhatsAppMessage(from, reply);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
