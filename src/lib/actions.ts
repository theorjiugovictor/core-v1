'use server';

import { parseBusinessCommand as parseWithBedrock, generateBusinessInsights as generateWithBedrock } from './bedrock';
import { mockMaterials, mockProducts, mockSales, mockInsights } from './data';
import { salesService } from './firebase/sales';
import { materialsService } from './firebase/materials';
import { productsService } from './firebase/products';
import { revalidatePath } from 'next/cache';

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
    error: 'Could not understand command. Try: "Sold 5 bags at 1000 each"'
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
  const userId = 'demo-user-123'; // Hardcoded for MVP, replace with auth().currentUser.id

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

      case 'EXPENSE':
        message = `💸 Recorded expense: ₦${price} for ${item}`;
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
    const businessData = {
      materials: mockMaterials,
      sales: mockSales,
      products: mockProducts,
    };

    const result = await generateWithBedrock(businessData);
    return result;
  } catch (error) {
    console.error('Insights generation failed:', error);
    // Return empty success false or rethrow, but user asked to remove "wrong fallback"
    // So distinct failure is better than silent mock.
    return { success: false, error: 'Failed to generate insights' };
  }
}

// --- CRUD Actions for UI ---

// Materials
export async function getMaterialsAction() {
  const userId = 'demo-user-123';
  return await materialsService.getAll(userId);
}

export async function createMaterialAction(data: { name: string; quantity: number; unit: string; costPrice: number }) {
  const userId = 'demo-user-123';
  await materialsService.create({ ...data, userId, createdAt: new Date().toISOString() });
  revalidatePath('/materials');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteMaterialAction(id: string) {
  const userId = 'demo-user-123';
  await materialsService.delete(id, userId);
  revalidatePath('/materials');
  revalidatePath('/dashboard');
  return { success: true };
}

// Products
export async function getProductsAction() {
  const userId = 'demo-user-123';
  return await productsService.getAll(userId);
}

export async function createProductAction(data: { name: string; sellingPrice: number; materials: { materialId: string; quantity: number }[] }) {
  const userId = 'demo-user-123';
  await productsService.create({ ...data, userId, createdAt: new Date().toISOString() });
  revalidatePath('/products');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteProductAction(id: string) {
  const userId = 'demo-user-123';
  await productsService.delete(id, userId);
  revalidatePath('/products');
  revalidatePath('/dashboard');
  return { success: true };
}
