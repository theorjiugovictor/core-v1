'use server';

import { generateBusinessInsights as generateWithAI } from './ai';
import type { BedrockMessage } from './bedrock';
import { salesService } from './firebase/sales';
import { materialsService } from './firebase/materials';
import { productsService } from './firebase/products';
import { usersService } from './firebase/users';
import { expensesService } from './firebase/expenses';
import { debtsService } from './firebase/debts';
import { revalidatePath, unstable_cache } from 'next/cache';
import { auth } from '@/lib/auth';
import { aiLimiter } from '@/lib/ratelimit';
import { telemetry } from '@/lib/telemetry';
import { executeCommandForUser } from './commands';
import {
  businessMonth,
  parseNormalizedDate,
  periodStart,
  startOfBusinessDay,
  startOfBusinessMonth,
} from './time';

export type ParseBusinessCommandInput = {
  input: string;
  /** Full conversation history from the client, oldest-first. Used to give CHAT responses real context. */
  conversationHistory?: BedrockMessage[];
};


export async function processBusinessCommand(input: ParseBusinessCommandInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const { success: withinLimit } = await aiLimiter.limit(session.user.id);
  if (!withinLimit) {
    telemetry.rateLimitHit(session.user.id, 'ai');
    return { success: false, error: "Too many requests. Please wait a moment before trying again." };
  }

  const start = Date.now();
  const result = await executeCommandForUser(session.user.id, input.input, input.conversationHistory ?? []);
  const action = Array.isArray((result as any).data) && (result as any).data[0]?.action
    ? (result as any).data[0].action
    : 'UNKNOWN';
  telemetry.aiCommand(session.user.id, input.input, action, result.success, Date.now() - start);
  return result;
}

export async function getBusinessInsights() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    // unstable_cache is Vercel-compatible (persists across serverless invocations via CDN cache)
    const fetchInsights = unstable_cache(
      async () => {
        // Last 90 days is plenty for trend insights and keeps reads bounded.
        const [materials, sales, products] = await Promise.all([
          materialsService.getAll(userId),
          salesService.getInRange(userId, startOfBusinessDay(new Date(), -89)),
          productsService.getAll(userId),
        ]);
        return generateWithAI({ materials, sales, products });
      },
      [`insights-${userId}`],
      { revalidate: 60 * 15 } // 15 minutes
    );

    return await fetchInsights();
  } catch (error) {
    console.error('Insights generation failed:', error);
    return { success: false, error: 'Failed to generate insights' };
  }
}

// --- CRUD Actions for UI ---

// Materials
export async function getMaterialsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  return await materialsService.getAll(userId);
}

export async function createMaterialAction(data: { name: string; quantity: number; unit: string; costPrice: number }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;
  await materialsService.create({ ...data, userId, createdAt: new Date().toISOString() });
  revalidatePath('/materials');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateMaterialAction(id: string, data: { name: string; quantity: number; unit: string; costPrice: number }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;
  try {
    await materialsService.update(id, userId, data);
    revalidatePath('/materials');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update material" };
  }
}

export async function deleteMaterialAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;
  await materialsService.delete(id, userId);
  revalidatePath('/materials');
  revalidatePath('/dashboard');
  return { success: true };
}

// Products
export async function getProductsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  return await productsService.getAll(userId);
}

export async function createProductAction(data: { name: string; sellingPrice: number; costPrice?: number; materials: { materialId: string; quantity: number }[] }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;
  await productsService.create({ ...data, userId, createdAt: new Date().toISOString() });
  revalidatePath('/products');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateProductAction(id: string, data: { name: string; sellingPrice: number; costPrice?: number; materials: { materialId: string; quantity: number }[] }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    await productsService.update(id, userId, data);
    revalidatePath('/products');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;
  await productsService.delete(id, userId);
  revalidatePath('/products');
  revalidatePath('/dashboard');
  return { success: true };
}

// Sales
// Most recent sales, newest first. `limit` caps the read for UI lists; the CSV
// export calls this without a limit to get the full history.
export async function getSalesAction(limit?: number) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  return await salesService.getAll(userId, limit);
}

// Today's sales and expenses (Lagos day) for the dashboard, plus whether the
// account has recorded anything at all. Reads today's documents and at most
// one document per collection for the "has data" check.
export async function getTodayActivityAction() {
  const session = await auth();
  if (!session?.user?.id) return { sales: [], expenses: [], hasData: false };
  const userId = session.user.id;
  const todayStart = startOfBusinessDay();

  const [sales, expenses, anySale, anyExpense] = await Promise.all([
    salesService.getInRange(userId, todayStart),
    expensesService.getInRange(userId, todayStart),
    salesService.getAll(userId, 1),
    expensesService.getAll(userId, 1),
  ]);

  return { sales, expenses, hasData: anySale.length > 0 || anyExpense.length > 0 };
}

