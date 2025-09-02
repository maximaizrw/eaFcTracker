'use server';

import { generateBrainstormingIdeas } from '@/ai/flows/generate-brainstorming-ideas';
import { suggestResourcesForSubtasks } from '@/ai/flows/suggest-resources-for-subtasks';
import { z } from 'zod';

const brainstormSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty.' }),
});

export async function getBrainstormingIdeas(formData: FormData) {
  const validatedFields = brainstormSchema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.prompt?.[0] || 'Invalid prompt' };
  }

  try {
    const result = await generateBrainstormingIdeas({ prompt: validatedFields.data.prompt });
    return { ideas: result.ideas };
  } catch (error) {
    console.error('Error in getBrainstormingIdeas:', error);
    return { error: 'Failed to generate ideas. The AI service may be temporarily unavailable.' };
  }
}

const resourcesSchema = z.object({
  subtask: z.string().min(1),
});

export async function getSuggestedResources(subtask: string) {
    const validatedFields = resourcesSchema.safeParse({ subtask });

    if (!validatedFields.success) {
        return { error: 'Invalid sub-task provided.' };
    }

    try {
        const result = await suggestResourcesForSubtasks({ subtask: validatedFields.data.subtask });
        return { resources: result.resources };
    } catch (error) {
        console.error('Error in getSuggestedResources:', error);
        return { error: 'Failed to suggest resources.' };
    }
}
