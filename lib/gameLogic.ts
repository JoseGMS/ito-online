import { Player, PlayerWithClue } from '@/types/game';

/**
 * Check if the players are in correct order based on their numbers
 */
export const checkOrder = (players: Player[]): boolean => {
  for (let i = 0; i < players.length - 1; i++) {
    if (
      players[i].number === null ||
      players[i + 1].number === null ||
      players[i].number! > players[i + 1].number!
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Count how many pairs are out of order
 */
export const countErrors = (players: Player[]): number => {
  let errors = 0;
  for (let i = 0; i < players.length - 1; i++) {
    if (
      players[i].number !== null &&
      players[i + 1].number !== null &&
      players[i].number! > players[i + 1].number!
    ) {
      errors++;
    }
  }
  return errors;
};

/**
 * Validate if all players have given their clues
 */
export const allPlayersGaveClues = (players: Player[]): boolean => {
  return players.every((player) => player.clue && player.clue.trim() !== '');
};

/**
 * Check if clue is valid (not a number or obvious hint)
 */
export const validateClue = (clue: string): { valid: boolean; reason?: string } => {
  const trimmedClue = clue.trim();

  // Check minimum length
  if (trimmedClue.length < 2) {
    return { valid: false, reason: 'A pista deve ter pelo menos 2 caracteres' };
  }

  // Check for numbers in the clue
  if (/\d/.test(trimmedClue)) {
    return { valid: false, reason: 'A pista não pode conter números' };
  }

  // Check for obvious scale words (Portuguese)
  const forbiddenWords = [
    'nota',
    'pontos',
    'escala',
    'nível',
    'nivel',
    'grau',
    'maior',
    'menor',
    'médio',
    'medio',
    'máximo',
    'maximo',
    'mínimo',
    'minimo',
    'quase',
    'perto',
    'longe',
  ];

  const lowerClue = trimmedClue.toLowerCase();
  for (const word of forbiddenWords) {
    if (lowerClue.includes(word)) {
      return {
        valid: false,
        reason: `A pista não pode conter a palavra "${word}"`,
      };
    }
  }

  return { valid: true };
};

/**
 * Sort players by their position
 */
export const sortPlayersByPosition = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });
};

/**
 * Calculate score based on correct order and lives remaining
 */
export const calculateScore = (isCorrect: boolean, lives: number): number => {
  if (!isCorrect) return 0;
  return lives * 100; // 100 points per life remaining
};
