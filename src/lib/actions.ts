'use server';

import { parseBusinessCommand as parseWithBedrock, generateBusinessInsights as generateWithBedrock } from './bedrock';
import { salesService } from './firebase/sales';
import { materialsService } from './firebase/materials';
import { productsService } from './firebase/products';
import { usersService } from './firebase/users';
import { expensesService } from './firebase/expenses';
import { revalidatePath, unstable_cache } from 'next/cache';
import { auth } from '@/lib/auth';

export type ParseBusinessCommandInput = {
  input: string;
};

// Fallback regex-based parser
function parseCommandWithRegex(input: string) {
  const normalized = input.toLowerCase().trim();

  // Sale pattern
  const salePattern = /(?:sold?|add)\s+(\d+)\s+(.+?)\s+(?:at|@|for)\s*(?:₦|naira)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:each|per)?/i;
  const saleMatch = normalized.match(salePattern);

  if (saleMatch) {
    const [_, quantity, item, price] = saleMatch;
    const action = normalized.startsWith('sold') ? 'SALE' : 'STOCK_IN';

    // Return array to match new interface
    return {
      success: true,
      data: [{
        action,
        item: item.trim(),
        quantity: parseInt(quantity),
        price: parseFloat(price.replace(/,/g, '')),
        date: new Date().toISOString().split('T')[0]
      }]
    };
  }

  // Product creation pattern: "create product fried rice selling at 1500"
  const productPattern = /(?:create\s+product|new\s+product|create)\s+(.+?)\s+(?:selling\s+)?(?:at|@|for)\s*(?:₦|naira)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
  const productMatch = normalized.match(productPattern);

  if (productMatch) {
    const [_, item, price] = productMatch;
    return {
      success: true,
      data: [{
        action: 'CREATE_PRODUCT',
        item: item.trim(),
        quantity: 0,
        price: parseFloat(price.replace(/,/g, '')),
        date: new Date().toISOString().split('T')[0]
      }]
    };
  }

  // Stock check: "how many bags of rice?"
  if (normalized.includes('how many') || normalized.includes('check stock') || normalized.includes('count')) {
    return {
      success: true,
      data: [{
        action: 'STOCK_CHECK',
        item: normalized.replace('how many', '').replace('check stock', '').replace('count', '').trim(),
        quantity: 0,
        price: 0
      }]
    }
  }

  return {
    success: false,
    error: 'Could not understand command. Try: "Sold 5 bags of Rice at 1000 each"'
  };
}

