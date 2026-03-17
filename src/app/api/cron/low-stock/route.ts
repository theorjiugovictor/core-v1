import { NextResponse } from 'next/server';
import { usersService } from '@/lib/firebase/users';
import { materialsService } from '@/lib/firebase/materials';
import { sendLowStockAlert } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DEFAULT_THRESHOLD = 5;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await usersService.getAll();
    const results: { email: string; status: string; lowItems?: number }[] = [];

    for (const user of users) {
      try {
        const materials = await materialsService.getAll(user.id);
        const lowItems = materials
          .filter((m) => {
            const threshold = m.lowStockThreshold ?? DEFAULT_THRESHOLD;
            return m.quantity <= threshold;
          })
          .map((m) => ({
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
            threshold: m.lowStockThreshold ?? DEFAULT_THRESHOLD,
          }));

        if (lowItems.length === 0) {
          results.push({ email: user.email, status: 'skipped', lowItems: 0 });
          continue;
        }

        await sendLowStockAlert(
          { email: user.email, name: user.name, businessName: user.businessName },
          lowItems
        );

        results.push({ email: user.email, status: 'sent', lowItems: lowItems.length });
      } catch (err) {
        console.error(`Low stock alert failed for ${user.email}:`, err);
        results.push({ email: user.email, status: 'failed' });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('Low stock cron failed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
