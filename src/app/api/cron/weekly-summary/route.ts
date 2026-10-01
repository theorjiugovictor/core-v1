import { salesService } from '@/lib/firebase/sales';
import { sendWeeklySummary } from '@/lib/email';
import { createCronHandler } from '@/lib/cron';
import { startOfBusinessDay } from '@/lib/time';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Last 7 complete Lagos days vs the 7 before, for every user, in batches.
export const GET = createCronHandler({
  name: 'weekly_summary',
  async run(user, now) {
    const thisWeekEnd = startOfBusinessDay(now);
    const thisWeekStart = startOfBusinessDay(now, -7);
    const prevWeekStart = startOfBusinessDay(now, -14);

    const [thisWeekSales, prevWeek] = await Promise.all([
      salesService.getInRange(user.id, thisWeekStart, thisWeekEnd),
      salesService.getTotals(user.id, prevWeekStart, thisWeekStart),
    ]);

    const revenue = thisWeekSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const cost = thisWeekSales.reduce((sum, s) => sum + (s.costAmount || 0), 0);
    const profit = revenue - cost;
    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
    const revenueChange = prevWeek.revenue > 0 ? ((revenue - prevWeek.revenue) / prevWeek.revenue) * 100 : 0;

    // Top product by revenue
    const productTotals: Record<string, number> = {};
    for (const s of thisWeekSales) {
      productTotals[s.productName] = (productTotals[s.productName] || 0) + (s.totalAmount || 0);
    }
    const topProduct = Object.entries(productTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    await sendWeeklySummary(
      { email: user.email, name: user.name, businessName: user.businessName },
      { revenue, profit, sales: thisWeekSales.length, topProduct, marginPercent, revenueChange }
    );
    return 'sent';
  },
});
