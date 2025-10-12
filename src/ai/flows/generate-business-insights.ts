'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating business insights and suggestions based on user data.
 *
 * The flow takes user data as input and uses a generative AI model to provide clear and actionable recommendations tailored to the user's specific business situation.
 *
 * @exports generateBusinessInsights - A function that triggers the business insights generation flow.
 * @exports GenerateBusinessInsightsInput - The input type for the generateBusinessInsights function.
 * @exports GenerateBusinessInsightsOutput - The output type for the generateBusinessInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessInsightsInputSchema = z.object({
  businessData: z.string().describe('A JSON string containing the business data, including inventory, sales, expenses, and revenue.'),
});
export type GenerateBusinessInsightsInput = z.infer<typeof GenerateBusinessInsightsInputSchema>;

const GenerateBusinessInsightsOutputSchema = z.object({
  insights: z.array(
    z.object({
      message: z.string().describe('A specific business insight or suggestion.'),
      relevanceScore: z.number().describe('A score indicating the relevance of the insight to the user, from 0 to 1.'),
    })
  ).describe('An array of business insights and suggestions.'),
});
export type GenerateBusinessInsightsOutput = z.infer<typeof GenerateBusinessInsightsOutputSchema>;

export async function generateBusinessInsights(input: GenerateBusinessInsightsInput): Promise<GenerateBusinessInsightsOutput> {
  return generateBusinessInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessInsightsPrompt',
  input: {schema: GenerateBusinessInsightsInputSchema},
  output: {schema: GenerateBusinessInsightsOutputSchema},
  prompt: `You are an AI-powered business advisor for small and medium businesses.

  Analyze the provided business data and generate relevant insights and suggestions to improve their business.
  Provide actionable recommendations tailored to their specific situation.
  Include a relevance score for each insight, indicating how important it is for the user to consider.

  Business Data: {{{businessData}}}

  Format your response as a JSON object with an array of insights. Each insight should have a message and a relevanceScore.
  Example:
  {
    "insights": [
      {
        "message": "Consider increasing the price of your top-selling product, as it has a high demand.",
        "relevanceScore": 0.8
      },
      {
        "message": "You have low stock for [product]. Consider reordering soon.",
        "relevanceScore": 0.9
      }
    ]
  }
  `,
});

const generateBusinessInsightsFlow = ai.defineFlow(
  {
    name: 'generateBusinessInsightsFlow',
    inputSchema: GenerateBusinessInsightsInputSchema,
    outputSchema: GenerateBusinessInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
