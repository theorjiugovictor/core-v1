/**
 * Unified AI provider.
 * Priority: AWS Bedrock → Google Gemini
 * Whichever credentials are present wins. If both are set, Bedrock runs first
 * and Gemini is used as a fallback on failure.
 */

import type { BedrockMessage, BedrockResponse } from './bedrock';

// Read at call time (not module init) so env vars are always current in serverless
function hasBedrock() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}
function hasGemini() {
  return !!process.env.GEMINI_API_KEY;
}

async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: (() => Promise<T>) | null,
  label: string,
): Promise<T> {
  if (hasBedrock()) {
    try {
      return await primary();
    } catch (err) {
      if (!fallback) throw err;
      console.warn(`[AI] Bedrock failed for ${label}, falling back to Gemini:`, err);
    }
  }
  if (fallback) return fallback();
  throw new Error(`[AI] No provider configured. Set AWS_ACCESS_KEY_ID or GEMINI_API_KEY in your environment.`);
}

export async function parseBusinessCommand(input: string) {
  return withFallback(
    async () => {
      const { parseBusinessCommand: bedrockParse } = await import('./bedrock');
      return bedrockParse(input);
    },
    hasGemini() ? async () => {
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
    hasGemini() ? async () => {
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
    hasGemini() ? async () => {
      const { generateBusinessInsights: geminiInsights } = await import('./gemini');
      return geminiInsights(businessData);
    } : null,
    'generateBusinessInsights',
  );
}
