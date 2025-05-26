'use server';

/**
 * @fileOverview Generates a summary of the medication log for a user to share with their doctor.
 *
 * - generateMedicationSummary - A function that generates the medication summary.
 * - MedicationSummaryInput - The input type for the generateMedicationSummary function.
 * - MedicationSummaryOutput - The return type for the generateMedicationSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationSummaryInputSchema = z.object({
  medicationList: z
    .string()
    .describe('A list of medications the user is currently taking.'),
  dosageDetails: z.string().describe('Dosage details for each medication.'),
  schedule: z.string().describe('The medication schedule for each medication.'),
  moodDiary: z
    .string()
    .optional()
    .describe('A summary of the user’s mood diary entries.'),
  additionalContext: z
    .string()
    .optional()
    .describe('Any additional information the user wants to include.'),
});
export type MedicationSummaryInput = z.infer<typeof MedicationSummaryInputSchema>;

const MedicationSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A comprehensive summary of the users medication log, including medication list, dosage, schedule, mood diary, and any additional context provided.'
    ),
});
export type MedicationSummaryOutput = z.infer<typeof MedicationSummaryOutputSchema>;

export async function generateMedicationSummary(
  input: MedicationSummaryInput
): Promise<MedicationSummaryOutput> {
  return medicationSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationSummaryPrompt',
  input: {schema: MedicationSummaryInputSchema},
  output: {schema: MedicationSummaryOutputSchema},
  prompt: `You are a helpful medical assistant that specializes in summarizing medication logs for patients to share with their doctors.

  Please generate a concise and accurate summary of the following medication information. The summary should include the medication list, dosage details, schedule, a brief overview of the mood diary if available, and any additional context provided.

  Medication List: {{{medicationList}}}
  Dosage Details: {{{dosageDetails}}}
  Schedule: {{{schedule}}}
  Mood Diary: {{#if moodDiary}}{{{moodDiary}}}{{else}}No mood diary entries available.{{/if}}
  Additional Context: {{#if additionalContext}}{{{additionalContext}}}{{else}}No additional context provided.{{/if}}`,
});

const medicationSummaryFlow = ai.defineFlow(
  {
    name: 'medicationSummaryFlow',
    inputSchema: MedicationSummaryInputSchema,
    outputSchema: MedicationSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
