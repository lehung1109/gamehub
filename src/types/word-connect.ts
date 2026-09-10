export interface WordConnectWordInfo {
  word: string;
  vietnameseMeaning: string;
  phonetic: string;
  partOfSpeech: string;
  exampleSentence: string;
}

export interface WordConnectLevel {
  id: string;
  levelNumber: number;
  letters: string[];
  targetWords: WordConnectWordInfo[];
  bonusWords?: string[];
  theme?: string;
  difficulty: "easy" | "medium" | "hard";
}

export type WordConnectSubmissionType =
  | "target"
  | "already_solved"
  | "bonus"
  | "already_solved_bonus"
  | "invalid";

export interface WordConnectSubmissionResult {
  type: WordConnectSubmissionType;
  word?: string;
  wordInfo?: WordConnectWordInfo;
}

export interface WordConnectHintResult {
  word: string;
  letterIndex: number;
  letter: string;
}

export interface WordConnectState {
  currentLevel: WordConnectLevel;
  levelIndex: number;
  selectedLetters: number[];
  solvedWords: string[];
  foundBonusWords: string[];
  revealedHints: Record<string, number[]>;
  currentInput: string;
  errorShake: boolean;
  statusMessage: string | null;
  isCompleted: boolean;
  score: number;
  hintsUsedCount: number;
}
