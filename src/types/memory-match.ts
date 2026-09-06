// src/types/memory-match.ts

export type MemoryCardType = 'emoji' | 'word';

export interface MemoryCard {
  id: string;
  wordId: string;
  type: MemoryCardType;
  content: string;
  english: string;
  phonetic?: string;
  vietnamese?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameState {
  status: 'idle' | 'playing' | 'completed';
  topicId: string;
  pairCount: 4 | 6 | 8;
  cards: MemoryCard[];
  flippedIndices: number[];
  matchedWordIds: string[];
  flips: number;
  isLocked: boolean;
  elapsedSeconds: number;
  stars: 1 | 2 | 3;
}
