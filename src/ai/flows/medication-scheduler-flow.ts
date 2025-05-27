
'use server';
/**
 * @fileOverview Phil, an AI assistant that helps users set up their weekly medication schedule.
 *
 * - medicationScheduler - A function that processes user input for medication schedules.
 * - MedicationSchedulerInput - The input type for the medicationScheduler function.
 * - MedicationSchedulerOutput - The return type for the medicationScheduler function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationSchedulerInputSchema = z.object({
  userInput: z.string().describe("The user's message about their medication schedule. e.g., 'I take Lisinopril 10mg every morning at 8 AM.'"),
});
export type MedicationSchedulerInput = z.infer<typeof MedicationSchedulerInputSchema>;

const MedicationSchedulerOutputSchema = z.object({
  philResponse: z.string().describe("Phil's conversational reply to the user, acknowledging their input or asking for clarification."),
});
export type MedicationSchedulerOutput = z.infer<typeof MedicationSchedulerOutputSchema>;

export async function medicationScheduler(input: MedicationSchedulerInput): Promise<MedicationSchedulerOutput> {
  return medicationSchedulerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationSchedulerPrompt',
  input: {schema: MedicationSchedulerInputSchema},
  output: {schema: MedicationSchedulerOutputSchema},
  prompt: `You are Phil, a friendly and helpful AI assistant for the PillPal app.
Your current task is to help the user set up their weekly medication schedule.
The user will describe their medications, dosages, times, and days they take them.

Your goal is to:
1. Acknowledge their input in a friendly and encouraging way.
2. Confirm that you've understood or noted down what they said.
3. If their input is very vague, you can gently ask for more details in a natural way, but primarily focus on acknowledging.
4. Keep your responses concise and conversational.

Example interactions:
User: "I take Lisinopril 10mg every morning at 8 AM."
Phil: "Okay, Lisinopril 10mg every morning at 8 AM. Got it! What's next?"

User: "Metformin 500mg twice a day with meals on weekdays."
Phil: "Great! Metformin 500mg twice a day with meals on weekdays. I've noted that down for you."

User: "Vitamin D."
Phil: "Vitamin D, noted! Could you tell me a bit more, like the dosage and when you take it?"

User's current input about their schedule:
{{{userInput}}}

Generate an appropriate response.
`,
});

const medicationSchedulerFlow = ai.defineFlow(
  {
    name: 'medicationSchedulerFlow',
    inputSchema: MedicationSchedulerInputSchema,
    outputSchema: MedicationSchedulerOutputSchema,
  },
  async (input: MedicationSchedulerInput) => {
    const {output} = await prompt(input);
    if (!output) {
        return { philResponse: "I'm having a little trouble thinking right now. Could you try that again in a moment?"};
    }
    return output;
  }
);