// Core execution logic — shared by the web console and messaging webhooks
export async function executeCommandForUser(userId: string, rawInput: string) {
  let parsedResult;
  try {
    parsedResult = await parseWithBedrock(rawInput);
    if (!parsedResult.success || !parsedResult.data) {
      throw new Error("Bedrock parsing failed or returned no data");
    }
  } catch (error) {
    console.error('Bedrock parsing failed, using fallback:', error);
    parsedResult = parseCommandWithRegex(rawInput);
  }

  if (!parsedResult.success || !parsedResult.data) {
    return { success: false, error: parsedResult.error || "Could not parse command." };
  }

  const actions = Array.isArray(parsedResult.data) ? parsedResult.data : [parsedResult.data];
  let finalMessage = "";
  const processedActions = [];

  try {
    for (const actionData of actions) {
      const { action, item, quantity, price, isCredit, recipe } = actionData;
      let message = "";

      switch (action) {
        case 'SALE': {
          const products = await productsService.getAll(userId);
          const product = products.find(p => p.name.toLowerCase() === (item || '').toLowerCase());
          const materials = await materialsService.getAll(userId);
          const qty = quantity || 1;
          const hasRecipe = product && product.materials && product.materials.length > 0;

          // ── Pre-sale stock validation (must happen before any DB write) ──
          if (hasRecipe) {
            for (const ingredient of product!.materials) {
              const mat = materials.find(m => m.id === ingredient.materialId);
              if (mat) {
                const needed = ingredient.quantity * qty;
                if (mat.quantity < needed) {
                  message = mat.quantity === 0
                    ? `❌ ${mat.name} is out of stock. Restock before selling.`
                    : `❌ Not enough ${mat.name}: need ${needed} ${mat.unit}(s), only ${mat.quantity} in stock. Sale not recorded.`;
                  break;
                }
              }
            }
          } else {
            const directMat = materials.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
            if (directMat && directMat.quantity < qty) {
              message = directMat.quantity === 0
                ? `❌ ${directMat.name} is out of stock. Restock before selling.`
                : `❌ Only ${directMat.quantity} ${directMat.unit}(s) of ${directMat.name} in stock. You tried to sell ${qty}. Sale not recorded.`;
            }
          }

          // Abort if validation failed
          if (message) break;

          // ── Calculate unit cost ──
          let unitCost = 0;
          if (product) {
            if (hasRecipe) {
              unitCost = product.materials.reduce((acc, curr) => {
                const mat = materials.find(m => m.id === curr.materialId);
                return acc + (mat ? mat.costPrice * curr.quantity : 0);
              }, 0);
            } else {
              unitCost = product.costPrice || 0;
            }
          } else {
            const directMat = materials.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
            if (directMat) unitCost = directMat.costPrice;
          }

          // ── Apply discount ──
          const discountPct: number = actionData.discount ?? 0;
          const unitPrice = price || 0;
          const finalUnitPrice = discountPct > 0 ? unitPrice * (1 - discountPct / 100) : unitPrice;
          const totalAmount = qty * finalUnitPrice;
          const discountNote = discountPct > 0
            ? ` (${discountPct}% discount, saved ₦${(qty * (unitPrice - finalUnitPrice)).toLocaleString()})`
            : '';

          // ── Record sale ──
          await salesService.create({
            userId,
            productName: item || 'Unknown Product',
            quantity: qty,
            totalAmount,
            costAmount: unitCost * qty,
            paymentMethod: isCredit ? 'Transfer' : 'Cash',
            date: new Date().toISOString()
          });

          // ── Deduct inventory ──
          if (hasRecipe) {
            for (const ingredient of product!.materials) {
              const material = materials.find(m => m.id === ingredient.materialId);
              if (material) {
                await materialsService.update(material.id, userId, {
                  quantity: material.quantity - ingredient.quantity * qty
                });
              }
            }
            message = `✅ Sold ${qty}x ${item} @ ₦${finalUnitPrice.toLocaleString()} (Ingredients deducted)${discountNote}`;
          } else {
            const material = materials.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
            if (material) {
              const remaining = material.quantity - qty;
              await materialsService.update(material.id, userId, { quantity: remaining });
              message = remaining === 0
                ? `✅ Sold ${qty}x ${item}${discountNote} ⚠️ ${item} is now out of stock — remember to restock!`
                : `✅ Sold ${qty}x ${item} @ ₦${finalUnitPrice.toLocaleString()}${discountNote} (${remaining} ${material.unit}(s) remaining)`;
            } else {
              message = `✅ Recorded Sale: ${qty}x ${item} @ ₦${finalUnitPrice.toLocaleString()}${discountNote}`;
            }
          }
          break;
        }

        case 'STOCK_IN': {
          const qty = quantity ?? 0;
          if (qty < 0) {
            message = `❌ Cannot add negative quantity. To remove stock, say "Remove ${Math.abs(qty)} ${item}".`;
            break;
          }
          if (qty === 0) {
            message = `❌ Quantity must be greater than 0.`;
            break;
          }
          const allMaterials = await materialsService.getAll(userId);
          const existingMaterial = allMaterials.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
          if (!existingMaterial) {
            message = `⚠️ "${item}" not found in your inventory. Go to Materials to create it first, or say "Create product ${item}".`;
            break;
          }
          const newQty = existingMaterial.quantity + qty;
          await materialsService.update(existingMaterial.id, userId, {
            quantity: newQty,
            costPrice: price || existingMaterial.costPrice
          });
          message = `📦 Restocked ${item}: +${qty} (now ${newQty} ${existingMaterial.unit}(s))`;
          break;
        }

        case 'CREATE_PRODUCT': {
          const newProductMaterials = [];
          if (recipe && Array.isArray(recipe)) {
            const currentMaterials = await materialsService.getAll(userId);
            for (const ingredient of recipe) {
              let matId = '';
              const existingMat = currentMaterials.find(m => m.name.toLowerCase() === ingredient.item.toLowerCase());
              if (existingMat) {
                matId = existingMat.id;
              } else {
                const newMat = await materialsService.create({
                  userId, name: ingredient.item, quantity: 0,
                  unit: 'unit', costPrice: 0, createdAt: new Date().toISOString()
                });
                matId = newMat.id;
              }
              newProductMaterials.push({ materialId: matId, quantity: ingredient.quantity });
            }
          }
          await productsService.create({
            userId, name: item || 'New Product', sellingPrice: price || 0,
            costPrice: 0, materials: newProductMaterials, createdAt: new Date().toISOString()
          });
          message = `✨ Created Product: ${item} @ ₦${price}${newProductMaterials.length > 0 ? ` with ${newProductMaterials.length} ingredients` : ''}`;
          break;
        }

        case 'STOCK_CHECK': {
          const stockMaterials = await materialsService.getAll(userId);
          const found = stockMaterials.find(m => m.name.toLowerCase().includes((item || '').toLowerCase()));
          if (!found) {
            message = `⚠️ "${item}" not found in your inventory. Check spelling or go to Materials to add it.`;
          } else if (found.quantity === 0) {
            message = `📭 ${found.name} is out of stock (0 ${found.unit}s). Time to restock!`;
          } else {
            const threshold = found.lowStockThreshold ?? 5;
            const lowWarning = found.quantity <= threshold ? ` ⚠️ Running low — consider restocking soon.` : '';
            message = `🔎 ${found.name}: ${found.quantity} ${found.unit}(s) in stock.${lowWarning}`;
          }
          break;
        }

        case 'LIST_INVENTORY': {
          const allStock = await materialsService.getAll(userId);
          if (allStock.length === 0) {
            message = `📦 Your inventory is empty. Add materials via the Materials page or say "Create product [name]".`;
          } else {
            const lines = allStock.map(m => {
              const low = m.quantity <= (m.lowStockThreshold ?? 5) ? ' ⚠️' : '';
              return `• ${m.name}: ${m.quantity} ${m.unit}(s)${low}`;
            });
            message = `📦 Inventory (${allStock.length} items):\n${lines.join('\n')}`;
          }
          break;
        }

        case 'LOW_STOCK': {
          const allItems = await materialsService.getAll(userId);
          const lowItems = allItems.filter(m => m.quantity <= (m.lowStockThreshold ?? 5));
          if (lowItems.length === 0) {
            message = `✅ All items are sufficiently stocked. Nothing needs restocking right now.`;
          } else {
            const lines = lowItems.map(m =>
              `• ${m.name}: ${m.quantity} ${m.unit}(s)${m.quantity === 0 ? ' (OUT OF STOCK)' : ''}`
            );
            message = `⚠️ ${lowItems.length} item(s) running low:\n${lines.join('\n')}`;
          }
          break;
        }

        case 'STOCK_REMOVE': {
          const qty = quantity ?? 0;
          if (qty <= 0) {
            message = `❌ Quantity to remove must be greater than 0.`;
            break;
          }
          const allMats = await materialsService.getAll(userId);
          const target = allMats.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
          if (!target) {
            message = `⚠️ "${item}" not found in inventory.`;
            break;
          }
          if (qty > target.quantity) {
            message = `❌ Cannot remove ${qty} ${target.unit}(s) — only ${target.quantity} in stock.`;
            break;
          }
          const afterRemoval = target.quantity - qty;
          await materialsService.update(target.id, userId, { quantity: afterRemoval });
          const reason = actionData.reason ? ` (reason: ${actionData.reason})` : '';
          message = afterRemoval === 0
            ? `🗑️ Removed ${qty}x ${target.name}${reason}. Stock is now 0 — out of stock!`
            : `🗑️ Removed ${qty}x ${target.name}${reason}. Remaining: ${afterRemoval} ${target.unit}(s).`;
          break;
        }

        case 'STOCK_SET': {
          const newQty = quantity ?? 0;
          if (newQty < 0) {
            message = `❌ Stock cannot be set to a negative number.`;
            break;
          }
          const allMats = await materialsService.getAll(userId);
          const target = allMats.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
          if (!target) {
            message = `⚠️ "${item}" not found in inventory.`;
            break;
          }
          const diff = newQty - target.quantity;
          await materialsService.update(target.id, userId, { quantity: newQty });
          const diffNote = diff > 0 ? ` (+${diff} adjusted up)` : diff < 0 ? ` (${diff} adjusted down)` : ` (no change)`;
          message = `🔧 ${target.name} stock corrected to ${newQty} ${target.unit}(s)${diffNote}.`;
          break;
        }

        case 'UPDATE_PRODUCT': {
          const allProducts = await productsService.getAll(userId);
          const prod = allProducts.find(p => p.name.toLowerCase() === (item || '').toLowerCase());
          if (!prod) {
            message = `⚠️ Product "${item}" not found. Check the name or go to Products page.`;
            break;
          }
          await productsService.update(prod.id, userId, {
            name: prod.name,
            sellingPrice: price ?? prod.sellingPrice,
            costPrice: prod.costPrice,
            materials: prod.materials,
          });
          message = `✏️ ${prod.name} selling price updated to ₦${(price ?? prod.sellingPrice).toLocaleString()}.`;
          break;
        }

        case 'DELETE_PRODUCT': {
          const allProducts = await productsService.getAll(userId);
          const prod = allProducts.find(p => p.name.toLowerCase() === (item || '').toLowerCase());
          if (!prod) {
            message = `⚠️ Product "${item}" not found.`;
            break;
          }
          // Check for stock of any linked material
          const allMats = await materialsService.getAll(userId);
          const linkedWithStock = (prod.materials || [])
            .map(r => allMats.find(m => m.id === r.materialId))
            .filter(m => m && m.quantity > 0);
          if (linkedWithStock.length > 0) {
            const names = linkedWithStock.map(m => m!.name).join(', ');
            message = `⚠️ Cannot delete "${prod.name}" — linked ingredients still have stock: ${names}. Clear the stock first or edit the recipe.`;
            break;
          }
          await productsService.delete(prod.id, userId);
          message = `🗑️ Product "${prod.name}" deleted.`;
          break;
        }

        case 'EXPENSE': {
          await expensesService.create({
            userId, amount: price || 0, description: item || 'Expense',
            category: 'General', date: new Date().toISOString()
          });
          message = `💸 Recorded Expense: ₦${(price || 0).toLocaleString()} for ${item}`;
          break;
        }

        case 'CHAT':
          message = actionData.message || "I'm listening.";
          break;

        case 'CLARIFY':
          message = `❓ ${actionData.message || "Could you clarify?"}`;
          break;

        default:
          message = `Unknown action: ${action}`;
      }
      processedActions.push(message);
    }

    finalMessage = processedActions.join('\n');
    revalidatePath('/dashboard');
    revalidatePath('/materials');
    revalidatePath('/sales');
    revalidatePath('/products');

    return { success: true, message: finalMessage, data: actions };
  } catch (dbError) {
    console.error("Database execution failed:", dbError);
    return {
      success: false,
      error: `Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`
    };
  }
}

