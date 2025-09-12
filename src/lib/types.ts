
import type { Player as PlayerType, PlayerCard as PlayerCardType, Position as PositionType } from './types';
import * as z from "zod";

// EAFC PlayStyles
export const playerStyles = [
    'Básico', 'Rematador', 'Tirador Preciso', 'Cabeza Potente', 'Tiro Potente', 'Tiro de Calidad',
    'Pase Preciso', 'Pase con Efecto', 'Pase Balístico', 'Tiki Taka', 'Pase Largo', 'Bloqueo',
    'Intercepción', 'Implacable', 'Zapador', 'Primer Toque', 'Regate Veloz', 'Regate Hábil',
    'Vaselina', 'Trilero', 'Paso Rápido', 'Acrobático', 'Juego Aéreo', 'Trivela',
    'Barridas', 'Anticipación', 'Leñero', 'Infranqueable', 'Saque Largo', 'Parada Rápida', 'Salida Rápida'
] as const;

export type PlayerStyle = typeof playerStyles[number];

// EAFC Positions
export const positions = ['GK', 'RB', 'LB', 'CB', 'CDM', 'RM', 'LM', 'CM', 'CAM', 'RW', 'LW', 'ST'] as const;
export type Position = typeof positions[number];

// Position Roles
export const positionRoles = {
  GK: ['Goalkeeper', 'Sweeper Keeper'],
  RB: ['Full-Back', 'Wing-Back', 'Inverted Wing-Back'],
  LB: ['Full-Back', 'Wing-Back', 'Inverted Wing-Back'],
  CB: ['Center-Back', 'Stopper', 'Sweeper'],
  CDM: ['Anchor Man', 'Deep-Lying Playmaker', 'Ball-Winning Midfielder'],
  RM: ['Wide Midfielder', 'Winger'],
  LM: ['Wide Midfielder', 'Winger'],
  CM: ['Box-to-Box', 'Central Midfielder', 'Roaming Playmaker'],
  CAM: ['Attacking Midfielder', 'Advanced Playmaker', 'Trequartista'],
  RW: ['Winger', 'Inside Forward', 'Raumdeuter'],
  LW: ['Winger', 'Inside Forward', 'Raumdeuter'],
  ST: ['Poacher', 'Target Man', 'Complete Forward', 'Pressing Forward', 'False 9'],
} as const;

export type Role = typeof positionRoles[keyof typeof positionRoles][number];

// EAFC Leagues
export const leagues = [
    'Sin Liga', 'LALIGA EA SPORTS', 'Premier League', 'Serie A TIM', 'Bundesliga', 'Ligue 1 Uber Eats',
    'MLS', 'ROSHN Saudi League', 'Liga Portugal', 'Eredivisie', 'Google Pixel Frauen-Bundesliga',
    'Barclays Womens Super League', 'D1 Arkema', 'National Womens Soccer League', 'Liga F',
    'Libertadores', 'Sudamericana', 'Superliga', 'Scottish Premiership', 'SSE Airtricity League', 'K-League 1',
    'Belgium Pro League', 'Credit Suisse Super League', 'Ekstraklasa', '3. Liga', 'Trendyol Super Lig',
    'Raiffeisen Superleague', 'Allsvenskan', 'Eliteserien', ' cinch Premiership'
] as const;

export type League = typeof leagues[number];

export const trainingAttributes = [
    'shooting', 'passing', 'dribbling', 'dexterity', 
    'lower_body_strength', 'aerial_strength', 'defending', 
    'gk_1', 'gk_2', 'gk_3'
] as const;
export type TrainingAttribute = typeof trainingAttributes[number];

export type TrainingBuild = {
    [key in TrainingAttribute]?: number;
};

export type PositionGroup = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export type Rating = {
  value: number;
  role?: Role;
}

export type PlayerCard = {
  id: string;
  name: string; // e.g., "TOTY", "Future Stars"
  style: PlayerStyle;
  league?: League;
  imageUrl?: string;
  ratingsByPosition: { [key in Position]?: Rating[] };
  trainingBuilds?: { [key in Position]?: TrainingBuild };
};

export type Player = {
  id: string;
  name: string;
  cards: PlayerCard[];
};

export type AddRatingFormValues = {
    playerId?: string;
    playerName: string;
    cardName: string;
    position: Position;
    style: PlayerStyle;
    league?: League;
    rating: number;
    role?: Role;
}

export type EditCardFormValues = {
    playerId: string;
    cardId: string;
    currentCardName: string;
    currentStyle: PlayerStyle;
    league?: League;
    imageUrl?: string;
};

export type EditPlayerFormValues = {
    playerId: string;
    currentPlayerName: string;
};

export type PlayersByPosition = {
  [key in Position]?: number;
};

export type Formation = {
  [key in Position]?: number;
};

// --- Tipos para Formaciones ---

export const tacticStyles = ['balanced', 'counter', 'short passing'] as const;
export type TacticStyle = typeof tacticStyles[number];

export const defenseStyles = ['balanced', 'deep', 'high', 'aggressive'] as const;
export type DefenseStyle = typeof defenseStyles[number];


export type MatchResult = {
  id: string;
  goalsFor: number;
  goalsAgainst: number;
  date: string; // ISO 8601 string
};

export type Tactic = {
  id: string;
  name: string;
  detail: string;
  formation: string;
  style: TacticStyle;
  defense: DefenseStyle;
  code: string;
  matches: MatchResult[];
};

export type AddTacticFormValues = {
  name: string;
  detail: string;
  formation: string;
  style: TacticStyle;
  defense: DefenseStyle;
  code: string;
};

export type EditTacticFormValues = AddTacticFormValues & {
  id: string;
};

export type AddMatchFormValues = {
  formationId: string;
  goalsFor: number;
  goalsAgainst: number;
}

// --- Tipos para componentes refactorizados

export type PlayerStats = {
    average: number;
    matches: number;
    stdDev: number;
};

export type PlayerPerformance = {
    stats: PlayerStats;
    isHotStreak: boolean;
    isConsistent: boolean;
    isPromising: boolean;
    isVersatile: boolean;
    mostCommonRole?: Role;
};

export type FlatPlayer = {
  player: PlayerType;
  card: PlayerCardType;
  ratingsForPos: Rating[];
  performance: PlayerPerformance;
  hasTrainingBuild: boolean;
};