export async function createSaleAction(data: { productName: string; quantity: number; totalAmount: number; paymentMethod: 'Cash' | 'Card' | 'Transfer'; }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    const products = await productsService.getAll(userId);
    const materials = await materialsService.getAll(userId);
    const product = products.find(p => p.name.toLowerCase() === data.productName.toLowerCase());
    const directMat = materials.find(m => m.name.toLowerCase() === data.productName.toLowerCase());

    const hasRecipe = Boolean(product && product.materials && product.materials.length > 0);

    // 1. Stock Validation
    if (hasRecipe) {
      for (const ingredient of product!.materials) {
        const mat = materials.find(m => m.id === ingredient.materialId);
        if (mat) {
          const needed = ingredient.quantity * data.quantity;
          if (mat.quantity < needed) {
            return {
              success: false,
              error: mat.quantity === 0
                ? `${mat.name} is out of stock. Restock before selling.`
                : `Not enough ${mat.name}: need ${needed} ${mat.unit}(s), only ${mat.quantity} in stock.`
            };
          }
        }
      }
    } else if (directMat) {
      if (directMat.quantity < data.quantity) {
        return {
          success: false,
          error: directMat.quantity === 0
            ? `${directMat.name} is out of stock. Restock before selling.`
            : `Not enough ${directMat.name}: need ${data.quantity} ${directMat.unit}(s), only ${directMat.quantity} in stock.`
        };
      }
    }

    // 2. Calculate Unit Cost
    let costAmount = 0;
    if (product) {
      if (hasRecipe) {
        const unitCost = product.materials.reduce((acc, curr) => {
          const mat = materials.find(m => m.id === curr.materialId);
          return acc + (mat ? mat.costPrice * curr.quantity : 0);
        }, 0);
        costAmount = unitCost * data.quantity;
      } else {
        costAmount = (product.costPrice || 0) * data.quantity;
      }
    } else if (directMat) {
      costAmount = directMat.costPrice * data.quantity;
    }

    // 3. Create Sale
    await salesService.create({
      userId,
      ...data,
      costAmount,
      date: new Date().toISOString()
    });

    // 4. Deduct Inventory
    if (hasRecipe) {
      for (const ingredient of product!.materials) {
        const material = materials.find(m => m.id === ingredient.materialId);
        if (material) {
          const qtyToDeduct = ingredient.quantity * data.quantity;
          await materialsService.update(material.id, userId, {
            quantity: Math.max(0, material.quantity - qtyToDeduct)
          });
        }
      }
    } else if (directMat) {
      await materialsService.update(directMat.id, userId, {
        quantity: Math.max(0, directMat.quantity - data.quantity)
      });
    }

    revalidatePath('/sales');
    revalidatePath('/dashboard');
    revalidatePath('/materials');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create sale:', error);
    return { success: false, error: error.message || "Failed to create sale" };
  }
}

export async function updateSaleAction(id: string, data: Partial<any>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    await salesService.update(id, userId, data);
    revalidatePath('/sales');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update sale" };
  }
}

export async function deleteSaleAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    await salesService.delete(id, userId);
    revalidatePath('/sales');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete sale" };
  }
}

// Expenses
export async function getExpensesAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  return await expensesService.getAll(userId);
}

export async function createExpenseAction(data: { description: string; amount: number; category?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    await expensesService.create({
      userId,
      ...data,
      date: new Date().toISOString()
    });
    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create expense" };
  }
}

export async function deleteExpenseAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    await expensesService.delete(id, userId);
    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete expense" };
  }
}

export type KpiPeriod = 'today' | 'week' | 'month' | 'all';

