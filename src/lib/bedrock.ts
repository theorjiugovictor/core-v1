import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Initialize AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BedrockResponse {
  content: string;
  stopReason?: string;
}

/**
 * Call AWS Bedrock with Claude 3 Haiku (cost-effective model)
 */
export async function callBedrock(
  prompt: string,
  systemPrompt?: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    /** Override the default single-turn messages with a full conversation history */
    messages?: BedrockMessage[];
  }
): Promise<BedrockResponse> {
  const modelId = options?.model || 'anthropic.claude-3-haiku-20240307-v1:0';

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.7,
    system: systemPrompt || 'You are a helpful AI assistant for a Nigerian business management app.',
    messages: options?.messages ?? [{ role: 'user', content: prompt }],
  };

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 8000); // 8s timeout per attempt

    try {
      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await bedrockClient.send(command, { abortSignal: abortController.signal });
      clearTimeout(timeoutId);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        content: responseBody.content[0].text,
        stopReason: responseBody.stop_reason,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      attempt++;
      console.warn(`Bedrock API attempt ${attempt} failed:`, error.message);

      const isThrottling = error.name === 'ThrottlingException' || error.message?.includes('Too many requests');
      const isTimeout = error.name === 'AbortError';

      if (attempt >= maxRetries || (!isThrottling && !isTimeout)) {
        console.error('Bedrock API Error:', error);
        throw new Error('Failed to call AWS Bedrock after retries');
      }

      // Exponential backoff with jitter: 2^attempt * 1000ms + random jitter
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Failed to call AWS Bedrock');
}

/**
 * Parse business command using Bedrock Claude
 */
/**
 * Parse business command using Bedrock Claude
 */
export async function parseBusinessCommand(input: string, history?: BedrockMessage[]) {
  const systemPrompt = `You are a business command parser for a Nigerian SME management app.
Parse natural language commands into a structured JSON ARRAY of actions.
You must return a JSON ARRAY, even for a single command.

Supported actions:
- SALE: Record a sale. Supports optional discount (percentage).
- STOCK_IN: Add stock to an existing inventory item. Used when restocking.
- STOCK_REMOVE: Remove stock (damaged, expired, lost, adjustment down).
- STOCK_SET: Set inventory to an exact quantity (manual correction/audit).
- CREATE_PRODUCT: Create a new product or material. CAN include recipe.
- STOCK_CHECK: Check stock level of a specific item.
- LIST_INVENTORY: Show all inventory items and their quantities.
- LOW_STOCK: Show items that are running low in stock.
- UPDATE_PRODUCT: Update a product's selling price or cost price.
- DELETE_PRODUCT: Delete a product (will warn if stock exists).
- EXPENSE: Record a business expense (non-inventory spend like transport, electricity, rent).
- PROFIT_QUERY: User wants to know their profit, revenue, or financial summary for a period. Fields: period ("today"|"week"|"month"|"all").
- CHAT: General conversation or questions that are NOT financial summaries.
- CLARIFY: Intent is ambiguous or missing critical info.

IMPORTANT RULES:
- "Bought X bags of rice for ₦Y" = BOTH a STOCK_IN (inventory restocked) AND an EXPENSE (money spent). Return BOTH actions.
- "Spent ₦Y on fuel/transport/rent/electricity" = EXPENSE only (not inventory).
- Natural language variations for STOCK_IN: "put in stock", "received", "got", "restocked", "added to inventory" → all map to STOCK_IN.
- Natural language variations for STOCK_REMOVE: "damaged", "expired", "spoiled", "remove", "wrote off", "lost" → all map to STOCK_REMOVE.
- Natural language variations for STOCK_SET: "actual stock is X", "correct stock to X", "set X to Y bags" → STOCK_SET.
- "How many", "check stock", "how much", "count" → STOCK_CHECK.
- "Show all inventory", "full stock list", "what's in stock", "inventory status" → LIST_INVENTORY.
- "Low stock", "what needs restocking", "running low", "items below threshold" → LOW_STOCK.

Nigerian currency patterns:
- "5k" = 5000 Naira
- "45k each" = 45000 per unit
- ₦ or "naira" = Nigerian Naira
- "250k" = 250000

Nigerian local measurement units (use as the unit field):
- "derica" or "derica cup" = derica
- "mudu" = mudu
- "paint" or "paint tin" = paint
- "bottle", "sachet", "pack", "carton", "bag", "kg", "litre" = use as-is

Nigerian product recognition — spell these correctly:
- Food: Indomie, Golden Penny flour, Dangote sugar, semovita, garri, eba, akamu, beans, groundnut oil, palm oil, zobo, kunu, chin chin, puff puff, suya, kilishi
- Clothing/fashion: ankara, aso-ebi, agbada, buba, iro, wrapper, lace fabric, Senator material, polo shirt, jeans, gown, sneakers, slippers, sandals, shoes
- Electronics: phone charger, earpiece, power bank, screen protector, phone case, cable, adapter
- Cosmetics: hair cream, body lotion, pomade, weave, hair extensions, lace wig, relaxer
- Stationery/general: exercise book, biro, ream of paper, nylon bag, sachet water, pure water

Respond ONLY with a JSON ARRAY of objects in this format:
[
  {
    "action": "SALE|STOCK_IN|STOCK_REMOVE|STOCK_SET|CREATE_PRODUCT|STOCK_CHECK|LIST_INVENTORY|LOW_STOCK|UPDATE_PRODUCT|DELETE_PRODUCT|EXPENSE|PROFIT_QUERY|CHAT|CLARIFY",
    "item": "product or material name",
    "quantity": number,
    "price": number,
    "discount": number (percentage, e.g. 10 means 10% off — only for SALE),
    "reason": "damaged|expired|lost|correction (only for STOCK_REMOVE)",
    "customer": "customer name (for credit sales)",
    "isCredit": boolean,
    "date": "YYYY-MM-DD",
    "message": "Response text for CHAT or CLARIFY",
    "recipe": [ {"item": "ingredient name", "quantity": number} ]
  }
]

Examples:
Input: "Sold 5 Rice at 2000 and 3 Beans at 1500"
Output: [{"action":"SALE","item":"Rice","quantity":5,"price":2000},{"action":"SALE","item":"Beans","quantity":3,"price":1500}]

Input: "Sold 10 bags rice at ₦28,000 each, 10% discount"
Output: [{"action":"SALE","item":"rice","quantity":10,"price":28000,"discount":10}]

Input: "Bought 20 bags of rice for ₦500,000 from ABC Suppliers"
Output: [{"action":"STOCK_IN","item":"rice","quantity":20,"price":25000},{"action":"EXPENSE","item":"Rice purchase from ABC Suppliers","price":500000}]

Input: "Spent ₦5,000 on fuel"
Output: [{"action":"EXPENSE","item":"fuel","price":5000}]

Input: "3 bags of rice are damaged, remove from stock"
Output: [{"action":"STOCK_REMOVE","item":"rice","quantity":3,"reason":"damaged"}]

Input: "Actual rice stock is 15, not 20"
Output: [{"action":"STOCK_SET","item":"rice","quantity":15}]

Input: "Show all inventory"
Output: [{"action":"LIST_INVENTORY"}]

Input: "What items are low in stock?"
Output: [{"action":"LOW_STOCK"}]

Input: "How much profit did I make today?"
Output: [{"action":"PROFIT_QUERY","period":"today"}]

Input: "What's my revenue this week?"
Output: [{"action":"PROFIT_QUERY","period":"week"}]

Input: "Show me this month's summary"
Output: [{"action":"PROFIT_QUERY","period":"month"}]

Input: "Update rice price to ₦27,000"
Output: [{"action":"UPDATE_PRODUCT","item":"rice","price":27000}]

Input: "Put 10 derica of garri in stock"
Output: [{"action":"STOCK_IN","item":"garri","quantity":10,"unit":"derica"}]

Input: "Create Meatpie at 500 using 0.2kg flour and 1 egg"
Output: [{"action":"CREATE_PRODUCT","item":"Meatpie","price":500,"recipe":[{"item":"flour","quantity":0.2},{"item":"egg","quantity":1}]}]
`;

  const recentHistory = (history ?? []).slice(-6);
  const contextBlock = recentHistory.length > 0
    ? `\nRECENT CONVERSATION (use this to resolve follow-up messages):\n${recentHistory.map(m => `${m.role === 'user' ? 'User' : 'CORE'}: ${m.content}`).join('\n')}\n`
    : '';

  const prompt = `${contextBlock}\nNow parse this message: "${input}"`;

  try {
    const response = await callBedrock(prompt, systemPrompt, {
      maxTokens: 1000,
      temperature: 0.1,
    });

    // Extract JSON array
    let jsonContent = response.content.trim();
    const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonContent);

    // Ensure it is an array
    const data = Array.isArray(parsed) ? parsed : [parsed];

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Command parsing error:', error);
    return {
      success: false,
      error: 'Could not parse command. Please check your connection or try rephrasing.',
    };
  }
}

