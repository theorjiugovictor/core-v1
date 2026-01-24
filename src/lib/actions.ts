'use server';

import { parseBusinessCommand as parseWithBedrock, generateBusinessInsights as generateWithBedrock } from './bedrock';
import { mockMaterials, mockProducts, mockSales } from './data';

export type ParseBusinessCommandInput = {
  input: string;
};

export async function getParsedCommand(input: ParseBusinessCommandInput) {
  try {
    const result = await parseWithBedrock(input.input);
    return result;
  } catch (error) {
    console.error('Command parsing error:', error);
    return { success: false, error: 'Failed to parse command. Please try again.' };
  }
}

export async function getBusinessInsights() {
  try {
    const businessData = {
      materials: mockMaterials,
      sales: mockSales,
      products: mockProducts,
    };

    const result = await generateWithBedrock(businessData);
    return result;
  } catch (error) {
    console.error('Insights generation error:', error);
    return {
      success: false,
      error: 'Failed to generate insights. Please ensure AWS Bedrock is configured.'
    };
  }
}
