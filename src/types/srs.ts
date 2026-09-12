export interface SrsCard {
  id: string; // Deterministic: `${gameType}_${normalizedPrompt}`
  prompt: string;
  correctAnswer: string;
  selectedAnswer?: string | null;
  gameType: string;
  topic?: string;
  box: number; // 1 to 5 (Leitner box)
  lastReviewedAt: string | null; // ISO 8601
  nextReviewAt: string; // ISO 8601
  mistakeCount: number;
  successCount: number;
  isMastered: boolean;
}

export interface SrsReviewInput {
  cardId: string;
  rating: 'hard' | 'good' | 'easy';
}

export interface SrsReviewResult {
  updatedCard: SrsCard;
  earnedStars: number;
  newlyMastered: boolean;
}

export interface MistakeDeckSummary {
  totalCards: number;
  dueCount: number;
  masteredCount: number;
  learningCount: number; // Box 1-2
  reviewingCount: number; // Box 3-4
}
