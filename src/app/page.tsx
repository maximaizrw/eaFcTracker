"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lightbulb, Loader2 } from 'lucide-react';
import type { Idea } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getBrainstormingIdeas } from '@/lib/actions';
import { IdeaList } from '@/components/idea-list';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Used to force re-render of IdeaList
  const { toast } = useToast();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt is empty',
        description: 'Please enter an idea, goal, or problem to start brainstorming.',
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdeas([]);

    const formData = new FormData();
    formData.append('prompt', prompt);

    const result = await getBrainstormingIdeas(formData);

    if (result.error) {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.ideas) {
      const newIdeas: Idea[] = result.ideas.map((ideaText) => ({
        id: uuidv4(),
        text: ideaText,
        rating: 0,
        subTasks: [], // Initially empty
      }));
      setIdeas(newIdeas);
      setKey(prevKey => prevKey + 1); // Trigger re-mount of IdeaList
    }
    setIsLoading(false);
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary flex items-center justify-center gap-4">
          <Sparkles className="w-12 h-12 text-accent" />
          Idea Spark
        </h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
          Turn your fleeting thoughts into actionable plans. Enter a prompt below and let AI help you brainstorm, break down tasks, and find resources.
        </p>
      </header>

      <Card className="max-w-3xl mx-auto shadow-lg border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb />
            What's on your mind?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Launch a new podcast about sustainable living' or 'How can I learn to cook?'"
              className="min-h-[120px] text-base bg-white focus:bg-white"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full text-lg py-6">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sparking Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Ideas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="text-center mt-8 text-destructive font-semibold">
          <p>An error occurred: {error}</p>
        </div>
      )}

      <div className="mt-12">
        {isLoading && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                <p className='font-semibold'>Generating... this might take a moment.</p>
            </div>
        )}
        {ideas.length > 0 && !isLoading && (
          <IdeaList key={key} initialIdeas={ideas} mainPrompt={prompt}/>
        )}
      </div>
    </main>
  );
}
