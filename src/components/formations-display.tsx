
"use client";

import { useState } from 'react';
import type { Tactic, MatchResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Trophy, LayoutGrid, List, Pencil, History, Copy } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

type FormationsDisplayProps = {
  formations: Tactic[];
  onAddMatch: (formationId: string, formationName: string) => void;
  onDeleteFormation: (formation: Tactic) => void;
  onDeleteMatchResult: (formationId: string, matchId: string) => void;
  onEdit: (formation: Tactic) => void;
  onViewImage: (url: string, name: string) => void;
};

const calculateStats = (matches: Tactic['matches']) => {
  const total = matches.length;
  if (total === 0) {
    return { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, effectiveness: 0, total };
  }
  const wins = matches.filter(m => m.goalsFor > m.goalsAgainst).length;
  const draws = matches.filter(m => m.goalsFor === m.goalsAgainst).length;
  const losses = total - wins - draws;
  
  const goalsFor = matches.reduce((acc, m) => acc + m.goalsFor, 0);
  const goalsAgainst = matches.reduce((acc, m) => acc + m.goalsAgainst, 0);
  const goalDifference = goalsFor - goalsAgainst;

  const effectiveness = ((wins * 3 + draws) / (total * 3)) * 100;

  return { wins, draws, losses, goalsFor, goalsAgainst, goalDifference, effectiveness, total };
};

