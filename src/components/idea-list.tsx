'use client';

import { useState, useEffect } from 'react';
import type { Idea, SubTask, Resource } from '@/lib/types';
import { getBrainstormingIdeas, getSuggestedResources } from '@/lib/actions';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Star, Pencil, Trash2, Check, Loader2, Wand2, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface IdeaListProps {
  initialIdeas: Idea[];
  mainPrompt: string;
}

const StarRating = ({ rating, onRatingChange, disabled }: { rating: number; onRatingChange: (newRating: number) => void; disabled?: boolean }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          className="transition-transform hover:scale-125 focus:outline-none disabled:cursor-not-allowed disabled:transform-none"
          aria-label={`Rate ${star} star`}
        >
          <Star className={cn("w-5 h-5", rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300', disabled ? 'text-gray-200' : 'hover:text-yellow-300')} />
        </button>
      ))}
    </div>
  );
};

export function IdeaList({ initialIdeas, mainPrompt }: IdeaListProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingIdeaText, setEditingIdeaText] = useState('');
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const sortedIdeas = [...ideas].sort((a, b) => b.rating - a.rating);
    if (JSON.stringify(sortedIdeas) !== JSON.stringify(ideas)) {
        setIdeas(sortedIdeas);
    }
  }, [ideas]);

  const handleRatingChange = (ideaId: string, newRating: number) => {
    setIdeas(
      ideas.map((idea) =>
        idea.id === ideaId ? { ...idea, rating: newRating } : idea
      )
    );
  };
  
  const handleEditToggle = (idea: Idea) => {
    if (editingIdeaId === idea.id) {
        handleUpdateText(idea.id, editingIdeaText);
    } else {
        setEditingIdeaId(idea.id);
        setEditingIdeaText(idea.text);
    }
  };
  
  const handleUpdateText = (ideaId: string, newText: string) => {
     setIdeas(ideas.map(idea => idea.id === ideaId ? {...idea, text: newText} : idea));
     setEditingIdeaId(null);
  };

  const handleDelete = (ideaId: string) => {
    setIdeas(ideas.filter((idea) => idea.id !== ideaId));
    toast({ title: 'Idea Removed', description: 'The idea has been deleted from this session.' });
  };
  
  const handleGenerateSubTasks = async (ideaId: string) => {
    const ideaToProcess = ideas.find(idea => idea.id === ideaId);
    if (!ideaToProcess) return;

    setIsGeneratingSubtasks(ideaId);
    const subTaskPrompt = `Based on the main goal "${mainPrompt}", break down the following idea into smaller, actionable sub-tasks: "${ideaToProcess.text}"`;
    
    const formData = new FormData();
    formData.append('prompt', subTaskPrompt);
    const result = await getBrainstormingIdeas(formData);
    
    if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else if (result.ideas) {
        const newSubTasks: SubTask[] = result.ideas.map(text => ({
            id: uuidv4(),
            text,
            resources: [],
            isLoadingResources: false,
        }));
        setIdeas(ideas.map(idea => idea.id === ideaId ? {...idea, subTasks: newSubTasks} : idea));
    }
    setIsGeneratingSubtasks(null);
  };
  
  const fetchResourcesForSubtask = async (ideaId: string, subTaskId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    const subTask = idea?.subTasks.find(st => st.id === subTaskId);
    if (!idea || !subTask) return;

    setIdeas(ideas.map(i => i.id === ideaId ? {
        ...i,
        subTasks: i.subTasks.map(st => st.id === subTaskId ? { ...st, isLoadingResources: true } : st)
    } : i));

    const result = await getSuggestedResources(subTask.text);
    
    const finalResources: Resource[] = (result.resources || []).map(text => ({ id: uuidv4(), text }));

    setIdeas(currentIdeas => currentIdeas.map(i => i.id === ideaId ? {
        ...i,
        subTasks: i.subTasks.map(st => st.id === subTaskId ? { ...st, resources: finalResources, isLoadingResources: false } : st)
    } : i));

     if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  }

  return (
    <Card className="shadow-lg animate-fade-in border">
        <CardHeader>
            <CardTitle>Your Brainstormed Ideas</CardTitle>
            <CardDescription>Rate, edit, and explore your generated ideas. The highest-rated ideas will appear at the top.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full space-y-4">
                {ideas.map((idea) => (
                    <AccordionItem value={idea.id} key={idea.id} className="bg-background/50 rounded-lg border shadow-sm data-[state=open]:bg-white">
                        <div className="flex items-center justify-between gap-4 w-full p-4">
                           <div className="flex-grow min-w-0">
                                {editingIdeaId === idea.id ? (
                                    <Input 
                                        value={editingIdeaText}
                                        onChange={(e) => setEditingIdeaText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter') handleUpdateText(idea.id, editingIdeaText)
                                            if(e.key === 'Escape') setEditingIdeaId(null)
                                        }}
                                        className="text-base"
                                        autoFocus
                                    />
                                ) : (
                                    <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline p-0 data-[state=open]:text-primary">
                                      {idea.text}
                                    </AccordionTrigger>
                                )}
                           </div>
                           <div className="flex items-center gap-3 flex-shrink-0">
                                <StarRating rating={idea.rating} onRatingChange={(newRating) => handleRatingChange(idea.id, newRating)} disabled={!!editingIdeaId} />
                                <Button size="icon" variant="ghost" onClick={() => handleEditToggle(idea)}>
                                    {editingIdeaId === idea.id ? <Check className="w-4 h-4 text-green-500"/> : <Pencil className="w-4 h-4"/>}
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(idea.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive"/>
                                </Button>
                           </div>
                        </div>

                        <AccordionContent className="pt-4 mt-2 border-t px-4 pb-4">
                          {isGeneratingSubtasks === idea.id ? (
                               <div className='flex items-center justify-center gap-2 text-muted-foreground p-4'>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Breaking it down...</span>
                               </div>
                          ) : idea.subTasks.length === 0 ? (
                            <div className='text-center text-muted-foreground p-4'>
                                <p>No sub-tasks generated yet.</p>
                                <Button variant="secondary" className='mt-2' onClick={() => handleGenerateSubTasks(idea.id)}>
                                    <Wand2 className="mr-2 h-4 w-4"/>
                                    Break down into Sub-tasks
                                </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-primary">Sub-tasks:</h4>
                                {idea.subTasks.map((subTask) => (
                                    <Card key={subTask.id} className="bg-blue-500/5 p-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="flex-grow pt-1">{subTask.text}</p>
                                            <Button size="sm" variant="outline" onClick={() => fetchResourcesForSubtask(idea.id, subTask.id)} disabled={subTask.isLoadingResources}>
                                                {subTask.isLoadingResources ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                                                Resources
                                            </Button>
                                        </div>
                                        {subTask.resources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-primary/20 space-y-2">
                                                <h5 className="text-sm font-semibold text-accent-foreground/80">Suggested Resources:</h5>
                                                <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1">
                                                    {subTask.resources.map(resource => (
                                                        <li key={resource.id} className='flex items-center gap-2'>
                                                          <Link className="text-accent/90" />
                                                          <span>{resource.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                          )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  );
}
