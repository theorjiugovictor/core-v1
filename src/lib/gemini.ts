import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BedrockMessage, BedrockResponse } from './bedrock';

function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Call Google Gemini — drop-in equivalent of callBedrock.
 * Gemini roles: 'user' | 'model' (not 'assistant')
 */
export async function callGemini(
  prompt: string,
  systemPrompt?: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    messages?: BedrockMessage[];
  }
): Promise<BedrockResponse> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: options?.model || 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: options?.maxTokens || 1000,
      temperature: options?.temperature ?? 0.7,
    },
  });

  // Multi-turn: convert history and send last message via chat
  if (options?.messages && options.messages.length > 0) {
    const allMessages = options.messages;
    const history = allMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMessage = allMessages[allMessages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    return { content: result.response.text() };
  }

  // Single-turn
  const result = await model.generateContent(prompt);
  return { content: result.response.text() };
}

/** Parse business command — same interface as bedrock.parseBusinessCommand */
export async function parseBusinessCommand(input: string) {
  const systemPrompt = `You are a business command parser for a Nigerian SME management app.
Parse natural language commands into a structured JSON ARRAY of actions.
You must return a JSON ARRAY, even for a single command.

Supported actions: SALE, STOCK_IN, STOCK_REMOVE, STOCK_SET, CREATE_PRODUCT, STOCK_CHECK,
LIST_INVENTORY, LOW_STOCK, UPDATE_PRODUCT, DELETE_PRODUCT, EXPENSE, PROFIT_QUERY, CHAT, CLARIFY.

IMPORTANT RULES:
- "Bought X bags of rice for ₦Y" = BOTH STOCK_IN AND EXPENSE. Return BOTH.
- "Spent ₦Y on fuel/transport/rent/electricity" = EXPENSE only.
- Nigerian currency: "5k" = 5000, "45k each" = 45000 per unit, ₦ or "naira" = Nigerian Naira.
- Nigerian units: derica, mudu, paint, bottle, sachet, pack, carton, bag, kg, litre.
- Nigerian products: Indomie, Golden Penny flour, Dangote sugar, semovita, garri, groundnut oil, palm oil.

Respond ONLY with a JSON ARRAY:
[{
  "action": "SALE|STOCK_IN|STOCK_REMOVE|STOCK_SET|CREATE_PRODUCT|STOCK_CHECK|LIST_INVENTORY|LOW_STOCK|UPDATE_PRODUCT|DELETE_PRODUCT|EXPENSE|PROFIT_QUERY|CHAT|CLARIFY",
  "item": "product or material name",
  "quantity": number,
  "price": number,
  "discount": number,
  "reason": "damaged|expired|lost|correction",
  "customer": "customer name",
  "isCredit": boolean,
  "date": "YYYY-MM-DD",
  "message": "for CHAT or CLARIFY",
  "period": "today|week|month|all",
  "recipe": [{"item": "ingredient", "quantity": number}]
}]`;

  try {
    const response = await callGemini(`Parse this command: "${input}"`, systemPrompt, {
      maxTokens: 1000,
      temperature: 0.1,
    });

    let jsonContent = response.content.trim();
    const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonContent = jsonMatch[0];

    const parsed = JSON.parse(jsonContent);
    const data = Array.isArray(parsed) ? parsed : [parsed];

    return { success: true, data };
  } catch (error) {
    console.error('Gemini command parsing error:', error);
    return { success: false, error: 'Could not parse command. Please try rephrasing.' };
  }
}

/** Conversational chat with business context — same interface as bedrock.chatConversational */
export async function chatConversational(
  messages: BedrockMessage[],
  businessContext: string,
): Promise<BedrockResponse> {
  const systemPrompt = `You are CORE, an AI business advisor built into a Nigerian SME management app called CORE Biz Manager.
You are talking directly to the business owner. Be helpful, practical, and concise.
Use ₦ for all currency. Avoid jargon — this is a small business owner, not an accountant.
Do NOT make up data. Only use numbers that appear in the business snapshot below.
If you cannot answer something from the data, say so and suggest what action they could take.

LIVE BUSINESS SNAPSHOT:
${businessContext}`;

  return callGemini('', systemPrompt, { maxTokens: 800, temperature: 0.75, messages });
}

/** Generate business insights — same interface as bedrock.generateBusinessInsights */
export async function generateBusinessInsights(businessData: {
  materials: any[];
  sales: any[];
  products: any[];
}) {
  const systemPrompt = `You are a business advisor for Nigerian SMEs. Respond with ONLY a valid JSON array.
Do NOT include any text outside the JSON. Start with [ and end with ].
Each object: { "message": string, "relevanceScore": number between 0 and 1 }`;

  const prompt = `Analyze this data and return ONLY a JSON array of 3-5 insights:
Materials: ${JSON.stringify(businessData.materials)}
Sales: ${JSON.stringify(businessData.sales)}
Products: ${JSON.stringify(businessData.products)}`;

  try {
    const response = await callGemini(prompt, systemPrompt, { maxTokens: 1500, temperature: 0.7 });

    let jsonContent = response.content.trim();
    const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonContent = jsonMatch[0];

    const insights = JSON.parse(jsonContent);
    if (!Array.isArray(insights)) throw new Error('Response is not an array');

    return { success: true, data: insights };
  } catch (error) {
    console.error('Gemini insights error:', error);
    return { success: false, error: 'Could not generate insights. Please try again.' };
  }
}
