// src/types/odd-one-out.ts

export type OddOneOutDifficulty = "easy" | "medium" | "hard";

export interface SemanticWordItem {
  id: string;
  word: string;
  vietnameseMeaning: string;
  phonetic: string;
  partOfSpeech: string;
  emoji: string;
  isOdd: boolean;
  reasonVi?: string;
  reasonEn?: string;
}

export interface OddOneOutQuestion {
  id: string;
  difficulty: OddOneOutDifficulty;
  themeVi: string;
  themeEn: string;
  commonTraitVi: string;
  commonTraitEn: string;
  explanationVi: string;
  explanationEn: string;
  items: SemanticWordItem[];
}

export interface OddOneOutAnswerResult {
  isCorrect: boolean;
  selectedItem: SemanticWordItem;
  oddItem: SemanticWordItem;
  explanationVi: string;
  explanationEn: string;
}

export interface OddOneOutState {
  questions: OddOneOutQuestion[];
  currentIndex: number;
  selectedId: string | null;
  eliminatedIds: string[];
  isClueVisible: boolean;
  isFiftyFiftyUsed: boolean;
  isAnswerChecked: boolean;
  score: number;
  streak: number;
  bestStreak: number;
  hintsUsed: number;
  history: OddOneOutAnswerResult[];
  isCompleted: boolean;
}
