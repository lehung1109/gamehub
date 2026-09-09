export type SpecialPowerType = "double_score" | "heal_life" | "slow_freeze";

export interface VocabularyItem {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  emoji?: string;
  topicId?: string;
}

export interface FallingWord {
  id: string;
  word: string; // Uppercase for consistent matching
  clue: string;
  phonetic?: string;
  emoji?: string;
  lane: number; // 0, 1, 2, 3
  y: number; // 0 to 100 percentage
  speed: number; // % per second
  typedIndex: number;
  isTargeted: boolean;
  specialType?: SpecialPowerType;
}

export interface PoppedWordSummary {
  word: string;
  clue: string;
  phonetic?: string;
  emoji?: string;
}

export interface FallingWordsState {
  fallingWords: FallingWord[];
  targetWordId: string | null;
  score: number;
  combo: number;
  maxCombo: number;
  lives: number; // 3 to 0
  timeLeft: number; // 60 to 0
  bombsAvailable: number; // 0 to 2
  isFrozen: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  topicId: string;
  wordsPopped: PoppedWordSummary[];
}
