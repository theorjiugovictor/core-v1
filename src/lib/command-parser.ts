/**
 * Enhanced command parser with Nigerian market patterns
 * Preprocessing layer before Genkit AI fallback
 */

// Common Nigerian business phrases
export const COMMAND_PATTERNS = {
  // Sales patterns
  SALE: [
    /^sold?\s+(\d+(?:\.\d+)?)\s+(.+?)\s+(?:at|@|for)\s*₦?\s*([\d,]+(?:\.\d{2})?)\s*(?:each|per)?/i,
    /^(\d+)\s+(.+?)\s+(?:sold|@)\s*₦?\s*([\d,]+)/i,
    // "5k" notation common in Nigeria
    /^sold?\s+(\d+)\s+(.+?)\s+(\d+(?:\.\d+)?)\s*k\s*(?:each)?/i,
  ],

  // Stock additions
  STOCK_IN: [
    /^(?:add|received?|bought)\s+(\d+(?:\.\d+)?)\s+(.+?)\s+(?:at|@|for)\s*₦?\s*([\d,]+)/i,
    /^(?:restock|new\s+stock)\s+(\d+)\s+(.+)/i,
  ],

  // Credit sales (critical for African retail)
  CREDIT: [
    /sold?.+to\s+(.+?)\s+on\s+credit/i,
    /sold?.+(.+?)\s+(?:will\s+pay|owes?)/i,
  ],

  // Expense tracking
  EXPENSE: [
    /^(?:paid|spent)\s+₦?\s*([\d,]+)\s+(?:for|on)\s+(.+)/i,
    /^expense\s*:?\s*₦?\s*([\d,]+)\s+(.+)/i,
  ],
};

// Currency normalization for Nigerian Naira
export function normalizeNaira(input: string): string {
  return input
    .replace(/\b(\d+(?:\.\d+)?)\s*k\b/gi, (_, num) => String(parseFloat(num) * 1000))
    .replace(/naira|ngn/gi, '₦')
    .replace(/\s*₦\s*/g, '₦');
}

// Fuzzy product matching
import Fuse from 'fuse.js';

export function findProduct(
  query: string,
  products: Array<{ name: string; aliases?: string[]; id: string }>
): { product: any; confidence: number } | null {
  const fuse = new Fuse(products, {
    keys: ['name', 'aliases'],
    threshold: 0.3, // 70% match required
    includeScore: true,
  });

  const results = fuse.search(query);

  if (results.length === 0) return null;

  return {
    product: results[0].item,
    confidence: 1 - (results[0].score || 0),
  };
}

// Main parser
export async function parseCommand(input: string, products: any[]) {
  const normalized = normalizeNaira(input.toLowerCase().trim());

  // Try regex patterns first (fast, no API cost)
  for (const [intent, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        // Extract entities based on intent
        const entities = extractEntities(match, intent, products);
        if (entities) {
          return {
            intent,
            entities,
            confidence: 0.9,
            method: 'regex',
          };
        }
      }
    }
  }

  // Fallback to Genkit AI for complex cases
  return parseWithAI(input);
}

function extractEntities(match: RegExpMatchArray, intent: string, products: any[]) {
  switch (intent) {
    case 'SALE':
      const [_, qty, productName, price] = match;
      const productMatch = findProduct(productName, products);

      if (!productMatch) return null;

      return {
        quantity: parseFloat(qty),
        product: productMatch.product,
        unit_price: parseFloat(price.replace(/,/g, '')),
        total: parseFloat(qty) * parseFloat(price.replace(/,/g, '')),
      };

    // Handle other intents...
    default:
      return null;
  }
}
