import 'server-only';

// Command execution for a known, already-authenticated user id.
// Lives outside actions.ts on purpose: everything exported from a 'use server'
// module becomes a callable server action, and this function trusts its userId.
// Callers must authenticate first (session for the web console, verified
// webhook signature + linked account for WhatsApp/Telegram).

import { parseBusinessCommand as parseWithAI, chatConversational } from './ai';
import type { BedrockMessage } from './bedrock';
import { salesService } from './firebase/sales';
import { materialsService } from './firebase/materials';
import { productsService } from './firebase/products';
import { usersService } from './firebase/users';
import { expensesService } from './firebase/expenses';
import { debtsService } from './firebase/debts';
import { revalidatePath } from 'next/cache';
import { parseNormalizedDate, periodStart, startOfBusinessDay, type Period } from './time';

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
export async function executeCommandForUser(
  userId: string,
  rawInput: string,
  conversationHistory: BedrockMessage[] = [],
) {
  let parsedResult;
  try {
    parsedResult = await parseWithAI(rawInput, conversationHistory);
    if (!parsedResult.success || !parsedResult.data) {
      throw new Error("AI parsing failed or returned no data");
    }
  } catch (error) {
    console.error('AI parsing failed, using fallback:', error);
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
        case 'CLARIFY': {
          // Parser determined it needs more info — return the question directly
          message = actionData.message || "Could you give me a bit more detail? e.g. the quantity and price.";
          break;
        }

        case 'SALE': {
          // Guard: missing price on a sale
          if (!price || price === 0) {
            message = actionData.message || `What price did you sell the ${item || 'item'} at? e.g. ₦2,000 each`;
            break;
          }
          const products = await productsService.getAll(userId);
          const materials = await materialsService.getAll(userId);
          const itemLower = (item || '').toLowerCase().trim();
          const singularItem = itemLower.replace(/es$/, 'e').replace(/s$/, '');

          const findProduct = () => products.find(p => {
            const name = p.name.toLowerCase().trim();
            return name === itemLower || name === singularItem || itemLower.startsWith(name) || (singularItem && name.startsWith(singularItem));
          });

          const findMaterial = () => materials.find(m => {
            const name = m.name.toLowerCase().trim();
            return name === itemLower || name === singularItem || itemLower.startsWith(name) || (singularItem && name.startsWith(singularItem));
          });

          const product = findProduct();
          const qty = quantity || 1;
          const hasRecipe = Boolean(product && product.materials && product.materials.length > 0);

          // ── Pre-sale stock validation (must happen before any DB write) ──
          if (hasRecipe) {
            for (const ingredient of product!.materials) {
              const mat = materials.find(m => m.id === ingredient.materialId);
              if (mat) {
                const needed = ingredient.quantity * qty;
                if (mat.quantity < needed) {
                  message = mat.quantity === 0
                    ? `${mat.name} is out of stock. Restock before selling.`
                    : `Not enough ${mat.name}: need ${needed} ${mat.unit}(s), only ${mat.quantity} in stock. Sale not recorded.`;
                  break;
                }
              }
            }
          } else {
            const directMat = findMaterial();
            if (directMat && directMat.quantity < qty) {
              message = directMat.quantity === 0
                ? `${directMat.name} is out of stock. Restock before selling.`
                : `Only ${directMat.quantity} ${directMat.unit}(s) of ${directMat.name} in stock. You tried to sell ${qty}. Sale not recorded.`;
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
            const directMat = findMaterial();
            if (directMat) unitCost = directMat.costPrice;
          }

          // ── Apply discount ──
          const discountPct: number = actionData.discount ?? 0;
          const unitPrice = price || product?.sellingPrice || 0;
          const finalUnitPrice = discountPct > 0 ? unitPrice * (1 - discountPct / 100) : unitPrice;
          const totalAmount = qty * finalUnitPrice;
          const discountNote = discountPct > 0
            ? ` (${discountPct}% discount, saved ₦${(qty * (unitPrice - finalUnitPrice)).toLocaleString()})`
            : '';

          // ── Record sale ──
          await salesService.create({
            userId,
            productName: product ? product.name : (item || 'Unknown Product'),
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
            message = `Sold ${qty}x ${product!.name} @ ₦${finalUnitPrice.toLocaleString()} (Ingredients deducted)${discountNote}`;
          } else {
            const material = findMaterial();
            if (material) {
              const remaining = material.quantity - qty;
              await materialsService.update(material.id, userId, { quantity: remaining });
              message = remaining === 0
                ? `Sold ${qty}x ${material.name}${discountNote}. ${material.name} is now out of stock — remember to restock.`
                : `Sold ${qty}x ${material.name} @ ₦${finalUnitPrice.toLocaleString()}${discountNote} (${remaining} ${material.unit}(s) remaining)`;
            } else {
              message = `Recorded sale: ${qty}x ${product ? product.name : item} @ ₦${finalUnitPrice.toLocaleString()}${discountNote}`;
            }
          }

          if (isCredit) {
            const customerName = actionData.customer || 'Customer';
            await debtsService.recordDebt({
              userId,
              customerName,
              amount: totalAmount,
              notes: `Credit sale of ${qty}x ${item}`,
            });
            message += ` Recorded unpaid debt for ${customerName}: ₦${totalAmount.toLocaleString()}`;
          }
          break;
        }

        case 'STOCK_IN': {
          const qty = quantity ?? 0;
          if (qty < 0) {
            message = `Cannot add negative quantity. To remove stock, say "Remove ${Math.abs(qty)} ${item}".`;
            break;
          }
          if (qty === 0) {
            message = `Quantity must be greater than 0.`;
            break;
          }
          const allMaterials = await materialsService.getAll(userId);
          const existingMaterial = allMaterials.find(m => m.name.toLowerCase().trim() === (item || '').toLowerCase().trim());
          if (!existingMaterial) {
            if (!price || price === 0) {
              message = `"${item}" is not in your inventory yet. What is the cost price per unit for ${item}? e.g. "Bought ${qty} ${item} at 5,000 cost each"`;
              break;
            }
            const newMat = await materialsService.create({
              userId,
              name: item?.trim() || 'New Item',
              quantity: qty,
              unit: 'unit',
              costPrice: price,
              createdAt: new Date().toISOString()
            });
            message = `Added new inventory item: ${newMat.name} (+${qty} in stock @ ₦${price.toLocaleString()}/unit)`;
            break;
          }
          const newQty = existingMaterial.quantity + qty;
          await materialsService.update(existingMaterial.id, userId, {
            quantity: newQty,
            costPrice: price || existingMaterial.costPrice
          });
          message = `Restocked ${existingMaterial.name}: +${qty} (now ${newQty} ${existingMaterial.unit}(s))`;
          break;
        }

        case 'CREATE_PRODUCT': {
          const newProductMaterials = [];
          let computedCost = 0;
          if (recipe && Array.isArray(recipe)) {
            const currentMaterials = await materialsService.getAll(userId);
            for (const ingredient of recipe) {
              if (!ingredient.item) continue;
              let matId = '';
              let unitCost = 0;
              const existingMat = currentMaterials.find(m => m.name.toLowerCase().trim() === ingredient.item.toLowerCase().trim());
              if (existingMat) {
                matId = existingMat.id;
                unitCost = existingMat.costPrice || 0;
              } else {
                const newMat = await materialsService.create({
                  userId, name: ingredient.item.trim(), quantity: 0,
                  unit: 'unit', costPrice: 0, createdAt: new Date().toISOString()
                });
                matId = newMat.id;
              }
              newProductMaterials.push({ materialId: matId, quantity: ingredient.quantity });
              computedCost += (ingredient.quantity || 1) * unitCost;
            }
          }
          const finalPrice = price || 0;
          await productsService.create({
            userId, name: item?.trim() || 'New Product', sellingPrice: finalPrice,
            costPrice: computedCost, materials: newProductMaterials, createdAt: new Date().toISOString()
          });
          const priceDisplay = finalPrice > 0 ? `@ ₦${finalPrice.toLocaleString()}` : '(price not set)';
          message = `Product created: ${item?.trim() || 'New Product'} ${priceDisplay}${newProductMaterials.length > 0 ? ` with ${newProductMaterials.length} ingredient(s)` : ''}`;
          break;
        }

        case 'STOCK_CHECK': {
          const stockMaterials = await materialsService.getAll(userId);
          const found = stockMaterials.find(m => m.name.toLowerCase().includes((item || '').toLowerCase()));
          if (!found) {
            message = `"${item}" not found in your inventory. Check spelling or go to Materials to add it.`;
          } else if (found.quantity === 0) {
            message = `${found.name} is out of stock (0 ${found.unit}s). Time to restock.`;
          } else {
            const threshold = found.lowStockThreshold ?? 5;
            const lowWarning = found.quantity <= threshold ? ` Running low — consider restocking soon.` : '';
            message = `${found.name}: ${found.quantity} ${found.unit}(s) in stock.${lowWarning}`;
          }
          break;
        }

        case 'LIST_INVENTORY': {
          const allStock = await materialsService.getAll(userId);
          if (allStock.length === 0) {
            message = `Your inventory is empty. Add materials via the Materials page or say "Create product [name]".`;
          } else {
            const lines = allStock.map(m => {
              const low = m.quantity <= (m.lowStockThreshold ?? 5) ? ' (low)' : '';
              return `• ${m.name}: ${m.quantity} ${m.unit}(s)${low}`;
            });
            message = `Inventory (${allStock.length} items):\n${lines.join('\n')}`;
          }
          break;
        }

        case 'LOW_STOCK': {
          const allItems = await materialsService.getAll(userId);
          const lowItems = allItems.filter(m => m.quantity <= (m.lowStockThreshold ?? 5));
          if (lowItems.length === 0) {
            message = `All items are sufficiently stocked. Nothing needs restocking right now.`;
          } else {
            const lines = lowItems.map(m =>
              `• ${m.name}: ${m.quantity} ${m.unit}(s)${m.quantity === 0 ? ' (out of stock)' : ''}`
            );
            message = `${lowItems.length} item(s) running low:\n${lines.join('\n')}`;
          }
          break;
        }

        case 'STOCK_REMOVE': {
          const qty = quantity ?? 0;
          if (qty <= 0) {
            message = `Quantity to remove must be greater than 0.`;
            break;
          }
          const allMats = await materialsService.getAll(userId);
          const target = allMats.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
          if (!target) {
            message = `"${item}" not found in inventory.`;
            break;
          }
          if (qty > target.quantity) {
            message = `Cannot remove ${qty} ${target.unit}(s) — only ${target.quantity} in stock.`;
            break;
          }
          const afterRemoval = target.quantity - qty;
          await materialsService.update(target.id, userId, { quantity: afterRemoval });
          const reason = actionData.reason ? ` (reason: ${actionData.reason})` : '';
          message = afterRemoval === 0
            ? `Removed ${qty}x ${target.name}${reason}. Stock is now 0 — out of stock.`
            : `Removed ${qty}x ${target.name}${reason}. Remaining: ${afterRemoval} ${target.unit}(s).`;
          break;
        }

        case 'STOCK_SET': {
          const newQty = quantity ?? 0;
          if (newQty < 0) {
            message = `Stock cannot be set to a negative number.`;
            break;
          }
          const allMats = await materialsService.getAll(userId);
          const target = allMats.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
          if (!target) {
            message = `"${item}" not found in inventory.`;
            break;
          }
          const diff = newQty - target.quantity;
          await materialsService.update(target.id, userId, { quantity: newQty });
          const diffNote = diff > 0 ? ` (+${diff} adjusted up)` : diff < 0 ? ` (${diff} adjusted down)` : ` (no change)`;
          message = `${target.name} stock corrected to ${newQty} ${target.unit}(s)${diffNote}.`;
          break;
        }

        case 'UPDATE_PRODUCT': {
          const allProducts = await productsService.getAll(userId);
          const prod = allProducts.find(p => p.name.toLowerCase() === (item || '').toLowerCase());
          if (!prod) {
            message = `Product "${item}" not found. Check the name or go to Products page.`;
            break;
          }
          await productsService.update(prod.id, userId, {
            name: prod.name,
            sellingPrice: price ?? prod.sellingPrice,
            costPrice: prod.costPrice,
            materials: prod.materials,
          });
          message = `${prod.name} selling price updated to ₦${(price ?? prod.sellingPrice).toLocaleString()}.`;
          break;
        }

        case 'DELETE_PRODUCT': {
          const allProducts = await productsService.getAll(userId);
          const prod = allProducts.find(p => p.name.toLowerCase() === (item || '').toLowerCase());
          if (!prod) {
            message = `Product "${item}" not found.`;
            break;
          }
          // Check for stock of any linked material
          const allMats = await materialsService.getAll(userId);
          const linkedWithStock = (prod.materials || [])
            .map(r => allMats.find(m => m.id === r.materialId))
            .filter(m => m && m.quantity > 0);
          if (linkedWithStock.length > 0) {
            const names = linkedWithStock.map(m => m!.name).join(', ');
            message = `Cannot delete "${prod.name}" — linked ingredients still have stock: ${names}. Clear the stock first or edit the recipe.`;
            break;
          }
          await productsService.delete(prod.id, userId);
          message = `Product "${prod.name}" deleted.`;
          break;
        }

        case 'EXPENSE': {
          if (!price || price === 0) {
            message = `How much did you spend on ${item || 'that'}? e.g. ₦3,000`;
            break;
          }
          const expenseCategory = actionData.category || 'General';
          await expensesService.create({
            userId, amount: price, description: item || 'Expense',
            category: expenseCategory, date: new Date().toISOString()
          });
          message = `Recorded: ₦${price.toLocaleString()} spent on ${item}${expenseCategory !== 'General' ? ` (${expenseCategory})` : ''}.`;
          break;
        }

        case 'PAY_DEBT': {
          const customer = actionData.customer || actionData.item;
          if (!customer) {
            message = `Whose debt payment are you recording? e.g. "Emeka paid ₦5,000"`;
            break;
          }
          if (!price || price <= 0) {
            message = `How much did ${customer} pay? e.g. "${customer} paid ₦5,000"`;
            break;
          }
          const payResult = await debtsService.recordPayment(userId, customer, price);
          message = payResult.message;
          break;
        }

        case 'DEBT_CHECK': {
          const customer = actionData.customer || actionData.item;
          if (customer) {
            const debt = await debtsService.getByCustomer(userId, customer);
            if (!debt || debt.amountOwed <= 0) {
              message = `${customer} has no outstanding debt balance.`;
            } else {
              message = `${debt.customerName} owes ₦${debt.amountOwed.toLocaleString()} (Original debt: ₦${debt.originalAmount.toLocaleString()}).`;
            }
          } else {
            const unpaid = await debtsService.getUnpaid(userId);
            if (unpaid.length === 0) {
              message = `Great news! No customers owe you money right now. All debts are clear.`;
            } else {
              const totalDebt = unpaid.reduce((sum, d) => sum + d.amountOwed, 0);
              const lines = unpaid.map(d => `• ${d.customerName}: ₦${d.amountOwed.toLocaleString()}`);
              message = `Outstanding Debt Balance (${unpaid.length} customer(s) - Total ₦${totalDebt.toLocaleString()}):\n${lines.join('\n')}`;
            }
          }
          break;
        }

        case 'PROFIT_QUERY': {
          const rawPeriod: string = actionData.period || 'today';
          const period: Period = (['today', 'week', 'month', 'all'] as const).includes(rawPeriod as Period)
            ? (rawPeriod as Period)
            : 'today';
          const start = periodStart(period);

          // Firestore sums these server-side; no need to download every sale.
          const [saleTotals, expenseTotals] = await Promise.all([
            salesService.getTotals(userId, start),
            expensesService.getTotal(userId, start),
          ]);

          const revenue = saleTotals.revenue;
          const cogs = saleTotals.cost;
          const expenseTotal = expenseTotals.total;
          const grossProfit = revenue - cogs;
          const netProfit = grossProfit - expenseTotal;

          const label = ({ today: 'Today', week: 'This Week', month: 'This Month', all: 'All Time' } as Record<string, string>)[period] ?? period;

          if (saleTotals.count === 0 && expenseTotals.count === 0) {
            message = `No sales or expenses recorded ${label.toLowerCase()} yet. Start by saying something like "Sold 5 bags of rice at ₦2,000 each".`;
          } else {
            const netLabel = netProfit >= 0 ? `Net Profit: ₦${netProfit.toLocaleString()}` : `Net Loss: ₦${Math.abs(netProfit).toLocaleString()}`;
            message = `${label} Summary\n• Revenue: ₦${revenue.toLocaleString()}\n• Cost of Goods: ₦${cogs.toLocaleString()}\n• Expenses: ₦${expenseTotal.toLocaleString()}\n• ${netLabel}`;
          }
          break;
        }

        case 'CHAT': {
          // Fetch live business data to ground the AI's response. Only the
          // last 90 days of sales are downloaded; all-time figures come from
          // Firestore aggregate queries.
          const now = new Date();
          const todayStart = periodStart('today', now)!;
          const weekStart = periodStart('week', now)!;
          const monthStart = periodStart('month', now)!;
          const recentStart = startOfBusinessDay(now, -89);

          const [chatMats, chatProds, recentSales, allTimeSales, allTimeExpenses] = await Promise.all([
            materialsService.getAll(userId),
            productsService.getAll(userId),
            salesService.getInRange(userId, recentStart),
            salesService.getTotals(userId),
            expensesService.getTotal(userId),
          ]);

          const since = (from: Date) => recentSales.filter(s => parseNormalizedDate(s.date) >= from);
          const todaySales = since(todayStart);
          const weekSales = since(weekStart);
          const monthSales = since(monthStart);

          const todayRevenue = todaySales.reduce((s, r) => s + (r.totalAmount || 0), 0);
          const weekRevenue  = weekSales.reduce((s, r) => s + (r.totalAmount || 0), 0);
          const monthRevenue = monthSales.reduce((s, r) => s + (r.totalAmount || 0), 0);
          const totalCogs    = allTimeSales.cost;
          const totalRev     = allTimeSales.revenue;
          const totalExp     = allTimeExpenses.total;

          const lowStock = chatMats.filter(m => m.quantity <= (m.lowStockThreshold ?? 5));

          // Top products by revenue over the last 90 days
          const revByProduct: Record<string, number> = {};
          recentSales.forEach(s => {
            revByProduct[s.productName] = (revByProduct[s.productName] || 0) + (s.totalAmount || 0);
          });
          const topProducts = Object.entries(revByProduct)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, rev]) => `${name} (₦${rev.toLocaleString()})`);

          const businessContext = [
            `INVENTORY (${chatMats.length} items):`,
            chatMats.slice(0, 20).map(m =>
              `- ${m.name}: ${m.quantity} ${m.unit}(s), cost ₦${m.costPrice}/unit`
            ).join('\n'),
            '',
            `LOW STOCK (${lowStock.length} items):`,
            lowStock.length > 0
              ? lowStock.map(m => `- ${m.name}: ${m.quantity} left (threshold ${m.lowStockThreshold ?? 5})`).join('\n')
              : '- None',
            '',
            `PRODUCTS / MENU (${chatProds.length} items):`,
            chatProds.slice(0, 15).map(p =>
              `- ${p.name}: sells @ ₦${p.sellingPrice}${p.costPrice ? `, cost ₦${p.costPrice}` : ''}`
            ).join('\n'),
            '',
            `SALES SUMMARY:`,
            `- Today: ₦${todayRevenue.toLocaleString()} (${todaySales.length} sales)`,
            `- This week: ₦${weekRevenue.toLocaleString()} (${weekSales.length} sales)`,
            `- This month: ₦${monthRevenue.toLocaleString()} (${monthSales.length} sales)`,
            `- All-time revenue: ₦${totalRev.toLocaleString()}, COGS: ₦${totalCogs.toLocaleString()}, gross profit: ₦${(totalRev - totalCogs).toLocaleString()}`,
            `- All-time expenses: ₦${totalExp.toLocaleString()}, net profit: ₦${(totalRev - totalCogs - totalExp).toLocaleString()}`,
            '',
            `TOP PRODUCTS BY REVENUE (LAST 90 DAYS):`,
            topProducts.length > 0 ? topProducts.map(p => `- ${p}`).join('\n') : '- No sales yet',
          ].join('\n');

          // Build the message thread: history + current user message
          const thread: BedrockMessage[] = [
            ...conversationHistory,
            { role: 'user', content: rawInput },
          ];

          const chatResponse = await chatConversational(thread, businessContext);
          message = chatResponse.content;
          break;
        }

        default:
          message = `Unknown action: ${action}`;
      }
      processedActions.push(message);
    }

    finalMessage = processedActions.join('\n');
    try {
      revalidatePath('/dashboard');
      revalidatePath('/materials');
      revalidatePath('/sales');
      revalidatePath('/products');
    } catch {
      // Non-fatal if called outside Next.js request context (e.g. messaging webhooks/crons)
    }

    return { success: true, message: finalMessage, data: actions };
  } catch (dbError) {
    console.error("Database execution failed:", dbError);
    return {
      success: false,
      error: `Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`
    };
  }
}
