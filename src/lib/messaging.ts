// ─── WhatsApp (Meta Cloud API) ─────────────────────────────────────────────────

const WA_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export async function sendWhatsAppMessage(to: string, text: string) {
  const res = await fetch(WA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp send failed:', err);
    throw new Error(`WhatsApp API error: ${res.status}`);
  }
}

// ─── Telegram (Bot API) ────────────────────────────────────────────────────────

const TG_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(chatId: string | number, text: string) {
  const res = await fetch(`${TG_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Telegram send failed:', err);
    throw new Error(`Telegram API error: ${res.status}`);
  }
}

// Call once after deploying to register your webhook URL with Telegram
export async function registerTelegramWebhook(appUrl: string) {
  const webhookUrl = `${appUrl}/api/webhooks/telegram`;
  const res = await fetch(`${TG_API_URL}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });
  return res.json();
}
