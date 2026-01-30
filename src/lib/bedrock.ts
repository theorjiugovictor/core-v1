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
  }
): Promise<BedrockResponse> {
  const modelId = options?.model || 'anthropic.claude-3-haiku-20240307-v1:0';

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.7,
    system: systemPrompt || 'You are a helpful AI assistant for a Nigerian business management app.',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      content: responseBody.content[0].text,
      stopReason: responseBody.stop_reason,
    };
  } catch (error) {
    console.error('Bedrock API Error:', error);
    throw new Error('Failed to call AWS Bedrock');
  }
}

/**
 * Parse business command using Bedrock Claude
 */
/**
 * Parse business command using Bedrock Claude
 */
export async function parseBusinessCommand(input: string) {
  const systemPrompt = `You are a business command parser for a Nigerian SME management app.
Parse natural language commands into a structured JSON ARRAY of actions.
You must return a JSON ARRAY, even for a single command.

Supported actions:
- SALE: Record a sale (e.g., "sold 15 bottles palm oil 800 each")
- STOCK_IN: Add inventory/material (e.g., "add 100 bags cement at 5000 cost")
- CREATE_PRODUCT: Create a new product. CAN include recipe. (e.g., "create Meat Pie at 500 made of 0.2 flour and 0.1 meat")
- STOCK_CHECK: Check stock levels (e.g., "how many bags of rice?")
- EXPENSE: Record expense (e.g., "paid 15k for transport")
- SUMMARY: View summary (e.g., "today's sales")
- CHAT: General conversation (e.g. "Hello", "How do I use this?")
- CLARIFY: If intent is ambiguous or missing critical details (e.g. "Added rice" -> missing qty/price).

Nigerian currency patterns:
- "5k" = 5000 Naira
- "45k each" = 45000 per unit
- ₦ or "naira" = Nigerian Naira

Respond ONLY with a JSON ARRAY of objects in this format:
[
  {
    "action": "SALE" | "STOCK_IN" | "CREATE_PRODUCT" | "STOCK_CHECK" | "EXPENSE" | "SUMMARY" | "CHAT" | "CLARIFY",
    "item": "product name (optional)",
    "quantity": number (optional),
    "price": number (optional),
    "customer": "customer name (for credit sales)",
    "isCredit": boolean,
    "date": "YYYY-MM-DD",
    "message": "Response text for CHAT or CLARIFY",
    "recipe": [ {"item": "ingredient name", "quantity": number} ] // Optional, only for CREATE_PRODUCT
  }
]

Examples:
Input: "Sold 5 Rice at 2000 and 3 Beans at 1500"
Output: [{"action":"SALE", "item":"Rice", "quantity":5, "price":2000}, {"action":"SALE", "item":"Beans", "quantity":3, "price":1500}]

Input: "Create Meatpie at 500 using 0.2kg flour and 1 egg"
Output: [{"action":"CREATE_PRODUCT", "item":"Meatpie", "price":500, "recipe":[{"item":"flour", "quantity":0.2}, {"item":"egg", "quantity":1}]}]
`;

  const prompt = `Parse this command: "${input}"`;

  try {
    const response = await callBedrock(prompt, systemPrompt, {
      maxTokens: 1000,
      temperature: 0.1, // Lower temperature for more deterministic parsing
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
