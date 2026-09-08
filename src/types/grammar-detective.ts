// src/types/grammar-detective.ts

export type ContextCategory = 'email' | 'incident' | 'chat' | 'social';
export type RankTier = 'intern' | 'junior' | 'senior' | 'chief';
export type ErrorCategory =
  | 'tense'
  | 'preposition'
  | 'collocation'
  | 'politeness'
  | 'spelling';

export interface ErrorOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedbackEn: string;
  feedbackVi: string;
}

export interface CaseError {
  id: string;
  targetWord: string;
  tokenIndex: number;
  errorType: ErrorCategory;
  options: ErrorOption[];
  explanationEn: string;
  explanationVi: string;
}

export interface CaseFile {
  id: string;
  title: string;
  titleVi: string;
  category: ContextCategory;
  rankTier: RankTier;
  sender: string;
  recipient: string;
  subject: string;
  documentText: string;
  errors: CaseError[];
}

export interface TextToken {
  id: string;
  text: string;
  isWord: boolean;
  errorId: string | null;
  isCorrected: boolean;
}

export type GameStatus =
  | 'selecting'
  | 'investigating'
  | 'deducing'
  | 'solved'
  | 'cold';

export interface DetectiveSession {
  caseId: string;
  credibility: number;
  maxCredibility: number;
  solvedErrorIds: string[];
  mistakeCount: number;
  status: GameStatus;
  startTime: number;
  elapsedSeconds: number;
  starsEarned: number;
}

export interface DetectiveRank {
  tier: RankTier;
  name: string;
  titleVi: string;
  badgeEmoji: string;
  requiredSolvedCases: number;
}
