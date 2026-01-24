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
export async function parseBusinessCommand(input: string) {
  const systemPrompt = `You are a business command parser for a Nigerian SME management app.
Parse natural language commands into structured actions.

Supported actions:
- SALE: Record a sale (e.g., "sold 15 bottles palm oil 800 each")
- STOCK_IN: Add inventory (e.g., "add 100 bags cement at 5000 cost")
- STOCK_CHECK: Check stock levels (e.g., "how many bags of rice?")
- EXPENSE: Record expense (e.g., "paid 15k for transport")
- CREDIT_SALE: Sale on credit (e.g., "sold 10 cartons to Mama Ngozi on credit")
- SUMMARY: View summary (e.g., "today's sales")

Nigerian currency patterns:
- "5k" = 5000 Naira
- "45k each" = 45000 per unit
- ₦ or "naira" = Nigerian Naira

Respond ONLY with a JSON object in this exact format:
{
  "action": "SALE" | "STOCK_IN" | "STOCK_CHECK" | "EXPENSE" | "CREDIT_SALE" | "SUMMARY",
  "item": "product name",
  "quantity": number,
  "price": number,
  "customer": "customer name (for credit sales)",
  "isCredit": boolean,
  "date": "YYYY-MM-DD"
}`;

  const prompt = `Parse this command: "${input}"`;

  try {
    const response = await callBedrock(prompt, systemPrompt, {
      maxTokens: 500,
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.content);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error('Command parsing error:', error);
    return {
      success: false,
      error: 'Could not parse command. Please try rephrasing.',
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
  const systemPrompt = `You are a business advisor for Nigerian SMEs. Analyze the business data and provide actionable insights.
Focus on: inventory management, pricing strategies, cash flow, and growth opportunities.
Respond with a JSON array of insights, each with "message" and "relevanceScore" (0-1).`;

  const prompt = `Analyze this business:
Materials: ${JSON.stringify(businessData.materials, null, 2)}
Sales: ${JSON.stringify(businessData.sales, null, 2)}
Products: ${JSON.stringify(businessData.products, null, 2)}

Provide 3-5 specific, actionable insights for this Nigerian business.`;

  try {
    const response = await callBedrock(prompt, systemPrompt, {
      maxTokens: 1500,
      temperature: 0.7,
    });

    const insights = JSON.parse(response.content);
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
