'use server';

import { parseBusinessCommand as parseWithBedrock, generateBusinessInsights as generateWithBedrock } from './bedrock';
import { salesService } from './firebase/sales';
import { materialsService } from './firebase/materials';
import { productsService } from './firebase/products';
import { usersService } from './firebase/users';
import { revalidatePath } from 'next/cache';
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

    return {
      success: true,
      data: {
        action,
        item: item.trim(),
        quantity: parseInt(quantity),
        price: parseFloat(price.replace(/,/g, '')),
        date: new Date().toISOString().split('T')[0]
      }
    };
  }

  // Product creation pattern: "create product fried rice selling at 1500"
  const productPattern = /(?:create\s+product|new\s+product)\s+(.+?)\s+(?:selling\s+)?(?:at|@|for)\s*(?:₦|naira)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
  const productMatch = normalized.match(productPattern);

  if (productMatch) {
    const [_, item, price] = productMatch;
    return {
      success: true,
      data: {
        action: 'CREATE_PRODUCT',
        item: item.trim(),
        quantity: 0,
        price: parseFloat(price.replace(/,/g, '')),
        date: new Date().toISOString().split('T')[0]
      }
    };
  }

  // Stock check: "how many bags of rice?"
  if (normalized.includes('how many') || normalized.includes('check stock') || normalized.includes('count')) {
    return {
      success: true,
      data: {
        action: 'STOCK_CHECK',
        item: normalized.replace('how many', '').replace('check stock', '').replace('count', '').trim(),
        quantity: 0,
        price: 0
      }
    }
  }

  return {
    success: false,
    error: 'Could not understand command. Try: "Sold 5 bags at 1000 each" or "Create product fried rice at 1500"'
  };
}