// KPIs
export async function getKpisAction(period: KpiPeriod = 'month') {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const now = new Date();

  // Period boundaries, in Lagos time
  const start = periodStart(period, now);

  // Previous period [prevStart, prevEnd) for % change (today/week/month only)
  const prevStart = (() => {
    if (period === 'today') return startOfBusinessDay(now, -1);
    if (period === 'week')  return startOfBusinessDay(now, -13);
    if (period === 'month') return startOfBusinessMonth(now, -1);
    return null;
  })();
  const prevEnd = start;

  // Only read documents from the window we actually report on. For 'all',
  // Firestore aggregates the totals instead of us downloading every sale.
  const [materials, products, saleTotals, expenseTotals, prevSaleTotals] = await Promise.all([
    materialsService.getAll(userId),
    productsService.getAll(userId),
    salesService.getTotals(userId, start),
    expensesService.getTotal(userId, start),
    prevStart ? salesService.getTotals(userId, prevStart, prevEnd) : Promise.resolve(null),
  ]);

  const revenue      = saleTotals.revenue;
  const cogs         = saleTotals.cost;
  const expenseTotal = expenseTotals.total;
  const grossProfit  = revenue - cogs;
  const netProfit    = grossProfit - expenseTotal;
  const grossMargin  = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netMargin    = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const prevRevenue  = prevSaleTotals?.revenue ?? 0;
  const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

  const inventoryValue = materials.reduce((s, m) => s + ((m.quantity || 0) * (m.costPrice || 0)), 0);

  const periodLabel: Record<KpiPeriod, string> = {
    today: 'vs yesterday', week: 'vs prev week', month: 'vs last month', all: 'all time',
  };

  return [
    {
      title: 'Revenue',
      value: `₦${revenue.toLocaleString()}`,
      change: period !== 'all' ? `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%` : undefined,
      changeType: revenueChange >= 0 ? 'increase' as const : 'decrease' as const,
      description: periodLabel[period],
      iconName: 'TrendingUp',
    },
    {
      title: 'Expenses',
      value: `₦${expenseTotal.toLocaleString()}`,
      change: `${expenseTotals.count} ${expenseTotals.count === 1 ? 'record' : 'records'}`,
      changeType: 'decrease' as const,
      description: 'logged',
      iconName: 'TrendingDown',
    },
    {
      title: 'Gross Profit',
      value: `₦${grossProfit.toLocaleString()}`,
      change: `${grossMargin.toFixed(1)}% margin`,
      changeType: grossProfit >= 0 ? 'increase' as const : 'decrease' as const,
      description: 'revenue minus cost of goods',
      iconName: 'DollarSign',
    },
    {
      title: 'Net Profit',
      value: `₦${netProfit.toLocaleString()}`,
      change: `${netMargin.toFixed(1)}% net margin`,
      changeType: netProfit >= 0 ? 'increase' as const : 'decrease' as const,
      description: 'after all expenses',
      iconName: 'Activity',
    },
    {
      title: 'Products',
      value: products.length.toString(),
      change: `${products.length} ${products.length === 1 ? 'product' : 'products'}`,
      changeType: 'increase' as const,
      description: 'in your catalog',
      iconName: 'Package',
    },
    {
      title: 'Inventory Value',
      value: `₦${inventoryValue.toLocaleString()}`,
      change: `${materials.length} ${materials.length === 1 ? 'material' : 'materials'}`,
      changeType: 'increase' as const,
      description: 'current stock value',
      iconName: 'Boxes',
    },
  ];
}

export async function getRevenueChartData() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  // Only the last 6 Lagos months of sales
  const now = new Date();
  const sales = await salesService.getInRange(userId, startOfBusinessMonth(now, -5));

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfBusinessMonth(now, -i);
    const { year, monthIndex } = businessMonth(monthStart);
    return {
      name: new Date(Date.UTC(year, monthIndex, 15)).toLocaleString('en-NG', { month: 'short', timeZone: 'UTC' }),
      year,
      monthIndex,
      value: 0
    };
  }).reverse();

  sales.forEach(sale => {
    const { year, monthIndex } = businessMonth(parseNormalizedDate(sale.date));
    const monthData = last6Months.find(m => m.monthIndex === monthIndex && m.year === year);
    if (monthData) {
      monthData.value += sale.totalAmount || 0;
    }
  });

  return last6Months.map(m => ({
    date: `${m.name} ${m.year.toString().slice(2)}`,
    Desktop: m.value, // Using 'Desktop' to match existing chart component key
    Mobile: 0, // Ignored for now or could be another metric
  }));
}

// User Profile
export async function getUserProfileAction() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  return await usersService.getById(userId);
}

export async function updateChannelsAction(data: { whatsappPhone?: string; telegramId?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;
  try {
    await usersService.update(userId, data);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("Failed to update channels:", error);
    return { success: false, error: "Failed to save channel settings." };
  }
}

export async function updateUserAction(data: { name: string; businessName: string; email: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    await usersService.update(userId, {
      name: data.name,
      businessName: data.businessName,
      email: data.email
    });
    revalidatePath('/settings');
    revalidatePath('/dashboard'); // revalidate dashboard in case business name is used there
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "Failed to update profile." };
  }
}
