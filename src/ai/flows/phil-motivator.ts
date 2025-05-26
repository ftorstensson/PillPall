// src/ai/flows/phil-motivator.ts
'use server';

/**
 * @fileOverview Phil, an AI assistant that provides contextual, encouraging messages.
 *
 * - philMotivator - A function that generates an encouraging message from Phil.
 * - PhilMotivatorInput - The input type for the philMotivator function.
 * - PhilMotivatorOutput - The return type for the philMotivator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhilMotivatorInputSchema = z.object({
  eventType: z.string().describe('The event that triggered this message, e.g., "PAGE_LOAD", "MEDICATION_TAKEN", "STATUS_SAVED_POPUP"'),
  eventContext: z.string().optional().describe('Additional context, e.g., medication name, user achievement.'),
});
export type PhilMotivatorInput = z.infer<typeof PhilMotivatorInputSchema>;

const PhilMotivatorOutputSchema = z.object({
  message: z.string().describe('The short, encouraging message from Phil.'),
  emoji: z.string().describe('A single relevant emoji character.'),
});
export type PhilMotivatorOutput = z.infer<typeof PhilMotivatorOutputSchema>;

export async function philMotivator(input: PhilMotivatorInput): Promise<PhilMotivatorOutput> {
  return philMotivatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'philMotivatorPrompt',
  input: {schema: PhilMotivatorInputSchema},
  output: {schema: PhilMotivatorOutputSchema},
  prompt: `You are Phil, a friendly and encouraging AI assistant for the PillPal app. Your purpose is to provide short, positive, and uplifting messages to the user based on their actions or app events. Always include a single, relevant emoji at the end of your message.

Here's the event that just happened:
Event Type: {{{eventType}}}
{{#if eventContext}}Event Context: {{{eventContext}}}{{/if}}

Based on this, generate an appropriate encouraging message.

Examples of good messages:
- If eventType is "PAGE_LOAD": "Welcome back! Ready to make today a great day? ✨" or "Hey there! Phil's here to cheer you on! 😊"
- If eventType is "STATUS_SAVED_POPUP": "Great job updating your log! Keeping track is key! 👍" or "Awesome! Your medication status is saved! 🎉"
- If eventType is "MEDICATION_TAKEN" and eventContext is "Lisinopril": "You took your Lisinopril! Excellent work staying on top of it! ✅"

Keep your message concise (1-2 sentences) and positive.
`,
});

const philMotivatorFlow = ai.defineFlow(
  {
    name: 'philMotivatorFlow',
    inputSchema: PhilMotivatorInputSchema,
    outputSchema: PhilMotivatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure a default emoji if somehow not generated, though the prompt asks for one.
    if (output && !output.emoji) {
        // Try to pick a generic positive emoji based on message or default
        if (output.message.toLowerCase().includes("great") || output.message.toLowerCase().includes("awesome")) {
            output.emoji = "🎉";
        } else if (output.message.toLowerCase().includes("good") || output.message.toLowerCase().includes("job")) {
            output.emoji = "👍";
        } else if (output.message.toLowerCase().includes("welcome") || output.message.toLowerCase().includes("hey")) {
            output.emoji = "👋";
        }
        else {
            output.emoji = "😊";
        }
    }
    return output!;
  }
);