export async function processBusinessCommand(input: ParseBusinessCommandInput) {
  let parsedResult;

  try {
    // Try Bedrock first
    parsedResult = await parseWithBedrock(input.input);
    if (!parsedResult.success) {
      throw new Error("Bedrock parsing failed");
    }
  } catch (error) {
    console.error('Bedrock parsing failed, using fallback:', error);
    parsedResult = parseCommandWithRegex(input.input);
  }

  if (!parsedResult.success || !parsedResult.data) {
    return { success: false, error: parsedResult.error || "Could not parse command." };
  }

  const { action, item, quantity, price, customer, isCredit } = parsedResult.data;

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please log in." };
  }
  const userId = session.user.id;

  try {
    let message = "";

    switch (action) {
      case 'SALE':
        // 1. Record Sale
        await salesService.create({
          userId,
          productName: item || 'Unknown Product',
          quantity: quantity || 1,
          totalAmount: (quantity || 1) * (price || 0),
          paymentMethod: isCredit ? 'Transfer' : 'Cash',
          date: new Date().toISOString()
        });

        // 2. Update Inventory (Smart Depletion)
        const products = await productsService.getAll(userId);
        const product = products.find(p => p.name.toLowerCase() === (item || '').toLowerCase());

        const materials = await materialsService.getAll(userId);

        if (product && product.materials) {
          // It's a product with a recipe - deplete ingredients
          for (const ingredient of product.materials) {
            const material = materials.find(m => m.id === ingredient.materialId);
            if (material) {
              const qtyToDeduct = ingredient.quantity * (quantity || 1);
              await materialsService.update(material.id, userId, {
                quantity: Math.max(0, material.quantity - qtyToDeduct)
              });
            }
          }
          message = `✅ Recorded sale: ${quantity}x ${item}. Deducted ingredients from stock.`;
        } else {
          // Check if it's a direct material sale (e.g. selling a bag of cement)
          const material = materials.find(m => m.name.toLowerCase() === (item || '').toLowerCase());
          if (material) {
            await materialsService.update(material.id, userId, {
              quantity: Math.max(0, material.quantity - (quantity || 1))
            });
            message = `✅ Recorded sale: ${quantity}x ${item}. Deducted directly from stock.`;
          } else {
            message = `✅ Recorded sale: ${quantity}x ${item}. Note: Item not found in inventory, stock not deducted.`;
          }
        }
        revalidatePath('/dashboard');
        revalidatePath('/materials');
        revalidatePath('/sales');
        break;

      case 'STOCK_IN':
        // 1. Check if material exists
        const allMaterials = await materialsService.getAll(userId);
        const existingMaterial = allMaterials.find(m => m.name.toLowerCase() === (item || '').toLowerCase());

        if (existingMaterial) {
          await materialsService.update(existingMaterial.id, userId, {
            quantity: existingMaterial.quantity + (quantity || 0),
            costPrice: price || existingMaterial.costPrice
          });
          message = `📦 Updated stock: ${existingMaterial.name} +${quantity} (Total: ${existingMaterial.quantity + (quantity || 0)})`;
        } else {
          await materialsService.create({
            userId,
            name: item || 'New Item',
            quantity: quantity || 0,
            unit: 'unit',
            costPrice: price || 0,
            createdAt: new Date().toISOString()
          });
          message = `📦 Created new material: ${quantity}x ${item}`;
        }
        revalidatePath('/dashboard');
        revalidatePath('/materials');
        break;

      case 'STOCK_CHECK':
        const currentMaterials = await materialsService.getAll(userId);
        const found = currentMaterials.find(m => m.name.toLowerCase().includes((item || '').toLowerCase()));
        if (found) {
          message = `🔎 Stock Check: We have ${found.quantity} ${found.unit}s of ${found.name}.`;
        } else {
          message = `⚠️ Item '${item}' not found in inventory.`;
        }
        break;

      case 'CREATE_PRODUCT':
        // Create a new product
        await productsService.create({
          userId,
          name: item || 'New Product',
          sellingPrice: price || 0,
          materials: [], // Empty materials array, user can add recipe later
          createdAt: new Date().toISOString()
        });
        message = `✨ Created new product: ${item} (Selling price: ₦${price})`;
        revalidatePath('/dashboard');
        revalidatePath('/products');
        break;

      case 'EXPENSE':
        message = `💸 Recorded expense: ₦${price} for ${item}`;
        break;

      case 'CHAT':
        message = parsedResult.data.message || "I'm listening.";
        break;

      case 'CLARIFY':
        message = parsedResult.data.message || "Could you please clarify?";
        break;

      default:
        message = `Command understood (${action}) but logic not implemented yet.`;
    }

    return { success: true, message, data: parsedResult.data };

  } catch (dbError) {
    console.error("Database execution failed:", dbError);
    console.error("Error details:", {
      name: dbError instanceof Error ? dbError.name : 'Unknown',
      message: dbError instanceof Error ? dbError.message : String(dbError),
      stack: dbError instanceof Error ? dbError.stack : undefined,
    });
    return {
      success: false,
      error: `Failed to execute command in database: ${dbError instanceof Error ? dbError.message : String(dbError)}`
    };
  }
}

export async function getBusinessInsights() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    const userId = session.user.id;

    // Fetch real data from Firebase
    const materials = await materialsService.getAll(userId);
    const sales = await salesService.getAll(userId);
    const products = await productsService.getAll(userId);

    const businessData = {
      materials,
      sales,
      products,
    };

    const result = await generateWithBedrock(businessData);
    return result;
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

export async function createProductAction(data: { name: string; sellingPrice: number; materials: { materialId: string; quantity: number }[] }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;
  await productsService.create({ ...data, userId, createdAt: new Date().toISOString() });
  revalidatePath('/products');
  revalidatePath('/dashboard');
  return { success: true };
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

// KPIs
export async function getKpisAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const materials = await materialsService.getAll(userId);
  const sales = await salesService.getAll(userId);
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

  return [
    {
      title: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      change: `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
      trend: revenueChange >= 0 ? 'up' as const : 'down' as const,
      iconName: 'DollarSign',
    },
    {
      title: 'Active Products',
      value: products.length.toString(),
      change: 'Catalog',
      trend: 'neutral' as const,
      iconName: 'Package',
    },
    {
      title: 'Inventory Value',
      value: `₦${inventoryValue.toLocaleString()}`,
      change: `${materials.length} items`,
      trend: 'neutral' as const,
      iconName: 'TrendingUp',
    },
    {
      title: 'Total Sales',
      value: sales.length.toString(),
      change: `${salesThisMonth.length} this month`,
      trend: salesThisMonth.length > salesLastMonth.length ? 'up' as const : 'down' as const,
      iconName: 'TrendingDown',
    },
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
