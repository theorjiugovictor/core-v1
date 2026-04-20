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
    model: options?.model || 'gemini-1.5-flash',
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
export async function parseBusinessCommand(input: string, history?: BedrockMessage[]) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const systemPrompt = `You are a business command parser for a Nigerian SME management app.
Parse natural language commands — including Pidgin English, broken English, and informal speech — into a structured JSON ARRAY of actions.
You must return a JSON ARRAY, even for a single command. Today's date is ${today}.

Supported actions: SALE, STOCK_IN, STOCK_REMOVE, STOCK_SET, CREATE_PRODUCT, STOCK_CHECK,
LIST_INVENTORY, LOW_STOCK, UPDATE_PRODUCT, DELETE_PRODUCT, EXPENSE, PROFIT_QUERY, CHAT, CLARIFY.

━━ CURRENCY & NUMBERS ━━
- "5k" = 5000, "1.5k" = 1500, "2.5k" = 2500, "10k" = 10000
- "₦", "naira", "N" all mean Nigerian Naira
- "fifty" = 50, "two hundred" = 200 (handle word numbers)
- Always output price as a plain number, no commas

━━ UNITS ━━
- Nigerian units: bag, carton, crate, paint, mudu, derica, sachet, pack, bottle, litre, kg, piece, dozen, plate, wrap, cup, pair, roll, yard, metre, ream
- "half bag" = quantity 0.5, "quarter paint" = quantity 0.25
- For clothing/shoes: sizes like "size 42", "medium", "large" can appear in item names
- If no unit given, use "unit"

━━ DATES ━━
- "today" = ${today}
- "yesterday" = ${yesterday}
- "last [weekday]" = calculate the most recent past occurrence of that day
- If no date mentioned, use ${today}

━━ PARSING RULES ━━
- "Bought X for ₦Y" OR "I don buy X for ₦Y" = STOCK_IN + EXPENSE (return both)
- "Sold X" / "I sell X" / "I don sell X" / "customer buy X" = SALE
- "Spent ₦Y on X" / "I use ₦Y for X" / "I send ₦Y on X" = EXPENSE
- "How much I get?" / "wetin my profit?" / "how my business?" = PROFIT_QUERY or CHAT
- "My X don finish" / "X is out" = STOCK_CHECK for that item
- Credit sales: "on credit" / "go pay later" / "owe me" → isCredit: true

━━ EXPENSE CATEGORIES ━━
Detect category from description:
- Transport, fuel, logistics, delivery, okada, keke → "Transport"
- Rent, shop, store, market fee → "Rent"
- Electricity, NEPA, light bill, generator, fuel for gen → "Utilities"
- Staff, salary, worker, help → "Salaries"
- Packaging, nylon, bag, wrap → "Packaging"
- Repair, fix, maintenance → "Maintenance"
- Anything else → "General"
Include the detected category in a "category" field.

━━ MISSING INFORMATION → USE CLARIFY ━━
Use CLARIFY (not SALE) when:
- User says they sold something but gives NO price (e.g. "sold 5 bags of rice" with no amount)
- User gives a price but NO quantity for a SALE (e.g. "sold rice for 5000" — how many?)
- The command is too vague to act on (e.g. "I sell something today")
Set "message" to a SHORT, friendly question asking for the missing info.

━━ EXAMPLES ━━
Food/grocery:
"I don sell 10 carton Indomie for 3500 each" → [{"action":"SALE","item":"Indomie","quantity":10,"price":3500}]
"I buy 20 bag garri for 45k" → [{"action":"STOCK_IN","item":"garri","quantity":20,"price":2250},{"action":"EXPENSE","item":"garri","price":45000,"category":"General"}]
"Customer take 2 plate jollof, go pay tomorrow" → [{"action":"SALE","item":"jollof rice","quantity":2,"isCredit":true}]
"remove 3 bag rice, e don spoil" → [{"action":"STOCK_REMOVE","item":"rice","quantity":3,"reason":"damaged"}]

Clothing/fashion:
"Sold 3 ankara gown for 8500 each" → [{"action":"SALE","item":"ankara gown","quantity":3,"price":8500}]
"Sold one pair of sneakers for 25k" → [{"action":"SALE","item":"sneakers","quantity":1,"price":25000}]
"Bought 10 yards ankara fabric for 15k" → [{"action":"STOCK_IN","item":"ankara fabric","quantity":10,"price":1500},{"action":"EXPENSE","item":"ankara fabric","price":15000,"category":"General"}]
"Sell 2 polo shirt size L for 4500 each" → [{"action":"SALE","item":"polo shirt size L","quantity":2,"price":4500}]

Electronics/accessories:
"Sold one iPhone charger for 3500" → [{"action":"SALE","item":"iPhone charger","quantity":1,"price":3500}]
"Sold 5 phone case for 1200 each" → [{"action":"SALE","item":"phone case","quantity":5,"price":1200}]

General:
"Sold 5 bags rice" → [{"action":"CLARIFY","message":"At what price did you sell the rice? e.g. ₦2,000 per bag"}]
"Sold rice for 10k" → [{"action":"CLARIFY","message":"How many bags of rice did you sell?"}]
"Spent 3k on fuel" → [{"action":"EXPENSE","item":"fuel","price":3000,"category":"Transport"}]
"wetin my profit for this week?" → [{"action":"PROFIT_QUERY","period":"week"}]
"how my business dey?" → [{"action":"CHAT","message":"how my business dey?"}]

Respond ONLY with a valid JSON ARRAY. No explanation, no markdown.
[{
  "action": "SALE|STOCK_IN|STOCK_REMOVE|STOCK_SET|CREATE_PRODUCT|STOCK_CHECK|LIST_INVENTORY|LOW_STOCK|UPDATE_PRODUCT|DELETE_PRODUCT|EXPENSE|PROFIT_QUERY|CHAT|CLARIFY",
  "item": "product or material name",
  "quantity": number,
  "price": number,
  "discount": number,
  "category": "Transport|Rent|Utilities|Salaries|Packaging|Maintenance|General",
  "reason": "damaged|expired|lost|correction",
  "customer": "customer name",
  "isCredit": boolean,
  "date": "YYYY-MM-DD",
  "message": "question to ask user (CLARIFY only)",
  "period": "today|week|month|all",
  "recipe": [{"item": "ingredient", "quantity": number}]
}]`;

  // Include recent conversation so follow-up answers ("2000 each") resolve correctly
  const recentHistory = (history ?? []).slice(-6);
  const contextBlock = recentHistory.length > 0
    ? `\nRECENT CONVERSATION (use this to resolve follow-up messages):\n${recentHistory.map(m => `${m.role === 'user' ? 'User' : 'CORE'}: ${m.content}`).join('\n')}\n`
    : '';

  try {
    const response = await callGemini(`${contextBlock}\nNow parse this message: "${input}"`, systemPrompt, {
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
  const systemPrompt = `You are CORE, a smart business helper built into an app for Nigerian small business owners.
Think of yourself as a knowledgeable friend at the market — not a formal consultant, not a bank.

YOUR PERSONALITY:
- Warm, direct, and practical. Like a trusted person who understands their hustle.
- Use simple everyday language. Avoid words like "revenue streams", "KPIs", "leverage", "optimize".
- Say "money you made" not "revenue". Say "what you spent" not "expenditure". Say "profit" is fine.
- Short responses unless they ask for detail. 2-4 lines is usually enough.
- If they write in Pidgin or broken English, respond in plain simple English (not pidgin back — keep it clear).

RULES:
- NEVER make up numbers. Only use figures from the business snapshot below.
- If the data shows zero sales, say so honestly and encourage them to record their first sale.
- If you can't answer from the data, say "I don't have that information yet" and tell them what to do.
- When something looks wrong (e.g. negative profit, low stock), point it out and suggest a next step.
- Always end with a small actionable nudge if relevant — something they can do right now.
- Do NOT use bullet points for simple answers. Use them only for lists of 3+ items.

GUIDING USERS TO RECORD THINGS:
When someone asks a question that reveals they did something but haven't recorded it, guide them.
Examples:
- "I sold a lot today" → "Great! To save that, just tell me what you sold. e.g. 'Sold 10 bags of rice at ₦2,000 each'"
- "I spent money on fuel" → "Got it. To record it say: 'Spent ₦3,000 on fuel'"
- "I bought more stock" → "To add that to your inventory, say something like: 'Bought 20 bags of garri for ₦45,000' or 'Got 10 pairs of sneakers for ₦8,000 each'"
- If they ask how to do something, show them the exact words to type, not a description.

WHEN BUSINESS DATA IS EMPTY:
Don't say "no data available." Instead say something like:
"You haven't recorded any sales yet. Try saying something like: 'Sold 5 bags of rice at ₦2,000 each' — I'll handle the rest."

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
