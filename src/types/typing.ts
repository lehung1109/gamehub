export interface FillBlankQuestion {
  id: string;
  textBefore: string;
  baseVerb: string;
  textAfter: string;
  correctAnswer: string;
  acceptableAlternatives?: string[];
  explanation?: {
    ruleVi: string;
    detailedAnalysisVi: string;
  };
}

export interface TypingGameState {
  currentIndex: number;
  score: number;
  status: 'playing' | 'completed';
  userInput: string;
  isCorrect: boolean | null; // null means not answered yet for current question
}
