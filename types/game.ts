export type GameStatus =
  | 'lobby'
  | 'choosing_theme'
  | 'giving_clues'
  | 'discussing'
  | 'sorting'
  | 'results';

export interface Room {
  id: string;
  code: string;
  host_id: string | null;
  theme: string | null;
  status: GameStatus;
  lives: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  number: number | null;
  clue: string | null;
  position: number | null;
  is_host: boolean;
  joined_at: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  examples: string[];
  created_at: string;
}

export interface GameResult {
  id: string;
  room_id: string;
  theme: string;
  is_correct: boolean;
  errors: number;
  player_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  player_id: string;
  message: string;
  created_at: string;
}

export interface PlayerWithClue extends Player {
  clue: string;
}

export interface SortablePlayer {
  id: string;
  name: string;
  clue: string;
  number?: number; // Only visible after reveal
}
