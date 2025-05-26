// src/ai/flows/pillwise-assistant.ts
'use server';

/**
 * @fileOverview An AI assistant that answers questions about medication and its importance.
 *
 * - pillWiseAssistant - A function that handles answering questions about medication.
 * - PillWiseAssistantInput - The input type for the pillWiseAssistant function.
 * - PillWiseAssistantOutput - The return type for the pillWiseAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PillWiseAssistantInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  question: z.string().describe('The question about the medication.'),
});
export type PillWiseAssistantInput = z.infer<typeof PillWiseAssistantInputSchema>;

const PillWiseAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the medication.'),
});
export type PillWiseAssistantOutput = z.infer<typeof PillWiseAssistantOutputSchema>;

export async function pillWiseAssistant(input: PillWiseAssistantInput): Promise<PillWiseAssistantOutput> {
  return pillWiseAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pillWiseAssistantPrompt',
  input: {schema: PillWiseAssistantInputSchema},
  output: {schema: PillWiseAssistantOutputSchema},
  prompt: `You are a friendly and encouraging AI assistant called PillWise. Your purpose is to answer questions about medication and its importance to help users better understand their treatment plan and stay motivated.

  You are given the name of the medication and a question about it. Answer the question in a clear, concise, and encouraging manner.

  Medication Name: {{{medicationName}}}
  Question: {{{question}}}
  `,
});

const pillWiseAssistantFlow = ai.defineFlow(
  {
    name: 'pillWiseAssistantFlow',
    inputSchema: PillWiseAssistantInputSchema,
    outputSchema: PillWiseAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
