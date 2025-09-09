
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FormationStats, League } from '@/lib/types';
import { Label } from './ui/label';

type IdealTeamSetupProps = {
  formations: FormationStats[];
  selectedFormationId?: string;
  onFormationChange: (id: string) => void;
  leagues: (League | 'all')[];
  selectedLeague: League | 'all';
  onLeagueChange: (league: League | 'all') => void;
};

export function IdealTeamSetup({ formations, selectedFormationId, onFormationChange, leagues, selectedLeague, onLeagueChange }: IdealTeamSetupProps) {
  if (formations.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4 border border-dashed rounded-lg">
        Aún no has creado ninguna formación. Ve a la pestaña "Formaciones" para empezar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>
          Selecciona tu Plantilla Táctica
        </Label>
        <Select
          value={selectedFormationId}
          onValueChange={onFormationChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Elige una formación..." />
          </SelectTrigger>
          <SelectContent>
            {formations.map(f => (
              <SelectItem key={f.id} value={f.id}>
                {f.name} {f.creator && `- ${f.creator}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
            Filtrar por Liga (Opcional)
        </Label>
        <Select
            value={selectedLeague}
            onValueChange={(value) => onLeagueChange(value as League | 'all')}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por liga..." />
            </SelectTrigger>
            <SelectContent>
                 <SelectItem value="all">Todas las Ligas</SelectItem>
                {leagues.filter(l => l !== 'all').map(l => (
                    <SelectItem key={l} value={l as string}>{l}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
    </div>
  );
}
