// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent that recommends optimized routes, bus assignments, and resource allocations.
 *
 * - optimizeRoutesResources - A function that handles the route and resource optimization process.
 * - OptimizeRoutesResourcesInput - The input type for the optimizeRoutesResources function.
 * - OptimizeRoutesResourcesOutput - The return type for the optimizeRoutesResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeRoutesResourcesInputSchema = z.object({
  historicalData: z
    .string()
    .describe('Historical data of fleet activities, including routes, bus usage, and timings.'),
  realTimeData: z
    .string()
    .describe(
      'Real-time data of bus locations, traffic conditions, and passenger loads.'
    ),
  fleetSize: z.number().describe('The number of buses in the fleet.'),
  driverAvailability: z
    .string()
    .describe('Information on driver availability and schedules.'),
  passengerDemand: z
    .string()
    .describe('Data on passenger demand, including peak hours and popular routes.'),
});
export type OptimizeRoutesResourcesInput = z.infer<
  typeof OptimizeRoutesResourcesInputSchema
>;

const OptimizeRoutesResourcesOutputSchema = z.object({
  optimizedRoutes: z
    .string()
    .describe('Recommended optimized routes for each bus.'),
  busAssignments: z
    .string()
    .describe('Recommended bus assignments for each route.'),
  resourceAllocations: z
    .string()
    .describe(
      'Recommended resource allocations, including driver schedules and bus maintenance.'
    ),
  summary: z
    .string()
    .describe('A summary of the daily fleet activities.'),
});
export type OptimizeRoutesResourcesOutput = z.infer<
  typeof OptimizeRoutesResourcesOutputSchema
>;

export async function optimizeRoutesResources(
  input: OptimizeRoutesResourcesInput
): Promise<OptimizeRoutesResourcesOutput> {
  return optimizeRoutesResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeRoutesResourcesPrompt',
  input: {schema: OptimizeRoutesResourcesInputSchema},
  output: {schema: OptimizeRoutesResourcesOutputSchema},
  prompt: `You are an expert fleet manager specializing in optimizing bus routes and resource allocation.

Analyze the historical and real-time data provided to recommend optimized routes, bus assignments, and resource allocations to improve efficiency, reduce costs, and minimize disruptions.

Provide a summary of the daily fleet activities.

Historical Data: {{{historicalData}}}
Real-Time Data: {{{realTimeData}}}
Fleet Size: {{{fleetSize}}}
Driver Availability: {{{driverAvailability}}}
Passenger Demand: {{{passengerDemand}}}`,
});

const optimizeRoutesResourcesFlow = ai.defineFlow(
  {
    name: 'optimizeRoutesResourcesFlow',
    inputSchema: OptimizeRoutesResourcesInputSchema,
    outputSchema: OptimizeRoutesResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
