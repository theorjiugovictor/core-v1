import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Verify Meta's X-Hub-Signature-256 header against the raw request body.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
 *
 * Fails closed: if WHATSAPP_APP_SECRET is not configured, every request is rejected.
 */
export function verifyWhatsAppSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    console.error('WHATSAPP_APP_SECRET is not set; rejecting WhatsApp webhook.');
    return false;
  }
  if (!header?.startsWith('sha256=')) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  return safeEqual(expected, header);
}

/**
 * Verify Telegram's X-Telegram-Bot-Api-Secret-Token header.
 * The same value must be passed as `secret_token` when calling setWebhook.
 * https://core.telegram.org/bots/api#setwebhook
 *
 * Fails closed: if TELEGRAM_WEBHOOK_SECRET is not configured, every request is rejected.
 */
export function verifyTelegramSecret(header: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error('TELEGRAM_WEBHOOK_SECRET is not set; rejecting Telegram webhook.');
    return false;
  }
  if (!header) return false;
  return safeEqual(secret, header);
}
