
"use client";

import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotebookPen } from 'lucide-react';
import type { Player, PlayerCard } from '@/lib/types';
import { nationalityToCountryCode } from '@/lib/nationalities-map';
import { cardStyleImages } from '@/lib/card-styles';

type PlayerIdentityProps = {
  player: Player;
  card: PlayerCard;
  hasTrainingBuild?: boolean;
  onOpenPlayerDetail: () => void;
};

export function PlayerIdentity({ player, card, hasTrainingBuild, onOpenPlayerDetail }: PlayerIdentityProps) {
  const countryCode = nationalityToCountryCode[player.nationality];
  const flagUrl = countryCode ? `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png` : null;
  const cardStyleUrl = card.cardStyle ? cardStyleImages[card.cardStyle] : null;

  return (
    <div>
      <div className="flex items-center gap-1 md:gap-2">
        <button 
            onClick={onOpenPlayerDetail}
            className="font-medium text-sm md:text-base hover:underline text-left"
        >
            {player.name}
        </button>
        {hasTrainingBuild && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <NotebookPen className="h-4 w-4 text-accent" />
                    </TooltipTrigger>
                    <TooltipContent><p>Build de Entrenamiento Guardada</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {flagUrl && <Image src={flagUrl} alt={player.nationality} width={20} height={15} className="object-contain" />}
        {cardStyleUrl && <Image src={cardStyleUrl} alt={card.cardStyle} width={20} height={20} className="object-contain" />}
        <span>{card.name}</span>
        {card.team && card.team !== 'Sin Equipo' && <span className="hidden sm:inline">- {card.team}</span>}
      </div>
    </div>
  );
}