const MatchHistory = ({ matches, formationId, onDeleteMatchResult }: { matches: MatchResult[], formationId: string, onDeleteMatchResult: (formationId: string, matchId: string) => void }) => {
  if (matches.length === 0) return null;

  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return (
    <Accordion type="single" collapsible className="w-full mt-4">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center text-sm">
            <History className="mr-2 h-4 w-4" />
            Historial Reciente
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pr-1">
            {sortedMatches.map(match => (
              <div key={match.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/40">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-bold w-4 h-4 flex items-center justify-center rounded-sm",
                       match.goalsFor > match.goalsAgainst ? "bg-green-500 text-white" :
                       match.goalsFor < match.goalsAgainst ? "bg-red-500 text-white" :
                       "bg-yellow-500 text-black"
                    )}
                  >
                    {match.goalsFor > match.goalsAgainst ? "V" : match.goalsFor < match.goalsAgainst ? "D" : "E"}
                  </span>
                  <span>
                    {match.goalsFor} - {match.goalsAgainst}
                  </span>
                </div>
                 <span className="text-xs text-muted-foreground">{new Date(match.date).toLocaleDateString()}</span>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onDeleteMatchResult(formationId, match.id)}
                            >
                                <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>Eliminar resultado</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const FormationCard = ({ formation, onAddMatch, onDeleteFormation, onEdit }: Omit<FormationsDisplayProps, 'formations' | 'onViewImage'>) => {
    const stats = calculateStats(formation.matches);
    const { toast } = useToast();
    const effectivenessColor = 
      stats.effectiveness >= 66 ? 'text-green-500' :
      stats.effectiveness >= 33 ? 'text-yellow-500' :
      stats.total > 0 ? 'text-red-500' : 'text-muted-foreground';
    
    const gdColor =
      stats.goalDifference > 0 ? 'text-green-500' :
      stats.goalDifference < 0 ? 'text-red-500' :
      'text-muted-foreground';
    
    const handleCopyCode = () => {
        if (formation.code) {
            navigator.clipboard.writeText(formation.code);
            toast({
                title: "Código Copiado",
                description: "El código de la táctica se ha copiado al portapapeles.",
            });
        }
    };

    return (
      <Card key={formation.id} className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {formation.name}
                </CardTitle>
                <CardDescription>{formation.detail}</CardDescription>
              </div>
              <Badge variant="secondary">{formation.formation}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2 text-sm mb-4">
              <Badge>Ataque: <span className="font-semibold ml-1 capitalize">{formation.style}</span></Badge>
              <Badge>Defensa: <span className="font-semibold ml-1 capitalize">{formation.defense}</span></Badge>
          </div>
          
          {formation.code && (
              <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Código</p>
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyCode}>
                         <Copy className="h-4 w-4" />
                     </Button>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md font-mono break-all">{formation.code}</p>
              </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-center border-b pb-3 mb-3 mt-4">
            <div className="text-green-500">
              <p className="text-2xl font-bold">{stats.wins}</p>
              <p className="text-xs">Victorias</p>
            </div>
             <div className="text-yellow-500">
              <p className="text-2xl font-bold">{stats.draws}</p>
              <p className="text-xs">Empates</p>
            </div>
            <div className="text-red-500">
              <p className="text-2xl font-bold">{stats.losses}</p>
              <p className="text-xs">Derrotas</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
             <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Partidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.goalsFor}</p>
              <p className="text-xs text-muted-foreground">GF</p>
            </div>
             <div>
              <p className="text-2xl font-bold">{stats.goalsAgainst}</p>
              <p className="text-xs text-muted-foreground">GC</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${gdColor}`}>{stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}</p>
              <p className="text-xs text-muted-foreground">DG</p>
            </div>
          </div>

           <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Efectividad</p>
              <p className={`text-3xl font-bold ${effectivenessColor}`}>{stats.effectiveness.toFixed(0)}%</p>
            </div>
            
            <MatchHistory
                matches={formation.matches}
                formationId={formation.id}
                onDeleteMatchResult={onDeleteMatchResult}
            />
        </CardContent>
        <CardFooter className="grid grid-cols-1 gap-2">
            <Button onClick={() => onAddMatch(formation.id, formation.name)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Partido
            </Button>
            <div className="col-span-2 flex items-center justify-end gap-2 mt-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => onEdit(formation)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Editar Formación</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={() => onDeleteFormation(formation)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Eliminar Formación</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </CardFooter>
      </Card>
    );
};

const FormationRow = ({ formation, onAddMatch, onEdit, onDeleteFormation }: Omit<FormationsDisplayProps, 'formations' | 'onViewImage' | 'onDeleteMatchResult' | 'onAddMatch'> & { onAddMatch: (id: string, name: string) => void }) => {
    const stats = calculateStats(formation.matches);
     const effectivenessColor = 
      stats.effectiveness >= 66 ? 'text-green-500' :
      stats.effectiveness >= 33 ? 'text-yellow-500' :
      stats.total > 0 ? 'text-red-500' : 'text-muted-foreground';

    return (
        <div className="flex items-center justify-between p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors border">
            <div className="flex-1 overflow-hidden">
                <p className="text-lg font-semibold truncate">{formation.name}</p>
                <p className="text-sm text-muted-foreground truncate">{formation.formation}</p>
            </div>
            <div className="hidden sm:flex items-center gap-6 mx-6 flex-shrink-0">
                <div className="text-center w-20">
                    <p className="text-xl font-bold">{stats.wins}-{stats.draws}-{stats.losses}</p>
                    <p className="text-xs text-muted-foreground">V-E-D</p>
                </div>
                 <div className="text-center w-24">
                    <p className={cn("text-xl font-bold", effectivenessColor)}>{stats.effectiveness.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Efectividad</p>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" onClick={() => onAddMatch(formation.id, formation.name)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Partido</span>
                </Button>
                <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                           <Button variant="outline" size="icon" onClick={() => onEdit(formation)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Editar Formación</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => onDeleteFormation(formation)}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Eliminar Formación</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

export function FormationsDisplay({ formations, onAddMatch, onDeleteFormation, onEdit, onViewImage, onDeleteMatchResult }: FormationsDisplayProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const sortedFormations = [...formations].sort((a, b) => {
    const statsA = calculateStats(a.matches);
    const statsB = calculateStats(b.matches);
    if (statsB.effectiveness !== statsA.effectiveness) {
        return statsB.effectiveness - statsA.effectiveness;
    }
    return statsB.total - statsA.total;
  });

  if (formations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-lg border border-dashed">
        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Todavía no has añadido ninguna formación.</p>
        <p className="text-sm text-muted-foreground">Haz clic en 'Añadir Formación' para empezar a registrar su rendimiento.</p>
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-end mb-4">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
                <ToggleGroupItem value="grid" aria-label="Vista de cuadrícula">
                    <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Vista de lista">
                    <List className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
        
        {viewMode === 'grid' ? (
             <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {sortedFormations.map((formation) => (
                    <FormationCard 
                        key={formation.id}
                        formation={formation}
                        onAddMatch={onAddMatch}
                        onDeleteFormation={onDeleteFormation}
                        onEdit={onEdit}
                        onDeleteMatchResult={onDeleteMatchResult}
                    />
                ))}
            </div>
        ) : (
            <div className="space-y-3">
                {sortedFormations.map((formation) => (
                     <FormationRow 
                        key={formation.id}
                        formation={formation}
                        onAddMatch={onAddMatch}
                        onEdit={onEdit}
                        onDeleteFormation={onDeleteFormation}
                    />
                ))}
            </div>
        )}
    </div>
  );
}
