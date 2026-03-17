import { Resend } from 'resend';

const FROM = 'CORE <notifications@usecoreapp.com>';

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  return new Resend(process.env.RESEND_API_KEY);
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usecoreapp.com';

// ─── Daily Nudge ───────────────────────────────────────────────────────────────

export async function sendDailyNudge(user: {
  email: string;
  name: string;
  businessName: string;
}, yesterday: {
  revenue: number;
  sales: number;
  profit: number;
}) {
  const hasData = yesterday.sales > 0;

  const summary = hasData
    ? `Yesterday you recorded <strong>${yesterday.sales} sale${yesterday.sales !== 1 ? 's' : ''}</strong> — ₦${yesterday.revenue.toLocaleString()} revenue, ₦${yesterday.profit.toLocaleString()} profit.`
    : `No sales were logged yesterday. Today is a new day — every transaction counts!`;

  await getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: `Good morning, ${user.name}! Ready to log today's sales?`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Good morning, ${user.name} 👋</h2>
      <p style="margin:0 0 20px;color:#555;font-size:15px;">${user.businessName}</p>

      <div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">${summary}</p>
      </div>

      <p style="color:#374151;font-size:15px;line-height:1.6;">
        Log today's sales now — it takes seconds with voice or text.
      </p>

      <a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#000;color:#fff;border-radius:100px;text-decoration:none;font-size:15px;font-weight:600;">
        Open Dashboard →
      </a>
    `),
  });
}

// ─── Weekly Summary ────────────────────────────────────────────────────────────

export async function sendWeeklySummary(user: {
  email: string;
  name: string;
  businessName: string;
}, week: {
  revenue: number;
  profit: number;
  sales: number;
  topProduct: string | null;
  marginPercent: number;
  revenueChange: number; // % vs previous week
}) {
  const changeText = week.revenueChange === 0
    ? 'Same as last week'
    : week.revenueChange > 0
      ? `<span style="color:#16a34a;">▲ ${week.revenueChange.toFixed(1)}% vs last week</span>`
      : `<span style="color:#dc2626;">▼ ${Math.abs(week.revenueChange).toFixed(1)}% vs last week</span>`;

  await getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: `Your week in review — ${user.businessName}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Your week in review</h2>
      <p style="margin:0 0 24px;color:#555;font-size:15px;">${user.businessName}</p>

      <div style="display:grid;gap:12px;margin-bottom:24px;">
        ${statCard('Revenue', `₦${week.revenue.toLocaleString()}`, changeText)}
        ${statCard('Net Profit', `₦${week.profit.toLocaleString()}`, `${week.marginPercent.toFixed(1)}% margin`)}
        ${statCard('Transactions', `${week.sales}`, 'sales logged')}
        ${week.topProduct ? statCard('Top Product', week.topProduct, 'best seller this week') : ''}
      </div>

      <a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:8px;padding:14px 28px;background:#000;color:#fff;border-radius:100px;text-decoration:none;font-size:15px;font-weight:600;">
        View Full Dashboard →
      </a>
    `),
  });
}

// ─── Low Stock Alert ───────────────────────────────────────────────────────────

export async function sendLowStockAlert(user: {
  email: string;
  name: string;
  businessName: string;
}, lowItems: Array<{ name: string; quantity: number; unit: string; threshold: number }>) {
  const rows = lowItems.map(item =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#111;font-size:14px;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#dc2626;font-weight:600;font-size:14px;">${item.quantity} ${item.unit}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#9ca3af;font-size:14px;">threshold: ${item.threshold}</td>
    </tr>`
  ).join('');

  await getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: `⚠️ Low stock alert — ${lowItems.length} item${lowItems.length !== 1 ? 's' : ''} running low`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Low Stock Alert</h2>
      <p style="margin:0 0 24px;color:#555;font-size:15px;">${user.businessName} · ${lowItems.length} item${lowItems.length !== 1 ? 's' : ''} need restocking</p>

      <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #f3f4f6;margin-bottom:24px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Item</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Current Stock</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <a href="${APP_URL}/materials" style="display:inline-block;padding:14px 28px;background:#000;color:#fff;border-radius:100px;text-decoration:none;font-size:15px;font-weight:600;">
        Update Inventory →
      </a>
    `),
  });
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function statCard(label: string, value: string, sub: string) {
  return `
    <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;">
      <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">${label}</div>
      <div style="font-size:24px;font-weight:700;color:#111;margin-bottom:2px;">${value}</div>
      <div style="font-size:13px;color:#6b7280;">${sub}</div>
    </div>`;
}

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <tr><td>
          <div style="margin-bottom:32px;">
            <span style="font-size:18px;font-weight:800;color:#000;letter-spacing:-.5px;">CORE</span>
          </div>
          ${content}
          <div style="margin-top:40px;padding-top:24px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              You're receiving this because you have a CORE account.<br>
              <a href="${APP_URL}/settings" style="color:#9ca3af;">Manage notifications</a>
            </p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
