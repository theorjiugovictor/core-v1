'use server';

/**
 * @fileOverview Parses natural language business commands and extracts relevant information.
 *
 * - parseBusinessCommand - A function that parses business commands.
 * - ParseBusinessCommandInput - The input type for the parseBusinessCommand function.
 * - ParseBusinessCommandOutput - The return type for the parseBusinessCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseBusinessCommandInputSchema = z.object({
  command: z.string().describe('The natural language business command to parse.'),
});
export type ParseBusinessCommandInput = z.infer<typeof ParseBusinessCommandInputSchema>;

const ParseBusinessCommandOutputSchema = z.object({
  action: z.string().describe('The action to take based on the command (e.g., add_inventory, record_sale, show_profit).'),
  item: z.string().optional().describe('The item involved in the command.'),
  quantity: z.number().optional().describe('The quantity of the item.'),
  price: z.number().optional().describe('The price of the item.'),
  date: z.string().optional().describe('The date of the transaction, if specified.'),
});
export type ParseBusinessCommandOutput = z.infer<typeof ParseBusinessCommandOutputSchema>;

export async function parseBusinessCommand(input: ParseBusinessCommandInput): Promise<ParseBusinessCommandOutput> {
  return parseBusinessCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseBusinessCommandPrompt',
  input: {schema: ParseBusinessCommandInputSchema},
  output: {schema: ParseBusinessCommandOutputSchema},
  prompt: `You are a helpful AI assistant designed to parse natural language business commands and extract relevant information.

  Your task is to analyze the given command and identify the action to take, the item involved, the quantity, and the price.
  Respond in JSON format, following the schema provided, and use Zod descriptions to guide content. 

  Command: {{{command}}}
  `, 
});

const parseBusinessCommandFlow = ai.defineFlow(
  {
    name: 'parseBusinessCommandFlow',
    inputSchema: ParseBusinessCommandInputSchema,
    outputSchema: ParseBusinessCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