/**
 * Multi-turn conversational chat with live business context injected into the system prompt.
 * Used for CHAT / CLARIFY actions and any follow-up questions the user asks.
 */
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
${businessContext}

You can help with:
- Reading and explaining their sales, profit, and expenses
- Spotting trends or problems in their data (e.g. low stock, thin margins)
- Pricing advice, restocking priorities, product profitability
- General business questions and casual conversation
- Explaining what a command just did and what it means for the business`;

  return callBedrock('', systemPrompt, {
    maxTokens: 800,
    temperature: 0.75,
    messages,
  });
}

/**
 * Generate business insights using Bedrock
 */
export async function generateBusinessInsights(businessData: {
  materials: any[];
  sales: any[];
  products: any[];
}) {
  const systemPrompt = `You are a business advisor for Nigerian SMEs. You MUST respond with ONLY a valid JSON array.
DO NOT include any text, commentary, or explanations outside the JSON.
DO NOT write "Here are the insights" or any other prose.
Your response must start with [ and end with ].

Each insight object must have:
- "message": string (specific, actionable advice)
- "relevanceScore": number between 0 and 1`;

  const prompt = `Analyze this business data and return ONLY a JSON array of 3-5 insights:

Materials: ${JSON.stringify(businessData.materials, null, 2)}
Sales: ${JSON.stringify(businessData.sales, null, 2)}
Products: ${JSON.stringify(businessData.products, null, 2)}

Response format (ONLY THIS, NO OTHER TEXT):
[
  {"message": "insight text", "relevanceScore": 0.9},
  {"message": "insight text", "relevanceScore": 0.8}
]`;

  try {
    const response = await callBedrock(prompt, systemPrompt, {
      maxTokens: 1500,
      temperature: 0.7,
    });

    // Try to extract JSON if wrapped in text
    let jsonContent = response.content.trim();

    // If response contains text before JSON, try to extract it
    const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const insights = JSON.parse(jsonContent);

    // Validate it's an array
    if (!Array.isArray(insights)) {
      throw new Error('Response is not an array');
    }

    return {
      success: true,
      data: insights,
    };
  } catch (error) {
    console.error('Insights generation error:', error);
    return {
      success: false,
      error: 'Could not generate insights. Please try again.',
    };
  }
}
