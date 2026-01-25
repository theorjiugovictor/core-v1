'use server';

import { parseBusinessCommand as parseWithBedrock, generateBusinessInsights as generateWithBedrock } from './bedrock';
import { mockMaterials, mockProducts, mockSales } from './data';

export type ParseBusinessCommandInput = {
  input: string;
};

// Fallback regex-based parser for when Bedrock is unavailable
function parseCommandWithRegex(input: string) {
  const normalized = input.toLowerCase().trim();

  // Sale pattern: "sold 5 bags at 1000 each" or "add 10 cartons at 100 naira"
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

  // Expense pattern: "paid 1500 for transport"
  const expensePattern = /(?:paid|spent)\s*(?:₦|naira)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:for|on)\s+(.+)/i;
  const expenseMatch = normalized.match(expensePattern);

  if (expenseMatch) {
    const [_, amount, description] = expenseMatch;
    return {
      success: true,
      data: {
        action: 'EXPENSE',
        item: description.trim(),
        price: parseFloat(amount.replace(/,/g, '')),
        date: new Date().toISOString().split('T')[0]
      }
    };
  }

  return {
    success: false,
    error: 'Could not understand command. Try: "Add 10 cartons of milk at 100 each" or "Sold 5 bags at 1000 each"'
  };
}

export async function getParsedCommand(input: ParseBusinessCommandInput) {
  try {
    // Try Bedrock first
    const result = await parseWithBedrock(input.input);
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.error('Bedrock parsing failed, using fallback:', error);
  }

  // Fallback to regex parser
  return parseCommandWithRegex(input.input);
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
    console.error('Insights generation error:', error);
    return {
      success: false,
      error: 'Failed to generate insights. Please ensure AWS Bedrock is configured.'
    };
  }
}
