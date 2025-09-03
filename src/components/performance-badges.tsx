
"use client";

import type { PlayerPerformance } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Repeat, Gem, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type PerformanceBadgesProps = {
    performance: PlayerPerformance;
    className?: string;
};

export function PerformanceBadges({ performance, className }: PerformanceBadgesProps) {
    if (!performance) return null;

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            {performance.isHotStreak && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <TrendingUp className="h-4 w-4 text-orange-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>En Racha (Mejor rendimiento reciente)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
            {performance.isConsistent && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Repeat className="h-4 w-4 text-cyan-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>Consistente (Valoraciones muy estables)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
            {performance.isVersatile && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                           <Gem className="h-4 w-4 text-purple-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>Versátil (Rinde bien en múltiples posiciones)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
             {performance.isPromising && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Zap className="h-4 w-4 text-yellow-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>Promesa (Pocos partidos, gran promedio)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
        </div>
    );
}
