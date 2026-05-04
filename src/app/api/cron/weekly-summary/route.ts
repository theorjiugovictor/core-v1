import { NextResponse } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { salesService } from '@/lib/firebase/sales';
import { sendWeeklySummary } from '@/lib/email';
import { telemetry } from '@/lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await usersService.getAll();
    const results: { email: string; status: string }[] = [];

    const now = new Date();

    // This week: last 7 days
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Previous week: 8–14 days ago
    const prevWeekStart = new Date(now);
    prevWeekStart.setDate(now.getDate() - 14);
    prevWeekStart.setHours(0, 0, 0, 0);
    const prevWeekEnd = new Date(thisWeekStart);

    for (const user of users) {
      try {
        const allSales = await salesService.getAll(user.id);

        const thisWeekSales = allSales.filter((s) => new Date(s.date) >= thisWeekStart);
        const prevWeekSales = allSales.filter((s) => {
          const d = new Date(s.date);
          return d >= prevWeekStart && d < prevWeekEnd;
        });

        const revenue = thisWeekSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const cost = thisWeekSales.reduce((sum, s) => sum + (s.costAmount || 0), 0);
        const profit = revenue - cost;
        const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

        const prevRevenue = prevWeekSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

        // Top product by revenue
        const productTotals: Record<string, number> = {};
        for (const s of thisWeekSales) {
          productTotals[s.productName] = (productTotals[s.productName] || 0) + s.totalAmount;
        }
        const topProduct = Object.entries(productTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

        await sendWeeklySummary(
          { email: user.email, name: user.name, businessName: user.businessName },
          { revenue, profit, sales: thisWeekSales.length, topProduct, marginPercent, revenueChange }
        );

        results.push({ email: user.email, status: 'sent' });
      } catch (err) {
        console.error(`Weekly summary failed for ${user.email}:`, err);
        telemetry.error('Weekly summary failed for user', user.id, {
          'event.name': 'cron.weekly_summary.user_failed',
          'user.email': user.email,
          'error.message': err instanceof Error ? err.message : String(err),
        });
        results.push({ email: user.email, status: 'failed' });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('Weekly summary cron failed:', error);
    telemetry.error('Weekly summary cron job crashed', undefined, {
      'event.name': 'cron.weekly_summary.crashed',
      'error.message': error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
