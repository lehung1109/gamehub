import type {
  SrsCard,
  SrsReviewResult,
  MistakeDeckSummary,
} from '@/types/srs';

export const BOX_INTERVALS_HOURS: Record<number, number> = {
  1: 24,
  2: 72,
  3: 168,
  4: 336,
  5: 720,
};

export const BONUS_STARS_PER_MASTERED_CARD = 3;

export interface SessionMistakeItem {
  prompt: string;
  correctAnswer: string;
  selectedAnswer?: string | null;
  gameType: string;
  topic?: string;
}

export interface NextReviewCalculation {
  nextBox: number;
  nextReviewAt: string;
  earnedStars: number;
  isMastered: boolean;
}

/**
 * Deterministically generates a card ID from gameType and prompt.
 * Lowercases, trims outer spaces, and converts internal whitespace into underscores.
 */
export function generateCardId(gameType: string, prompt: string): string {
  const normalizedGameType = (gameType || '').trim().toLowerCase();
  const normalizedPrompt = (prompt || '').trim().toLowerCase().replace(/\s+/g, '_');
  return `${normalizedGameType}_${normalizedPrompt}`;
}

/**
 * Pure Leitner calculation:
 * - 'hard': Resets to Box 1, due in 24 hours, 0 stars, isMastered: false
 * - 'good': Advances 1 box (up to 5), due in box interval. If newly graduating to Box 5, awards 3 stars.
 * - 'easy': Advances 2 boxes (up to 5), due in box interval. If newly graduating to Box 5, awards 3 stars.
 */
export function calculateNextReview(
  currentBox: number,
  rating: 'hard' | 'good' | 'easy',
  now: Date = new Date()
): NextReviewCalculation {
  const normalizedCurrentBox = Math.max(1, Math.floor(currentBox || 1));
  let nextBox: number;
  let earnedStars = 0;
  let isMastered = false;

  if (rating === 'hard') {
    nextBox = 1;
    earnedStars = 0;
    isMastered = false;
  } else if (rating === 'good') {
    nextBox = Math.min(5, normalizedCurrentBox + 1);
    if (nextBox === 5 && normalizedCurrentBox < 5) {
      earnedStars = BONUS_STARS_PER_MASTERED_CARD;
      isMastered = true;
    } else if (nextBox === 5) {
      isMastered = true;
    }
  } else {
    // rating === 'easy'
    nextBox = Math.min(5, normalizedCurrentBox + 2);
    if (nextBox === 5 && normalizedCurrentBox < 5) {
      earnedStars = BONUS_STARS_PER_MASTERED_CARD;
      isMastered = true;
    } else if (nextBox === 5) {
      isMastered = true;
    }
  }

  const intervalHours = BOX_INTERVALS_HOURS[nextBox] ?? 24;
  const nextReviewAt = new Date(now.getTime() + intervalHours * 3600 * 1000).toISOString();

  return {
    nextBox,
    nextReviewAt,
    earnedStars,
    isMastered,
  };
}

/**
 * Applies a review rating to an individual SrsCard and returns the updated card and star rewards.
 */
export function applyReviewToCard(
  card: SrsCard,
  rating: 'hard' | 'good' | 'easy',
  now: Date = new Date()
): SrsReviewResult {
  const { nextBox, nextReviewAt, earnedStars, isMastered } = calculateNextReview(card.box, rating, now);
  const newlyMastered = isMastered && !card.isMastered;

  const updatedCard: SrsCard = {
    ...card,
    box: nextBox,
    lastReviewedAt: now.toISOString(),
    nextReviewAt,
    mistakeCount: rating === 'hard' ? card.mistakeCount + 1 : card.mistakeCount,
    successCount: rating === 'hard' ? 0 : card.successCount + 1,
    isMastered: rating === 'hard' ? false : (nextBox === 5 || card.isMastered),
  };

  return {
    updatedCard,
    earnedStars: newlyMastered ? earnedStars : 0,
    newlyMastered,
  };
}

