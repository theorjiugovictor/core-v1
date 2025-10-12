'use server';

import { generateBusinessInsights, GenerateBusinessInsightsInput } from '@/ai/flows/generate-business-insights';
import { parseBusinessCommand, ParseBusinessCommandInput } from '@/ai/flows/parse-business-command';
import { mockProducts, mockSales } from './data';

export async function getParsedCommand(input: ParseBusinessCommandInput) {
  try {
    const result = await parseBusinessCommand(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to parse command.' };
  }
}

export async function getBusinessInsights() {
  try {
    const businessData: GenerateBusinessInsightsInput = {
      businessData: JSON.stringify({
        inventory: mockProducts,
        sales: mockSales,
      }),
    };
    const result = await generateBusinessInsights(businessData);
    return { success: true, data: result.insights };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate insights.' };
  }
}
