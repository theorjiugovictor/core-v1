import { salesService } from '@/lib/firebase/sales';
import { sendDailyNudge } from '@/lib/email';
import { createCronHandler } from '@/lib/cron';
import { startOfBusinessDay } from '@/lib/time';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Yesterday's numbers (Lagos day) for every user, in batches.
export const GET = createCronHandler({
  name: 'daily_nudge',
  async run(user, now) {
    const yesterdayStart = startOfBusinessDay(now, -1);
    const todayStart = startOfBusinessDay(now);
    const totals = await salesService.getTotals(user.id, yesterdayStart, todayStart);

    await sendDailyNudge(
      { email: user.email, name: user.name, businessName: user.businessName },
      { revenue: totals.revenue, sales: totals.count, profit: totals.revenue - totals.cost }
    );
    return 'sent';
  },
});
