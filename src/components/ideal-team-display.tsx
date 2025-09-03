
"use client";

import type { IdealTeamPlayer, IdealTeamSlot, FormationStats, Position } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatAverage } from '@/lib/utils';
import { Users, Shirt, X } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { PerformanceBadges } from './performance-badges';
import { FootballPitch } from './football-pitch';

type IdealTeamDisplayProps = {
  teamSlots: IdealTeamSlot[];
  formation?: FormationStats;
  onDiscardPlayer: (cardId: string) => void;
};

const PlayerToken = ({ player, style, onDiscard }: { player: IdealTeamPlayer | null, style: React.CSSProperties, onDiscard: (cardId: string) => void }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    return (
      <div 
        className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-24 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border-2 border-dashed border-foreground/30 bg-background/20"
        style={style}
      >
        <Shirt className="w-8 h-8 text-foreground/40" />
      </div>
    );
  }

  return (
    <div 
      className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-24 rounded-lg flex flex-col items-center justify-between text-center transition-all duration-200 p-1 group bg-card/80 backdrop-blur-sm border border-primary/40 shadow-lg"
      style={style}
    >
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        onClick={() => onDiscard(player.card.id)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>Descartar jugador</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <div className="relative w-12 h-12 flex-shrink-0 mt-1">
        {player.card.imageUrl ? (
          <Image
            src={player.card.imageUrl}
            alt={player.card.name}
            fill
            sizes="48px"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40 rounded-full">
            <Users className="w-7 h-7 text-muted-foreground/60" />
          </div>
        )}
        <div 
            className="absolute -top-1.5 -left-1.5 font-bold text-white rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border-2 border-primary text-sm h-7 w-7"
            style={{ textShadow: '0 0 8px hsl(var(--primary))' }}
        >
           {formatAverage(player.average)}
        </div>
      </div>
      <div className="w-full mb-0.5">
        <p className="font-semibold text-xs text-foreground truncate w-full" title={player.player.name}>
          {player.player.name}
        </p>
        <p className="font-bold text-base leading-tight">{player.position}</p>
      </div>
    </div>
  );
};

const SubstitutePlayerRow = ({ player, onDiscard }: { player: IdealTeamPlayer | null, onDiscard: (cardId: string) => void }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border-2 border-dashed border-foreground/30 h-16">
        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg">
          <Shirt className="w-6 h-6 text-foreground/40" />
        </div>
        <div className="font-semibold text-muted-foreground">Vacante</div>
      </div>
    );
  }

  return (
    <div 
        className="group flex items-center gap-3 p-2 rounded-lg bg-card h-16 relative border"
    >
      <div className="w-16 font-bold text-lg text-center text-muted-foreground">{player.position}</div>
      <div className="relative w-10 h-10 flex-shrink-0">
        {player.card.imageUrl && (
          <Image
            src={player.card.imageUrl}
            alt={player.card.name}
            fill
            sizes="40px"
            className="object-contain"
          />
        )}
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground truncate" title={player.player.name}>
                {player.player.name}
            </p>
            <PerformanceBadges performance={player.performance} />
        </div>
        <p className="text-xs truncate text-primary" title={player.card.name}>
          {player.card.name}
        </p>
      </div>
      <Badge variant="secondary">{player.card.style}</Badge>
      <div className="font-bold text-lg w-12 text-center">{formatAverage(player.average)}</div>
      <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => onDiscard(player.card.id)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Descartar jugador</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
};

// Define the tactical order for substitutes
const substituteOrder: Position[] = [
    'PT', 'DFC', 'LI', 'LD', 'MCD', 'MC', 'MDI', 'MDD', 'MO', 'EXI', 'EXD', 'SD', 'DC'
];

export function IdealTeamDisplay({ teamSlots, formation, onDiscardPlayer }: IdealTeamDisplayProps) {
  if (teamSlots.length === 0 || !formation) {
    return (
      <div className="mt-8 text-center text-muted-foreground p-8 bg-card rounded-lg border border-dashed">
        Configura una formación y haz clic en "Generar 11 Ideal" para ver los resultados aquí.
      </div>
    );
  }
  
  const substitutes = teamSlots
    .map(slot => slot.substitute)
    .filter((sub): sub is IdealTeamPlayer => sub !== null && !sub.player.id.startsWith('placeholder'))
    .sort((a, b) => {
        const indexA = substituteOrder.indexOf(a.position);
        const indexB = substituteOrder.indexOf(b.position);
        if(indexA === -1 && indexB === -1) return 0;
        if(indexA === -1) return 1;
        if(indexB === -1) return -1;
        return indexA - indexB;
    });

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <FootballPitch>
          {teamSlots.map((slot, index) => {
             const formationSlot = formation.slots[index];
             const style: React.CSSProperties = {
                top: `${formationSlot?.top || 50}%`,
                left: `${formationSlot?.left || 50}%`,
             };
             return <PlayerToken key={slot.starter?.card.id || `starter-${index}`} player={slot.starter} style={style} onDiscard={onDiscardPlayer} />;
          })}
        </FootballPitch>
      </div>
      
      <div className="lg:col-span-1">
        <h3 className="text-xl font-semibold mb-4 text-center">Banquillo de Suplentes</h3>
        <div className="space-y-2">
          {substitutes.map((sub, index) => (
             <SubstitutePlayerRow key={sub?.card.id || `sub-${index}`} player={sub} onDiscard={onDiscardPlayer}/>
          ))}
        </div>
      </div>
    </div>
  );
}
