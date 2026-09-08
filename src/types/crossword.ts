export type Direction = "across" | "down";

export interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
  phonetic?: string;
  emoji?: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  number: number;
  isSolved: boolean;
  isRevealed: boolean;
}

export interface CrosswordCell {
  row: number;
  col: number;
  char: string;
  userChar: string;
  isBlocked: boolean;
  clueNumber?: number;
  acrossWordId?: string;
  downWordId?: string;
  isRevealed?: boolean;
}

export interface CrosswordBoard {
  rows: number;
  cols: number;
  grid: CrosswordCell[][];
  words: CrosswordWord[];
  topicId: string;
}
