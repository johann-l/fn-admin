'use server';

/**
 * @fileOverview An AI flow to fetch real-time fuel prices for a given city.
 *
 * - getFuelPrices - A function that fetches fuel prices.
 * - GetFuelPricesInput - The input type for the getFuelPrices function.
 * - GetFuelPricesOutput - The return type for the getFuelPrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetFuelPricesInputSchema = z.object({
  city: z.string().describe('The city for which to fetch fuel prices.'),
});
export type GetFuelPricesInput = z.infer<typeof GetFuelPricesInputSchema>;

const FuelPriceSchema = z.object({
    name: z.string().describe('The name of the fuel type (e.g., Petrol, Diesel).'),
    price: z.string().describe('The current price of the fuel.'),
    unit: z.string().describe('The unit of measurement (e.g., USD/L, INR/L).'),
});

const GetFuelPricesOutputSchema = z.object({
    prices: z.array(FuelPriceSchema).describe('An array of fuel prices.')
});
export type GetFuelPricesOutput = z.infer<typeof GetFuelPricesOutputSchema>;

export async function getFuelPrices(
  input: GetFuelPricesInput
): Promise<GetFuelPricesOutput> {
  return getFuelPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFuelPricesPrompt',
  input: {schema: GetFuelPricesInputSchema},
  output: {schema: GetFuelPricesOutputSchema},
  prompt: `You are an API that returns real-time fuel prices. Based on the current date, provide the accurate fuel prices for the following city: {{{city}}}. Provide prices for Petrol, Diesel, and CNG. The user is in Bangalore, so provide prices in Indian Rupees (INR).`,
});

const getFuelPricesFlow = ai.defineFlow(
  {
    name: 'getFuelPricesFlow',
    inputSchema: GetFuelPricesInputSchema,
    outputSchema: GetFuelPricesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);