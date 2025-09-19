
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AddRatingDialog, type FormValues as AddRatingFormValues } from '@/components/add-rating-dialog';
import { EditCardDialog, type FormValues as EditCardFormValues } from '@/components/edit-card-dialog';
import { EditPlayerDialog, type FormValues as EditPlayerFormValues } from '@/components/edit-player-dialog';
import { AddFormationDialog } from '@/components/add-formation-dialog';
import { EditFormationDialog } from '@/components/edit-formation-dialog';
import { AddMatchDialog, type AddMatchFormValues } from '@/components/add-match-dialog';
import { PlayerDetailDialog } from '@/components/player-detail-dialog';

import { FormationsDisplay } from '@/components/formations-display';
import { PlayerTable } from '@/components/player-table';
import { PositionIcon } from '@/components/position-icon';

import { usePlayers } from '@/hooks/usePlayers';
import { useFormations } from '@/hooks/useFormations';
import { useToast } from "@/hooks/use-toast";

import type { Player, PlayerCard as PlayerCardType, Tactic, FlatPlayer, Position, AddTacticFormValues, EditTacticFormValues, Nationality, League, PlayerPerformance, CardStyle } from '@/lib/types';
import { positions, leagues } from '@/lib/types';
import { PlusCircle, Download, Trophy } from 'lucide-react';
import { calculateStats, normalizeText } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const { 
    players, 
    loading: playersLoading, 
    error: playersError,
    addRating,
    editCard,
    editPlayer,
    deleteCard,
    deleteRating,
    downloadBackup: downloadPlayersBackup,
    saveTrainingBuild,
  } = usePlayers();

  const {
    formations,
    loading: formationsLoading,
    error: formationsError,
    addFormation,
    editFormation,
    addMatchResult,
    deleteFormation: deleteFormationFromDb,
    deleteMatchResult,
    downloadBackup: downloadFormationsBackup,
  } = useFormations();
  
  const allPlayers = players || [];

  const [activeTab, setActiveTab] = useState<string>('ST');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddRatingDialogOpen, setAddRatingDialogOpen] = useState(false);
  const [isAddFormationDialogOpen, setAddFormationDialogOpen] = useState(false);
  const [isEditFormationDialogOpen, setEditFormationDialogOpen] = useState(false);
  const [isAddMatchDialogOpen, setAddMatchDialogOpen] = useState(false);
  const [isEditCardDialogOpen, setEditCardDialogOpen] = useState(false);
  const [isEditPlayerDialogOpen, setEditPlayerDialogOpen] = useState(false);
  const [isPlayerDetailDialogOpen, setPlayerDetailDialogOpen] = useState(false);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [viewingImageName, setViewingImageName] = useState<string | null>(null);
  const [addDialogInitialData, setAddDialogInitialData] = useState<Partial<AddRatingFormValues> | undefined>(undefined);
  const [addMatchInitialData, setAddMatchInitialData] = useState<{ formationId: string; formationName: string } | undefined>(undefined);
  const [editCardDialogInitialData, setEditCardDialogInitialData] = useState<EditCardFormValues | undefined>(undefined);
  const [editPlayerDialogInitialData, setEditPlayerDialogInitialData] = useState<EditPlayerFormValues | undefined>(undefined);
  const [editFormationDialogInitialData, setEditFormationDialogInitialData] = useState<Tactic | undefined>(undefined);
  const [selectedFlatPlayer, setSelectedFlatPlayer] = useState<FlatPlayer | null>(null);

  // State for filters and pagination
  const [cardFilter, setCardFilter] = useState<string>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<Record<string, number>>({});
  
  const { toast } = useToast();

  const handleOpenAddRating = (initialData?: Partial<AddRatingFormValues>) => {
    setAddDialogInitialData(initialData);
    setAddRatingDialogOpen(true);
  };
  
  const handleOpenEditCard = (player: Player, card: PlayerCardType) => {
    setEditCardDialogInitialData({
        playerId: player.id,
        cardId: card.id,
        cardStyle: card.cardStyle,
        league: card.league || 'Sin Liga',
        imageUrl: card.imageUrl || '',
    });
    setEditCardDialogOpen(true);
  };

  const handleOpenEditPlayer = (player: Player) => {
    setEditPlayerDialogInitialData({
      playerId: player.id,
      currentPlayerName: player.name,
      nationality: player.nationality,
    });
    setEditPlayerDialogOpen(true);
  };

  const handleOpenPlayerDetail = (flatPlayer: FlatPlayer) => {
    setSelectedFlatPlayer(flatPlayer);
    setPlayerDetailDialogOpen(true);
  };
  
  const handleOpenEditFormation = (formation: Tactic) => {
    setEditFormationDialogInitialData(formation);
    setEditFormationDialogOpen(true);
  };

  const handleViewImage = (url: string, name: string) => {
    setViewingImageUrl(url);
    setViewingImageName(name);
    setImageViewerOpen(true);
  };

  const handleOpenAddMatch = (formationId: string, formationName: string) => {
    setAddMatchInitialData({ formationId, formationName });
    setAddMatchDialogOpen(true);
  };
  
  const handleDownloadBackup = async () => {
    const playersData = await downloadPlayersBackup();
    const formationsData = await downloadFormationsBackup();
    
    if (!playersData || !formationsData) {
       toast({
        variant: "destructive",
        title: "Error en la Descarga",
        description: "No se pudo generar el archivo de backup.",
      });
      return;
    }
    
    const backupData = {
      players: playersData,
      formations: formationsData,
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'EAFCTracker_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Descarga Iniciada",
      description: "El backup de la base de datos se está descargando.",
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm('');
    setCardFilter('all');
    setLeagueFilter('all');
  };
  
  const getHeaderButtons = () => {
    switch(activeTab) {
      case 'formations':
        return (
          <Button onClick={() => setAddFormationDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Añadir Formación</span>
            <span className="inline sm:hidden">Formación</span>
          </Button>
        );
      default:
        return (
            <Button onClick={() => handleOpenAddRating({ position: activeTab as Position })}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Añadir Valoración</span>
              <span className="inline sm:hidden">Valoración</span>
            </Button>
        );
    }
  };
  
  const handlePageChange = (position: Position, direction: 'next' | 'prev') => {
    setPagination(prev => {
      const currentPage = prev[position] || 0;
      const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
      return { ...prev, [position]: Math.max(0, newPage) };
    });
  };


  const error = playersError || formationsError;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center p-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error de Conexión</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (playersLoading || formationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Conectando a la base de datos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
       <AddRatingDialog
        open={isAddRatingDialogOpen}
        onOpenChange={setAddRatingDialogOpen}
        onAddRating={addRating}
        players={allPlayers}
        initialData={addDialogInitialData}
      />
      <AddFormationDialog
        open={isAddFormationDialogOpen}
        onOpenChange={setAddFormationDialogOpen}
        onAddFormation={addFormation as (values: AddTacticFormValues) => void}
      />
      <EditFormationDialog
        open={isEditFormationDialogOpen}
        onOpenChange={setEditFormationDialogOpen}
        onEditFormation={editFormation as (values: EditTacticFormValues) => void}
        initialData={editFormationDialogInitialData}
      />
      <AddMatchDialog
        open={isAddMatchDialogOpen}
        onOpenChange={setAddMatchDialogOpen}
        onAddMatch={addMatchResult}
        initialData={addMatchInitialData}
      />
      <EditCardDialog
        open={isEditCardDialogOpen}
        onOpenChange={setEditCardDialogOpen}
        onEditCard={editCard}
        initialData={editCardDialogInitialData}
      />
      <EditPlayerDialog
        open={isEditPlayerDialogOpen}
        onOpenChange={setEditPlayerDialogOpen}
        onEditPlayer={editPlayer}
        initialData={editPlayerDialogInitialData}
      />
      <PlayerDetailDialog
        open={isPlayerDetailDialogOpen}
        onOpenChange={setPlayerDetailDialogOpen}
        flatPlayer={selectedFlatPlayer}
        onSaveTrainingBuild={saveTrainingBuild}
      />
      <AlertDialog open={isImageViewerOpen} onOpenChange={setImageViewerOpen}>
        <AlertDialogContent className="max-w-xl p-0">
          <AlertDialogHeader className="p-4 border-b">
            <AlertDialogTitle>{viewingImageName}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="p-4 flex justify-center items-center">
            {viewingImageUrl && (
              <Image
                src={viewingImageUrl}
                alt={viewingImageName || 'Tactic Image'}
                width={500}
                height={500}
                className="object-contain max-h-[80vh]"
              />
            )}
          </div>
          <AlertDialogFooter className="p-4 border-t">
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-3xl font-bold font-headline text-primary">
            EAFCTracker
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadBackup} variant="outline" size="sm">
                <Download className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Descargar Backup</span>
            </Button>
            {getHeaderButtons()}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="ST" className="w-full" onValueChange={handleTabChange} value={activeTab}>
           <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <TabsList className="inline-flex h-auto items-center justify-start rounded-md bg-muted p-1 text-muted-foreground sm:w-auto">
              {positions.map((pos) => (
                <TabsTrigger key={pos} value={pos} className="py-2">
                  <PositionIcon position={pos} className="mr-2 h-5 w-5"/>
                  {pos}
                </TabsTrigger>
              ))}
              <TabsTrigger value="formations" className="py-2 data-[state=active]:text-accent-foreground data-[state=active]:bg-accent">
                  <Trophy className="mr-2 h-5 w-5"/>
                  Formaciones
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          <TabsContent value="formations" className="mt-6">
            <FormationsDisplay
              formations={formations}
              onAddMatch={handleOpenAddMatch}
              onDeleteFormation={deleteFormationFromDb}
              onEdit={handleOpenEditFormation}
              onViewImage={handleViewImage}
              onDeleteMatchResult={deleteMatchResult}
            />
          </TabsContent>

          {positions.map((pos) => {
            // 1. Calculate detailed stats for each player/card combination
            const flatPlayerList: FlatPlayer[] = allPlayers.flatMap(player => 
                (player.cards || []).map(card => {
                    const ratingsForPos = card.ratingsByPosition?.[pos] || [];
                    const stats = calculateStats(ratingsForPos);
                    const recentRatings = ratingsForPos.slice(-3).map(r => r.value);
                    const recentStats = calculateStats(ratingsForPos.slice(-3));

                    const highPerfPositions = new Set<Position>();
                    for (const p in card.ratingsByPosition) {
                        const positionKey = p as Position;
                        const posRatings = card.ratingsByPosition[positionKey];
                        if (posRatings && posRatings.length > 0) {
                           const posAvg = calculateStats(posRatings).average;
                           if (posAvg >= 7.5) highPerfPositions.add(positionKey);
                        }
                    }
                    
                    const hasBuildForPos = !!(card.trainingBuilds?.[pos] && Object.keys(card.trainingBuilds[pos]!).length > 0);

                    const performance: PlayerPerformance = {
                        stats,
                        isHotStreak: stats.matches >= 3 && recentStats.average > stats.average + 0.5,
                        isConsistent: stats.matches >= 5 && stats.stdDev < 0.5,
                        isPromising: stats.matches > 0 && stats.matches < 10, // Must have at least 1 match
                        isVersatile: highPerfPositions.size >= 3,
                    };

                    return { player, card, ratingsForPos, performance, hasTrainingBuild: hasBuildForPos };
                })
            );
            
            // 2. Filter the list
            const filteredPlayerList = flatPlayerList.filter(({ ratingsForPos }) => {
                // This is the strict filter: only show if there are ratings for this specific position.
                return ratingsForPos.length > 0;

            }).filter(({ player, card }) => {
                const searchMatch = normalizeText(player.name).includes(normalizeText(searchTerm));
                const cardMatch = cardFilter === 'all' || card.cardStyle === cardFilter;
                const leagueMatch = leagueFilter === 'all' || card.league === leagueFilter;
                return searchMatch && cardMatch && leagueMatch;
            
            }).sort((a, b) => {
              // 3. Sort the list
              const avgA = a.performance.stats.average;
              const avgB = b.performance.stats.average;
              const matchesA = a.performance.stats.matches;
              const matchesB = b.performance.stats.matches;

              // Prioritize players with ratings over those without
              if (matchesB > 0 && matchesA === 0) return 1;
              if (matchesA > 0 && matchesB === 0) return -1;
              
              // Then sort by average rating
              if (avgB !== avgA) return avgB - avgA;

              // Finally, sort by number of matches
              return matchesB - matchesA;
            });

            const currentPage = pagination[pos] || 0;
            const paginatedPlayers = filteredPlayerList.slice(
              currentPage * ITEMS_PER_PAGE,
              (currentPage + 1) * ITEMS_PER_PAGE
            );
            const totalPages = Math.ceil(filteredPlayerList.length / ITEMS_PER_PAGE);
            
            const allPositionalCards = new Set<CardStyle>();
            flatPlayerList.forEach(p => {
              if (p.ratingsForPos.length > 0) {
                allPositionalCards.add(p.card.cardStyle)
              }
            });
            const uniqueCardStyles = Array.from(allPositionalCards);

            const allPositionalLeagues = new Set<string>();
            flatPlayerList.forEach(p => {
              if (p.ratingsForPos.length > 0 && p.card.league) {
                allPositionalLeagues.add(p.card.league)
              }
            });
            const uniqueLeagues = Array.from(allPositionalLeagues).sort();


            return (
              <TabsContent key={pos} value={pos} className="mt-6">
                <Card>
                    <CardHeader>
                       <PlayerTable.Filters
                          searchTerm={searchTerm}
                          onSearchTermChange={setSearchTerm}
                          cardFilter={cardFilter}
                          onCardFilterChange={setCardFilter}
                          leagueFilter={leagueFilter}
                          onLeagueFilterChange={setLeagueFilter}
                          uniqueCardStyles={uniqueCardStyles}
                          uniqueLeagues={uniqueLeagues}
                        />
                    </CardHeader>
                    <PlayerTable
                      players={paginatedPlayers}
                      position={pos}
                      onOpenAddRating={handleOpenAddRating}
                      onOpenEditCard={handleOpenEditCard}
                      onOpenEditPlayer={handleOpenEditPlayer}
                      onOpenPlayerDetail={handleOpenPlayerDetail}
                      onDeleteCard={deleteCard}
                      onDeleteRating={deleteRating}
                    />
                    <PlayerTable.Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(direction) => handlePageChange(pos, direction)}
                    />
                  </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}

    
  

    