import { NextResponse } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { salesService } from '@/lib/firebase/sales';
import { sendDailyNudge } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (or our CRON_SECRET in dev)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await usersService.getAll();
    const results: { email: string; status: string }[] = [];

    // Yesterday's date range
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setDate(now.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    for (const user of users) {
      try {
        const allSales = await salesService.getAll(user.id);
        const yesterdaySales = allSales.filter((s) => {
          const d = new Date(s.date);
          return d >= yesterdayStart && d <= yesterdayEnd;
        });

        const revenue = yesterdaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const cost = yesterdaySales.reduce((sum, s) => sum + (s.costAmount || 0), 0);

        await sendDailyNudge(
          { email: user.email, name: user.name, businessName: user.businessName },
          { revenue, sales: yesterdaySales.length, profit: revenue - cost }
        );

        results.push({ email: user.email, status: 'sent' });
      } catch (err) {
        console.error(`Daily nudge failed for ${user.email}:`, err);
        results.push({ email: user.email, status: 'failed' });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('Daily nudge cron failed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
