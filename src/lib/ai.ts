/**
 * Unified AI provider.
 * Priority: AWS Bedrock → Google Gemini
 * Whichever credentials are present wins. If both are set, Bedrock runs first
 * and Gemini is used as a fallback on failure.
 */

import type { BedrockMessage, BedrockResponse } from './bedrock';

const HAS_BEDROCK = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
const HAS_GEMINI  = !!process.env.GEMINI_API_KEY;

if (!HAS_BEDROCK && !HAS_GEMINI) {
  console.warn('[AI] No provider configured. Set AWS_ACCESS_KEY_ID or GEMINI_API_KEY.');
}

async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: (() => Promise<T>) | null,
  label: string,
): Promise<T> {
  if (HAS_BEDROCK) {
    try {
      return await primary();
    } catch (err) {
      if (!fallback) throw err;
      console.warn(`[AI] Bedrock failed for ${label}, falling back to Gemini:`, err);
    }
  }
  if (fallback) return fallback();
  throw new Error(`[AI] No provider available for ${label}`);
}

export async function parseBusinessCommand(input: string) {
  return withFallback(
    async () => {
      const { parseBusinessCommand: bedrockParse } = await import('./bedrock');
      return bedrockParse(input);
    },
    HAS_GEMINI ? async () => {
      const { parseBusinessCommand: geminiParse } = await import('./gemini');
      return geminiParse(input);
    } : null,
    'parseBusinessCommand',
  );
}

export async function chatConversational(
  messages: BedrockMessage[],
  businessContext: string,
): Promise<BedrockResponse> {
  return withFallback(
    async () => {
      const { chatConversational: bedrockChat } = await import('./bedrock');
      return bedrockChat(messages, businessContext);
    },
    HAS_GEMINI ? async () => {
      const { chatConversational: geminiChat } = await import('./gemini');
      return geminiChat(messages, businessContext);
    } : null,
    'chatConversational',
  );
}

export async function generateBusinessInsights(businessData: {
  materials: any[];
  sales: any[];
  products: any[];
}) {
  return withFallback(
    async () => {
      const { generateBusinessInsights: bedrockInsights } = await import('./bedrock');
      return bedrockInsights(businessData);
    },
    HAS_GEMINI ? async () => {
      const { generateBusinessInsights: geminiInsights } = await import('./gemini');
      return geminiInsights(businessData);
    } : null,
    'generateBusinessInsights',
  );
}