export async function processBusinessCommand(input: ParseBusinessCommandInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please log in." };
  }
  return executeCommandForUser(session.user.id, input.input);
}

export async function getBusinessInsights() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    // unstable_cache is Vercel-compatible (persists across serverless invocations via CDN cache)
    const fetchInsights = unstable_cache(
      async () => {
        const [materials, sales, products] = await Promise.all([
          materialsService.getAll(userId),
          salesService.getAll(userId),
          productsService.getAll(userId),
        ]);
        return generateWithBedrock({ materials, sales, products });
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
export async function getSalesAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  return await salesService.getAll(userId);
}

export async function createSaleAction(data: { productName: string; quantity: number; totalAmount: number; paymentMethod: 'Cash' | 'Card' | 'Transfer'; }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  try {
    const products = await productsService.getAll(userId);
    const materials = await materialsService.getAll(userId);
    const product = products.find(p => p.name === data.productName);

    // 1. Calculate Unit Cost
    let costAmount = 0;
    if (product) {
      if (product.materials && product.materials.length > 0) {
        // Recipe Cost
        const unitCost = product.materials.reduce((acc, curr) => {
          const mat = materials.find(m => m.id === curr.materialId);
          return acc + (mat ? mat.costPrice * curr.quantity : 0);
        }, 0);
        costAmount = unitCost * data.quantity;
      } else {
        // Retail Cost
        costAmount = (product.costPrice || 0) * data.quantity;
      }
    }

    // 2. Create Sale
    await salesService.create({
      userId,
      ...data,
      costAmount,
      date: new Date().toISOString()
    });

    // 3. Deduct Inventory (if product exists and has recipe)
    if (product && product.materials) {
      for (const ingredient of product.materials) {
        const material = materials.find(m => m.id === ingredient.materialId);
        if (material) {
          const qtyToDeduct = ingredient.quantity * data.quantity;
          await materialsService.update(material.id, userId, {
            quantity: Math.max(0, material.quantity - qtyToDeduct)
          });
        }
      }
    }

    revalidatePath('/sales');
    revalidatePath('/dashboard');
    revalidatePath('/materials');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create sale" };
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

// KPIs
export async function getKpisAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const materials = await materialsService.getAll(userId);
  const sales = await salesService.getAll(userId);
  const expenses = await expensesService.getAll(userId);
  const products = await productsService.getAll(userId);

  // Calculate total revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  // Calculate inventory value (materials cost)
  const inventoryValue = materials.reduce((sum, material) =>
    sum + ((material.quantity || 0) * (material.costPrice || 0)), 0
  );

  // Get sales this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const salesThisMonth = sales.filter(sale => new Date(sale.date) >= firstDayOfMonth);
  const revenueThisMonth = salesThisMonth.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  // Calculate previous month for comparison
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const salesLastMonth = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= firstDayOfLastMonth && saleDate <= lastDayOfLastMonth;
  });
  const revenueLastMonth = salesLastMonth.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  const revenueChange = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
    : 0;

  // Calculate Gross Profit
  const totalCost = sales.reduce((sum, sale) => sum + (sale.costAmount || 0), 0);
  const grossProfit = totalRevenue - totalCost;
  // Net Profit = Gross Profit - Expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netProfit = grossProfit - totalExpenses;

  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return [
    {
      title: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      change: `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
      trend: revenueChange >= 0 ? 'up' as const : 'down' as const,
      iconName: 'TrendingUp',
    },
    {
      title: 'Total Expenses',
      value: `₦${totalExpenses.toLocaleString()}`,
      change: `${expenses.length} records`,
      trend: 'neutral' as const,
      iconName: 'TrendingDown',
    },
    {
      title: 'Gross Profit',
      value: `₦${grossProfit.toLocaleString()}`,
      change: 'Margin from Goods',
      trend: 'neutral' as const,
      iconName: 'DollarSign',
    },
    {
      title: 'Net Profit',
      value: `₦${netProfit.toLocaleString()}`,
      change: `${netMargin.toFixed(1)}% net margin`,
      trend: netMargin >= 10 ? 'up' as const : 'neutral' as const,
      iconName: 'Activity',
    },
    {
      title: 'Active Products',
      value: products.length.toString(),
      change: 'Catalog Size',
      trend: 'neutral' as const,
      iconName: 'Package',
    },
    {
      title: 'Inventory Value',
      value: `₦${inventoryValue.toLocaleString()}`,
      change: `${materials.length} raw materials`,
      trend: 'neutral' as const,
      iconName: 'Boxes',
    }
  ];
}

export async function getRevenueChartData() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const sales = await salesService.getAll(userId);

  // Group by month for the last 6 months
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      name: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      value: 0
    };
  }).reverse();

  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    const saleMonth = saleDate.getMonth();
    const saleYear = saleDate.getFullYear();

    const monthData = last6Months.find(m => m.monthIndex === saleMonth && m.year === saleYear);
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
