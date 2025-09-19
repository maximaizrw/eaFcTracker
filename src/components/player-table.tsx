
"use client";

import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, X, Wrench, Pencil, NotebookPen, Search } from 'lucide-react';
import { cn, formatAverage, getAverageColorClass } from '@/lib/utils';
import type { Player, PlayerCard, Position, FlatPlayer, Role, CardStyle } from '@/lib/types';
import { positionRoles, cardStyles } from '@/lib/types';
import type { FormValues as AddRatingFormValues } from '@/components/add-rating-dialog';
import { PlayerIdentity } from './player-identity';


type PlayerTableProps = {
  players: FlatPlayer[];
  position: Position;
  onOpenAddRating: (initialData?: Partial<AddRatingFormValues>) => void;
  onOpenEditCard: (player: Player, card: PlayerCard) => void;
  onOpenEditPlayer: (player: Player) => void;
  onOpenPlayerDetail: (flatPlayer: FlatPlayer) => void;
  onViewImage: (url: string, name: string) => void;
  onDeleteCard: (playerId: string, cardId: string, position: Position) => void;
  onDeleteRating: (playerId: string, cardId: string, position: Position, ratingIndex: number) => void;
};

type FilterProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  cardFilter: string;
  onCardFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  leagueFilter: string;
  onLeagueFilterChange: (value: string) => void;
  uniqueCardStyles: CardStyle[];
  uniqueLeagues: string[];
  position: Position;
};

const Filters = ({
  searchTerm,
  onSearchTermChange,
  cardFilter,
  onCardFilterChange,
  roleFilter,
  onRoleFilterChange,
  leagueFilter,
  onLeagueFilterChange,
  uniqueCardStyles,
  uniqueLeagues,
  position
}: FilterProps) => {
    const availableRoles = positionRoles[position] || [];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={`Buscar en ${position}...`}
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Select value={cardFilter} onValueChange={onCardFilterChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por carta" />
                </SelectTrigger>
                <SelectContent>
                     <SelectItem value="all">Todas las Cartas</SelectItem>
                    {uniqueCardStyles.map(style => (
                    <SelectItem key={style} value={style} className="capitalize">{style.replace('-', ' ')}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por Rol" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Roles</SelectItem>
                    {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={leagueFilter} onValueChange={onLeagueFilterChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por Liga" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las Ligas</SelectItem>
                    {uniqueLeagues.map(league => (
                        <SelectItem key={league} value={league}>{league}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (direction: 'next' | 'prev') => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-end gap-2 p-4 border-t">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange('prev')}
                disabled={currentPage === 0}
            >
                Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
                Página {currentPage + 1} de {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange('next')}
                disabled={currentPage >= totalPages - 1}
            >
                Siguiente
            </Button>
        </div>
    );
};

export function PlayerTable({
  players: flatPlayers,
  position,
  onOpenAddRating,
  onOpenEditCard,
  onOpenEditPlayer,
  onOpenPlayerDetail,
  onViewImage,
  onDeleteCard,
  onDeleteRating,
}: PlayerTableProps) {
  
  if (flatPlayers.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center text-center p-10">
        <p className="text-lg font-medium text-muted-foreground">
          {`No se encontraron jugadores para los filtros seleccionados en ${position}.`}
        </p>
        <p className="text-sm text-muted-foreground">
          {"Prueba a cambiar los filtros o añade una nueva valoración."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] min-w-[150px]">Jugador</TableHead>
            <TableHead className="hidden md:table-cell">Rol</TableHead>
            <TableHead>Prom.</TableHead>
            <TableHead>Partidos</TableHead>
            <TableHead className="w-[35%] min-w-[200px] hidden md:table-cell">Valoraciones</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flatPlayers.map((flatPlayer) => {
            const { player, card, ratingsForPos, performance, hasTrainingBuild } = flatPlayer;
            const cardAverage = performance.stats.average;
            const cardMatches = performance.stats.matches;
            
            const averageColorClass = getAverageColorClass(cardAverage);

            return (
              <TableRow key={`${player.id}-${card.id}-${position}`}>
                <TableCell className="p-2 md:p-4">
                  <div className="flex items-center gap-2">
                    {card.imageUrl ? (
                      <button onClick={() => onViewImage(card.imageUrl!, `${player.name} - ${card.name}`)} className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          width={40}
                          height={40}
                          className="bg-transparent object-contain w-8 h-8 md:w-10 md:h-10"
                        />
                      </button>
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0" />
                    )}
                    <PlayerIdentity
                        player={player}
                        card={card}
                        hasTrainingBuild={hasTrainingBuild}
                        onOpenPlayerDetail={() => onOpenPlayerDetail(flatPlayer)}
                    />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell space-y-1">
                   <div>
                    {performance.mostCommonRole ? (
                        <Badge variant="outline">{performance.mostCommonRole}</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn("text-base md:text-lg font-bold", averageColorClass)}>
                    {formatAverage(cardAverage)}
                  </div>
                </TableCell>
                <TableCell className="text-center">{cardMatches}</TableCell>
                <TableCell className="hidden md:table-cell p-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {ratingsForPos.slice(-5).map((rating, index) => {
                        const originalIndex = Math.max(0, ratingsForPos.length - 5) + index;
                        return (
                          <div key={originalIndex} className="group/rating relative">
                            <Badge variant="default" className="text-sm">
                              {rating.value.toFixed(1)}
                            </Badge>
                            <Button
                              size="icon" variant="destructive"
                              className="absolute -top-2 -right-2 h-4 w-4 rounded-full opacity-0 group-hover/rating:opacity-100 transition-opacity z-10"
                              onClick={() => onDeleteRating(player.id, card.id, position, originalIndex)}
                              aria-label={`Eliminar valoración ${rating.value}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </TableCell>
                <TableCell className="text-right p-1 md:p-2">
                  <div className="flex items-center justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              aria-label={`Añadir valoración a ${player.name} (${card.name})`}
                              onClick={() => onOpenAddRating({
                                  playerId: player.id,
                                  playerName: player.name,
                                  nationality: player.nationality,
                                  cardStyle: card.cardStyle,
                                  position: position,
                              })}
                          >
                              <PlusCircle className="h-5 w-5 md:h-4 md:w-4 text-primary/80 hover:text-primary" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Añadir valoración</p></TooltipContent>
                      </Tooltip>
                      <div className="hidden md:flex">
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                aria-label={`Editar jugador ${player.name}`}
                                onClick={() => onOpenEditPlayer(player)}
                                >
                                <Pencil className="h-4 w-4 text-muted-foreground/60 hover:text-muted-foreground" />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar datos del jugador</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                                aria-label={`Editar carta ${card.name}`}
                                onClick={() => onOpenEditCard(player, card)}
                                >
                                <Wrench className="h-4 w-4 text-muted-foreground/80 hover:text-muted-foreground" />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar carta (liga e imagen)</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                                aria-label={`Eliminar valoraciones de ${card.name} (${player.name}) para la posición ${position}`}
                                onClick={() => onDeleteCard(player.id, card.id, position)}>
                                <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Eliminar todas las valoraciones para esta posición</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

PlayerTable.Filters = Filters;
PlayerTable.Pagination = Pagination;