/**
 * Ingests errors from a completed game session into the student's SRS mistake deck.
 * Deduplicates multiple errors of the same card in the same session.
 * Existing cards are reset to Box 1, have mistakeCount incremented, and are marked immediately due.
 * New cards are initialized at Box 1.
 */
export function ingestSessionMistakes(
  existingDeck: SrsCard[] = [],
  mistakes: SessionMistakeItem[] = [],
  now: Date = new Date()
): SrsCard[] {
  if (!mistakes || mistakes.length === 0) {
    return existingDeck ? existingDeck.map(card => ({ ...card })) : [];
  }

  const resultDeck: SrsCard[] = (existingDeck || []).map(card => ({ ...card }));
  const cardIndexMap = new Map<string, number>();
  resultDeck.forEach((card, index) => {
    cardIndexMap.set(card.id, index);
  });

  const processedCardIds = new Set<string>();

  for (const mistake of mistakes) {
    const cardId = generateCardId(mistake.gameType, mistake.prompt);
    if (processedCardIds.has(cardId)) {
      continue; // Deduplicate identical mistakes within the same session
    }
    processedCardIds.add(cardId);

    const existingIndex = cardIndexMap.get(cardId);
    if (existingIndex !== undefined) {
      const existing = resultDeck[existingIndex];
      resultDeck[existingIndex] = {
        ...existing,
        box: 1,
        mistakeCount: existing.mistakeCount + 1,
        selectedAnswer:
          mistake.selectedAnswer !== undefined ? mistake.selectedAnswer : existing.selectedAnswer,
        correctAnswer: mistake.correctAnswer || existing.correctAnswer,
        topic: mistake.topic || existing.topic,
        nextReviewAt: now.toISOString(),
        isMastered: false,
      };
    } else {
      const newCard: SrsCard = {
        id: cardId,
        prompt: mistake.prompt,
        correctAnswer: mistake.correctAnswer,
        selectedAnswer: mistake.selectedAnswer ?? null,
        gameType: mistake.gameType,
        topic: mistake.topic,
        box: 1,
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
        lastReviewedAt: null,
        nextReviewAt: now.toISOString(),
      };
      resultDeck.push(newCard);
      cardIndexMap.set(cardId, resultDeck.length - 1);
    }
  }

  return resultDeck;
}

/**
 * Filters cards that are due for review (nextReviewAt <= now) and sorts them:
 * Box ascending (Box 1 first), then mistakeCount descending (most failed first).
 */
export function getDueCards(deck: SrsCard[] = [], now: Date = new Date()): SrsCard[] {
  const nowTime = now.getTime();
  return deck
    .filter(card => {
      const reviewTime = Date.parse(card.nextReviewAt);
      return !Number.isNaN(reviewTime) && reviewTime <= nowTime;
    })
    .sort((a, b) => {
      if (a.box !== b.box) {
        return a.box - b.box;
      }
      if (b.mistakeCount !== a.mistakeCount) {
        return b.mistakeCount - a.mistakeCount;
      }
      return a.id.localeCompare(b.id);
    });
}

/**
 * Calculates aggregate summary metrics for a mistake deck.
 */
export function getDeckSummary(deck: SrsCard[] = [], now: Date = new Date()): MistakeDeckSummary {
  const nowTime = now.getTime();
  let dueCount = 0;
  let masteredCount = 0;
  let learningCount = 0;
  let reviewingCount = 0;

  for (const card of deck) {
    const reviewTime = Date.parse(card.nextReviewAt);
    if (!Number.isNaN(reviewTime) && reviewTime <= nowTime) {
      dueCount += 1;
    }

    if (card.isMastered || card.box >= 5) {
      masteredCount += 1;
    }

    if (card.box >= 1 && card.box <= 2) {
      learningCount += 1;
    } else if (card.box >= 3 && card.box <= 4) {
      reviewingCount += 1;
    }
  }

  return {
    totalCards: deck.length,
    dueCount,
    masteredCount,
    learningCount,
    reviewingCount,
  };
}
