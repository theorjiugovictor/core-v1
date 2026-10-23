import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { FieldValue } from 'firebase-admin/firestore';
import { db, Collections } from './firebase/config';

export type EarlyAccessInput = {
  name: string;
  business: string;
  contact: string;
};

export type ParsedContact =
  | { type: 'email'; email: string }
  | { type: 'phone'; phone: string }
  | { type: 'unknown' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The form takes "WhatsApp phone or email" in a single field, so work out which
// one we got. Nigerian local numbers (0803...) are normalised to +234 so the
// same person is recognised however they typed it.
export function parseContact(raw: string): ParsedContact {
  const value = raw.trim();
  if (EMAIL_RE.test(value)) return { type: 'email', email: value.toLowerCase() };

  const digits = value.replace(/[^\d+]/g, '');
  const bare = digits.replace(/\+/g, '');
  if (bare.length < 7 || bare.length > 15) return { type: 'unknown' };

  if (digits.startsWith('+')) return { type: 'phone', phone: `+${bare}` };
  if (bare.startsWith('234')) return { type: 'phone', phone: `+${bare}` };
  if (bare.startsWith('0') && bare.length === 11) return { type: 'phone', phone: `+234${bare.slice(1)}` };
  return { type: 'phone', phone: bare };
}

export function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

function contactKey(parsed: ParsedContact, raw: string): string {
  const key = parsed.type === 'email' ? parsed.email : parsed.type === 'phone' ? parsed.phone : raw.trim().toLowerCase();
  return createHash('sha256').update(key).digest('hex').slice(0, 32);
}

// One document per person, keyed by their contact, so repeat submissions update
// the same record instead of creating duplicates.
export async function saveEarlyAccessRequest(input: EarlyAccessInput, parsed: ParsedContact) {
  const ref = db.collection(Collections.EARLY_ACCESS).doc(contactKey(parsed, input.contact));
  const now = new Date().toISOString();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    tx.set(
      ref,
      {
        name: input.name,
        business: input.business || null,
        contactRaw: input.contact,
        contactType: parsed.type,
        email: parsed.type === 'email' ? parsed.email : null,
        phone: parsed.type === 'phone' ? parsed.phone : null,
        status: snap.exists ? snap.get('status') ?? 'pending' : 'pending',
        createdAt: snap.exists ? snap.get('createdAt') ?? now : now,
        updatedAt: now,
        submissions: FieldValue.increment(1),
      },
      { merge: true },
    );
  });
}

// Email signups also go into the Resend segment used for invite broadcasts.
// Best effort: a failure here must not fail the signup itself.
export async function addToEarlyAccessSegment(input: EarlyAccessInput, parsed: ParsedContact) {
  const segmentId = process.env.RESEND_EARLY_ACCESS_SEGMENT_ID;
  if (parsed.type !== 'email' || !segmentId || !process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const [firstName, ...rest] = input.name.trim().split(/\s+/);
  const created = await resend.contacts.create({
    email: parsed.email,
    firstName,
    lastName: rest.join(' ') || undefined,
    segments: [{ id: segmentId }],
  });

  // Already a contact (e.g. an existing app user): just add them to the segment.
  if (created.error) {
    const added = await resend.contacts.segments.add({ email: parsed.email, segmentId });
    if (added.error) throw new Error(`Resend segment add failed: ${added.error.message}`);
  }
}
