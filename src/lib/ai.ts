/**
 * Unified AI provider.
 * Priority: AWS Bedrock → Google Gemini
 * Whichever credentials are present wins. If both are set, Bedrock runs first
 * and Gemini is used as a fallback on failure.
 */

import type { BedrockMessage, BedrockResponse } from './bedrock';
import { telemetry } from './telemetry';

// Read at call time (not module init) so env vars are always current in serverless
function hasBedrock() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}
function hasGemini() {
  return !!process.env.GEMINI_API_KEY;
}

async function withFallback<T>(
  bedrockFn: () => Promise<T>,
  geminiFn: (() => Promise<T>) | null,
  label: string,
): Promise<T> {
  const provider = (process.env.AI_PROVIDER || (hasGemini() ? 'gemini' : 'bedrock')).toLowerCase();
  const primary = provider === 'gemini' && geminiFn ? geminiFn : bedrockFn;
  const secondary = primary === geminiFn ? (hasBedrock() ? bedrockFn : null) : geminiFn;

  try {
    return await primary();
  } catch (err) {
    if (!secondary) throw err;
    console.warn(`[AI] Primary provider (${provider}) failed for ${label}, trying fallback:`, err);
    telemetry.error(`Primary AI provider failed for ${label} — trying fallback`, undefined, {
      'ai.provider': provider,
      'ai.label': label,
      'error.message': err instanceof Error ? err.message : String(err),
    });
    return await secondary();
  }
}

export async function parseBusinessCommand(input: string, history?: import('./bedrock').BedrockMessage[]) {
  return withFallback(
    async () => {
      const { parseBusinessCommand: bedrockParse } = await import('./bedrock');
      return bedrockParse(input, history);
    },
    hasGemini() ? async () => {
      const { parseBusinessCommand: geminiParse } = await import('./gemini');
      return geminiParse(input, history);
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
