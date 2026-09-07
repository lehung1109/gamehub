// src/types/word-search.ts

export interface Coordinate {
  row: number; // 0 to 7
  col: number; // 0 to 7
}

export interface WordSearchCell {
  id: string; // e.g. "cell-r2-c4"
  row: number; // 0 to 7
  col: number; // 0 to 7
  letter: string; // Single uppercase English letter ('A' - 'Z')
  isSelected: boolean; // Part of current drag/tap selection
  isHinted: boolean; // True while pulsing as a hint starting letter
  matchedColors: string[]; // Array of pastel color hexes for completed words covering this cell
}

export type WordSearchDirection = 'horizontal' | 'vertical';

export interface WordSearchTargetWord {
  id: string; // e.g. "animals-cat"
  english: string; // Uppercase English word (e.g. "CAT")
  vietnamese: string; // e.g. "Con mèo"
  emoji: string; // e.g. "🐱"
  phonetic?: string; // e.g. "/kæt/"
  direction: WordSearchDirection; // 'horizontal' | 'vertical'
  coordinates: Coordinate[]; // Coordinates occupied on the 8x8 board
  isFound: boolean; // True once discovered
  color: string; // Assigned unique pastel hex
}

export interface WordSearchGameState {
  status: 'idle' | 'playing' | 'completed';
  topicId: string;
  wordCount: 4 | 5 | 6;
  grid: WordSearchCell[][]; // 8x8 matrix
  targetWords: WordSearchTargetWord[];
  selectedCoordinates: Coordinate[]; // Active selection path
  startCoordinate: Coordinate | null; // Drag/tap origin
  hintedCoordinate: Coordinate | null; // Coordinate currently flashing as hint
  hintCount: number; // Total hints used
  elapsedSeconds: number; // Stopwatch timer seconds
  stars: 1 | 2 | 3; // Final rating on completion
}
