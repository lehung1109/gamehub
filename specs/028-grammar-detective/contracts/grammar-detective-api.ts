// specs/028-grammar-detective/contracts/grammar-detective-api.ts

export type ContextCategory = 'email' | 'incident' | 'chat' | 'social';
export type RankTier = 'intern' | 'junior' | 'senior' | 'chief';
export type ErrorCategory = 'tense' | 'preposition' | 'collocation' | 'politeness' | 'spelling';

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

export interface GrammarDetectiveState {
  mode: 'case' | 'endless';
  currentCase: CaseFile | null;
  tokens: TextToken[];
  credibility: number;
  maxCredibility: number;
  solvedErrorIds: string[];
  activeError: CaseError | null;
  status: GameStatus;
  highlighterActive: boolean;
  mistakes: number;
  startTime: number | null;
  elapsedSeconds: number;
  starsEarned: number;
  userRank: RankTier;
  completedCaseIds: string[];
  streak: number;
}

export interface GrammarDetectiveActions {
  selectCase: (caseId: string) => void;
  startEndless: () => void;
  toggleHighlighter: () => void;
  tapToken: (token: TextToken) => void;
  submitDeduction: (optionId: string) => boolean;
  closeDeduction: () => void;
  retryCase: () => void;
  returnToDossier: () => void;
  nextEndlessRound: () => void;
}
