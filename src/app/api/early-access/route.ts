import { NextRequest, NextResponse } from 'next/server';
import { sendEarlyAccessRequest } from '@/lib/email';
import { earlyAccessLimiter } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { success } = await earlyAccessLimiter.limit(ip);
  if (!success) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { name, business, contact } = body as Record<string, unknown>;
  if (typeof name !== 'string' || typeof business !== 'string' || typeof contact !== 'string' ||
      !name.trim() || !contact.trim() || name.length > 100 || business.length > 120 || contact.length > 160) {
    return NextResponse.json({ error: 'Please enter a name and a valid contact.' }, { status: 400 });
  }

  try {
    await sendEarlyAccessRequest({ name: name.trim(), business: business.trim(), contact: contact.trim() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Early access email failed:', error);
    return NextResponse.json({ error: 'Could not submit your request. Please try again.' }, { status: 502 });
  }
}
