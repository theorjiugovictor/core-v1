import { NextRequest, NextResponse } from 'next/server';
import { sendEarlyAccessRequest } from '@/lib/email';
import { earlyAccessLimiter } from '@/lib/ratelimit';
import {
  addToEarlyAccessSegment,
  parseContact,
  saveEarlyAccessRequest,
  whatsappLink,
} from '@/lib/early-access';

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

  const input = { name: name.trim(), business: business.trim(), contact: contact.trim() };
  const parsed = parseContact(input.contact);

  // Firestore is the record of who asked; the email is the alert. The signup
  // counts as received if either one lands.
  const [saved, notified, segmented] = await Promise.allSettled([
    saveEarlyAccessRequest(input, parsed),
    sendEarlyAccessRequest({
      ...input,
      contactType: parsed.type,
      email: parsed.type === 'email' ? parsed.email : undefined,
      whatsapp: parsed.type === 'phone' ? whatsappLink(parsed.phone) : undefined,
    }),
    addToEarlyAccessSegment(input, parsed),
  ]);

  if (saved.status === 'rejected') console.error('Early access save failed:', saved.reason);
  if (notified.status === 'rejected') console.error('Early access email failed:', notified.reason);
  if (segmented.status === 'rejected') console.error('Early access segment add failed:', segmented.reason);

  if (saved.status === 'rejected' && notified.status === 'rejected') {
    return NextResponse.json({ error: 'Could not submit your request. Please try again.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
