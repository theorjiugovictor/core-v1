import { materialsService } from '@/lib/firebase/materials';
import { sendLowStockAlert } from '@/lib/email';
import { createCronHandler } from '@/lib/cron';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DEFAULT_THRESHOLD = 5;

// Low-stock email for every user with items at or below their threshold, in batches.
export const GET = createCronHandler({
  name: 'low_stock',
  async run(user) {
    const materials = await materialsService.getAll(user.id);
    const lowItems = materials
      .filter((m) => m.quantity <= (m.lowStockThreshold ?? DEFAULT_THRESHOLD))
      .map((m) => ({
        name: m.name,
        quantity: m.quantity,
        unit: m.unit,
        threshold: m.lowStockThreshold ?? DEFAULT_THRESHOLD,
      }));

    if (lowItems.length === 0) return 'skipped';

    await sendLowStockAlert(
      { email: user.email, name: user.name, businessName: user.businessName },
      lowItems
    );
    return 'sent';
  },
});
