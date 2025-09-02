'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant resources for sub-tasks.
 *
 * - suggestResourcesForSubtasks - A function that takes a sub-task and provides relevant resources.
 * - SuggestResourcesForSubtasksInput - The input type for the suggestResourcesForSubtasks function.
 * - SuggestResourcesForSubtasksOutput - The return type for the suggestResourcesForSubtasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResourcesForSubtasksInputSchema = z.object({
  subtask: z.string().describe('A sub-task for which resources are needed.'),
});
export type SuggestResourcesForSubtasksInput = z.infer<
  typeof SuggestResourcesForSubtasksInputSchema
>;

const SuggestResourcesForSubtasksOutputSchema = z.object({
  resources: z
    .array(z.string())
    .describe(
      'A list of relevant resources (e.g., articles, tools, tutorials) for the sub-task.'
    ),
});
export type SuggestResourcesForSubtasksOutput = z.infer<
  typeof SuggestResourcesForSubtasksOutputSchema
>;

export async function suggestResourcesForSubtasks(
  input: SuggestResourcesForSubtasksInput
): Promise<SuggestResourcesForSubtasksOutput> {
  return suggestResourcesForSubtasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResourcesForSubtasksPrompt',
  input: {schema: SuggestResourcesForSubtasksInputSchema},
  output: {schema: SuggestResourcesForSubtasksOutputSchema},
  prompt: `You are an AI assistant designed to suggest resources for sub-tasks.

  Given a sub-task, provide a list of relevant resources (e.g., articles, tools, tutorials) that can help the user accomplish the sub-task.

  Sub-task: {{{subtask}}}

  Resources:`,
});

const suggestResourcesForSubtasksFlow = ai.defineFlow(
  {
    name: 'suggestResourcesForSubtasksFlow',
    inputSchema: SuggestResourcesForSubtasksInputSchema,
    outputSchema: SuggestResourcesForSubtasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
