import { describe, it, expect } from 'vitest';
import {
  BOX_INTERVALS_HOURS,
  BONUS_STARS_PER_MASTERED_CARD,
  generateCardId,
  calculateNextReview,
  applyReviewToCard,
  ingestSessionMistakes,
  getDueCards,
  getDeckSummary,
} from '@/lib/srs';
import type { SrsCard } from '@/types/srs';

describe('SRS Leitner Engine', () => {
  const BASE_TIME = new Date('2026-09-12T10:00:00.000Z');

  describe('Constants', () => {
    it('defines correct box intervals in hours', () => {
      expect(BOX_INTERVALS_HOURS[1]).toBe(24);
      expect(BOX_INTERVALS_HOURS[2]).toBe(72);
      expect(BOX_INTERVALS_HOURS[3]).toBe(168);
      expect(BOX_INTERVALS_HOURS[4]).toBe(336);
      expect(BOX_INTERVALS_HOURS[5]).toBe(720);
    });

    it('defines bonus stars per mastered card as 3', () => {
      expect(BONUS_STARS_PER_MASTERED_CARD).toBe(3);
    });
  });

  describe('generateCardId', () => {
    it('generates deterministic card ID with normalized lowercase and underscored prompt', () => {
      const id = generateCardId('vocab-match', 'Apple');
      expect(id).toBe('vocab-match_apple');
    });

    it('trims whitespace and replaces multiple spaces with single underscores', () => {
      const id = generateCardId('  word-scramble  ', '  An   Apple   A   Day  ');
      expect(id).toBe('word-scramble_an_apple_a_day');
    });

    it('handles special characters and punctuation in prompts deterministically', () => {
      const id = generateCardId('grammar-quiz', 'She doesn\'t know!');
      expect(id).toBe('grammar-quiz_she_doesn\'t_know!');
    });

    it('handles empty or missing strings safely', () => {
      expect(generateCardId('', '')).toBe('_');
    });
  });

  describe('calculateNextReview', () => {
    describe('rating: "hard"', () => {
      it('resets box to 1 and sets next review in 24 hours regardless of current box', () => {
        const resultBox3 = calculateNextReview(3, 'hard', BASE_TIME);
        expect(resultBox3.nextBox).toBe(1);
        expect(resultBox3.nextReviewAt).toBe(new Date('2026-09-13T10:00:00.000Z').toISOString());
        expect(resultBox3.earnedStars).toBe(0);
        expect(resultBox3.isMastered).toBe(false);

        const resultBox5 = calculateNextReview(5, 'hard', BASE_TIME);
        expect(resultBox5.nextBox).toBe(1);
        expect(resultBox5.isMastered).toBe(false);
      });
    });

    describe('rating: "good"', () => {
      it('advances box by 1 and calculates correct nextReviewAt for boxes 1 to 4', () => {
        // Box 1 -> 2 (72 hours = 3 days)
        const res1 = calculateNextReview(1, 'good', BASE_TIME);
        expect(res1.nextBox).toBe(2);
        expect(res1.nextReviewAt).toBe(new Date('2026-09-15T10:00:00.000Z').toISOString());
        expect(res1.earnedStars).toBe(0);
        expect(res1.isMastered).toBe(false);

        // Box 2 -> 3 (168 hours = 7 days)
        const res2 = calculateNextReview(2, 'good', BASE_TIME);
        expect(res2.nextBox).toBe(3);
        expect(res2.nextReviewAt).toBe(new Date('2026-09-19T10:00:00.000Z').toISOString());

        // Box 3 -> 4 (336 hours = 14 days)
        const res3 = calculateNextReview(3, 'good', BASE_TIME);
        expect(res3.nextBox).toBe(4);
        expect(res3.nextReviewAt).toBe(new Date('2026-09-26T10:00:00.000Z').toISOString());
      });

      it('advances box 4 to 5, awards 3 bonus stars, and marks as mastered', () => {
        const res4 = calculateNextReview(4, 'good', BASE_TIME);
        expect(res4.nextBox).toBe(5);
        expect(res4.nextReviewAt).toBe(new Date('2026-10-12T10:00:00.000Z').toISOString()); // 30 days = 720h
        expect(res4.earnedStars).toBe(3);
        expect(res4.isMastered).toBe(true);
      });

      it('keeps box at 5 when reviewed from box 5 and does not award duplicate bonus stars', () => {
        const res5 = calculateNextReview(5, 'good', BASE_TIME);
        expect(res5.nextBox).toBe(5);
        expect(res5.earnedStars).toBe(0);
        expect(res5.isMastered).toBe(true);
      });
    });

    describe('rating: "easy"', () => {
      it('advances box by 2', () => {
        // Box 1 -> 3 (168h = 7d)
        const res1 = calculateNextReview(1, 'easy', BASE_TIME);
        expect(res1.nextBox).toBe(3);
        expect(res1.nextReviewAt).toBe(new Date('2026-09-19T10:00:00.000Z').toISOString());
        expect(res1.earnedStars).toBe(0);
        expect(res1.isMastered).toBe(false);

        // Box 2 -> 4 (336h = 14d)
        const res2 = calculateNextReview(2, 'easy', BASE_TIME);
        expect(res2.nextBox).toBe(4);
        expect(res2.earnedStars).toBe(0);
        expect(res2.isMastered).toBe(false);
      });

      it('caps at Box 5 and awards 3 stars when reaching Box 5 from Box 3 or Box 4', () => {
        // Box 3 + 2 -> Box 5 (capped)
        const res3 = calculateNextReview(3, 'easy', BASE_TIME);
        expect(res3.nextBox).toBe(5);
        expect(res3.earnedStars).toBe(3);
        expect(res3.isMastered).toBe(true);

        // Box 4 + 2 -> Box 5 (capped)
        const res4 = calculateNextReview(4, 'easy', BASE_TIME);
        expect(res4.nextBox).toBe(5);
        expect(res4.earnedStars).toBe(3);
        expect(res4.isMastered).toBe(true);
      });

      it('does not award duplicate bonus stars if already in Box 5', () => {
        const res5 = calculateNextReview(5, 'easy', BASE_TIME);
        expect(res5.nextBox).toBe(5);
        expect(res5.earnedStars).toBe(0);
        expect(res5.isMastered).toBe(true);
      });
    });

    it('defaults now parameter to current time if omitted', () => {
      const before = Date.now();
      const res = calculateNextReview(1, 'hard');
      const reviewTime = new Date(res.nextReviewAt).getTime();
      const after = Date.now();

      expect(reviewTime).toBeGreaterThanOrEqual(before + 24 * 3600 * 1000);
      expect(reviewTime).toBeLessThanOrEqual(after + 24 * 3600 * 1000);
    });

    it('handles unexpected currentBox gracefully by clamping to valid range', () => {
      const res0 = calculateNextReview(0, 'good', BASE_TIME);
      expect(res0.nextBox).toBe(2);

      const resNegative = calculateNextReview(-2, 'good', BASE_TIME);
      expect(resNegative.nextBox).toBe(2);
    });
  });

  describe('applyReviewToCard', () => {
    const createSampleCard = (overrides: Partial<SrsCard> = {}): SrsCard => ({
      id: 'vocab-match_cat',
      prompt: 'Cat',
      correctAnswer: 'Con mèo',
      selectedAnswer: 'Con chó',
      gameType: 'vocab-match',
      topic: 'animals',
      box: 2,
      lastReviewedAt: '2026-09-01T10:00:00.000Z',
      nextReviewAt: '2026-09-04T10:00:00.000Z',
      mistakeCount: 3,
      successCount: 2,
      isMastered: false,
      ...overrides,
    });

    it('handles "hard" rating: resets to box 1, increments mistakeCount, resets successCount', () => {
      const card = createSampleCard({ box: 3, mistakeCount: 2, successCount: 4 });
      const result = applyReviewToCard(card, 'hard', BASE_TIME);

      expect(result.updatedCard.box).toBe(1);
      expect(result.updatedCard.mistakeCount).toBe(3);
      expect(result.updatedCard.successCount).toBe(0);
      expect(result.updatedCard.isMastered).toBe(false);
      expect(result.updatedCard.lastReviewedAt).toBe(BASE_TIME.toISOString());
      expect(result.updatedCard.nextReviewAt).toBe(new Date('2026-09-13T10:00:00.000Z').toISOString());
      expect(result.earnedStars).toBe(0);
      expect(result.newlyMastered).toBe(false);

      // Ensures immutability
      expect(card.box).toBe(3);
      expect(card.mistakeCount).toBe(2);
    });

    it('handles "good" rating: advances box, increments successCount, leaves mistakeCount unchanged', () => {
      const card = createSampleCard({ box: 2, mistakeCount: 1, successCount: 1 });
      const result = applyReviewToCard(card, 'good', BASE_TIME);

      expect(result.updatedCard.box).toBe(3);
      expect(result.updatedCard.mistakeCount).toBe(1);
      expect(result.updatedCard.successCount).toBe(2);
      expect(result.updatedCard.isMastered).toBe(false);
      expect(result.updatedCard.lastReviewedAt).toBe(BASE_TIME.toISOString());
      expect(result.earnedStars).toBe(0);
      expect(result.newlyMastered).toBe(false);
    });

    it('handles graduating to Box 5: sets isMastered, newlyMastered, and awards 3 stars', () => {
      const card = createSampleCard({ box: 4, isMastered: false });
      const result = applyReviewToCard(card, 'good', BASE_TIME);

      expect(result.updatedCard.box).toBe(5);
      expect(result.updatedCard.isMastered).toBe(true);
      expect(result.newlyMastered).toBe(true);
      expect(result.earnedStars).toBe(3);
    });

    it('handles reviewing an already-mastered card with "good": newlyMastered is false, 0 earned stars', () => {
      const card = createSampleCard({ box: 5, isMastered: true });
      const result = applyReviewToCard(card, 'good', BASE_TIME);

      expect(result.updatedCard.box).toBe(5);
      expect(result.updatedCard.isMastered).toBe(true);
      expect(result.newlyMastered).toBe(false);
      expect(result.earnedStars).toBe(0);
    });

    it('handles "easy" jump to Box 5 from Box 3: awards 3 bonus stars', () => {
      const card = createSampleCard({ box: 3, isMastered: false });
      const result = applyReviewToCard(card, 'easy', BASE_TIME);

      expect(result.updatedCard.box).toBe(5);
      expect(result.updatedCard.isMastered).toBe(true);
      expect(result.newlyMastered).toBe(true);
      expect(result.earnedStars).toBe(3);
    });

    it('resets mastered status when a previously mastered card gets "hard"', () => {
      const card = createSampleCard({ box: 5, isMastered: true, successCount: 10 });
      const result = applyReviewToCard(card, 'hard', BASE_TIME);

      expect(result.updatedCard.box).toBe(1);
      expect(result.updatedCard.isMastered).toBe(false);
      expect(result.updatedCard.successCount).toBe(0);
      expect(result.newlyMastered).toBe(false);
      expect(result.earnedStars).toBe(0);
    });
  });

  describe('ingestSessionMistakes', () => {
    it('creates new cards at Box 1 when deck is empty', () => {
      const mistakes = [
        {
          prompt: 'Elephant',
          correctAnswer: 'Con voi',
          selectedAnswer: 'Con chuột',
          gameType: 'vocab-match',
          topic: 'animals',
        },
      ];

      const deck = ingestSessionMistakes([], mistakes, BASE_TIME);
      expect(deck).toHaveLength(1);
      expect(deck[0]).toEqual({
        id: 'vocab-match_elephant',
        prompt: 'Elephant',
        correctAnswer: 'Con voi',
        selectedAnswer: 'Con chuột',
        gameType: 'vocab-match',
        topic: 'animals',
        box: 1,
        mistakeCount: 1,
        successCount: 0,
        isMastered: false,
        lastReviewedAt: null,
        nextReviewAt: BASE_TIME.toISOString(),
      });
    });

    it('updates existing cards: resets box to 1, increments mistakeCount, sets nextReviewAt to now, isMastered to false', () => {
      const existingDeck: SrsCard[] = [
        {
          id: 'vocab-match_elephant',
          prompt: 'Elephant',
          correctAnswer: 'Con voi',
          selectedAnswer: 'Con hổ',
          gameType: 'vocab-match',
          topic: 'animals',
          box: 4,
          mistakeCount: 2,
          successCount: 5,
          isMastered: true,
          lastReviewedAt: '2026-09-01T10:00:00.000Z',
          nextReviewAt: '2026-09-20T10:00:00.000Z',
        },
      ];

      const mistakes = [
        {
          prompt: 'Elephant',
          correctAnswer: 'Con voi',
          selectedAnswer: 'Con bò',
          gameType: 'vocab-match',
        },
      ];

      const updatedDeck = ingestSessionMistakes(existingDeck, mistakes, BASE_TIME);
      expect(updatedDeck).toHaveLength(1);
      const card = updatedDeck[0];
      expect(card.box).toBe(1);
      expect(card.mistakeCount).toBe(3); // 2 + 1
      expect(card.successCount).toBe(5); // preserved
      expect(card.isMastered).toBe(false); // reset
      expect(card.selectedAnswer).toBe('Con bò'); // updated
      expect(card.nextReviewAt).toBe(BASE_TIME.toISOString()); // immediately due
      expect(card.lastReviewedAt).toBe('2026-09-01T10:00:00.000Z'); // preserved
      expect(card.topic).toBe('animals'); // preserved
    });

    it('deduplicates identical mistakes occurring within the same session', () => {
      const mistakes = [
        {
          prompt: 'Giraffe',
          correctAnswer: 'Hươu cao cổ',
          selectedAnswer: 'Hươu',
          gameType: 'listening',
        },
        {
          prompt: 'Giraffe',
          correctAnswer: 'Hươu cao cổ',
          selectedAnswer: 'Hươu sao',
          gameType: 'listening',
        },
      ];

      const deck = ingestSessionMistakes([], mistakes, BASE_TIME);
      expect(deck).toHaveLength(1);
      expect(deck[0].id).toBe('listening_giraffe');
      expect(deck[0].mistakeCount).toBe(1); // Not 2!
    });

    it('handles a mix of existing cards and new cards without mutating input array', () => {
      const existing: SrsCard[] = [
        {
          id: 'vocab-match_dog',
          prompt: 'Dog',
          correctAnswer: 'Con chó',
          gameType: 'vocab-match',
          box: 2,
          mistakeCount: 1,
          successCount: 2,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-15T10:00:00.000Z',
        },
      ];

      const mistakes = [
        { prompt: 'Cat', correctAnswer: 'Con mèo', gameType: 'vocab-match' },
        { prompt: 'Dog', correctAnswer: 'Con chó', gameType: 'vocab-match' },
      ];

      const result = ingestSessionMistakes(existing, mistakes, BASE_TIME);
      expect(result).toHaveLength(2);
      expect(existing).toHaveLength(1); // Original unchanged
      expect(existing[0].mistakeCount).toBe(1);

      const dogCard = result.find(c => c.id === 'vocab-match_dog');
      const catCard = result.find(c => c.id === 'vocab-match_cat');
      expect(dogCard?.box).toBe(1);
      expect(dogCard?.mistakeCount).toBe(2);
      expect(catCard?.box).toBe(1);
      expect(catCard?.mistakeCount).toBe(1);
    });

    it('returns a shallow copy of deck when mistakes is empty', () => {
      const existing: SrsCard[] = [
        {
          id: 'test',
          prompt: 'Test',
          correctAnswer: 'A',
          gameType: 'quiz',
          box: 1,
          mistakeCount: 1,
          successCount: 0,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: BASE_TIME.toISOString(),
        },
      ];
      const res = ingestSessionMistakes(existing, [], BASE_TIME);
      expect(res).toEqual(existing);
      expect(res).not.toBe(existing);
    });
  });

  describe('getDueCards', () => {
    it('filters out cards whose nextReviewAt is in the future', () => {
      const cards: SrsCard[] = [
        {
          id: 'c1',
          prompt: '1',
          correctAnswer: '1',
          gameType: 'g',
          box: 1,
          mistakeCount: 1,
          successCount: 0,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-12T09:00:00.000Z', // 1h past -> DUE
        },
        {
          id: 'c2',
          prompt: '2',
          correctAnswer: '2',
          gameType: 'g',
          box: 1,
          mistakeCount: 1,
          successCount: 0,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-12T10:00:00.000Z', // EXACTLY NOW -> DUE
        },
        {
          id: 'c3',
          prompt: '3',
          correctAnswer: '3',
          gameType: 'g',
          box: 1,
          mistakeCount: 1,
          successCount: 0,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-12T10:00:01.000Z', // 1s in future -> NOT DUE
        },
      ];

      const due = getDueCards(cards, BASE_TIME);
      expect(due.map(c => c.id)).toEqual(['c1', 'c2']);
    });

    it('sorts due cards by Box ascending first, then mistakeCount descending', () => {
      const cards: SrsCard[] = [
        {
          id: 'card_box2_mistakes_5',
          prompt: 'b2_m5',
          correctAnswer: 'A',
          gameType: 'g',
          box: 2,
          mistakeCount: 5,
          successCount: 1,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-10T00:00:00.000Z',
        },
        {
          id: 'card_box1_mistakes_2',
          prompt: 'b1_m2',
          correctAnswer: 'B',
          gameType: 'g',
          box: 1,
          mistakeCount: 2,
          successCount: 0,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-10T00:00:00.000Z',
        },
        {
          id: 'card_box1_mistakes_8',
          prompt: 'b1_m8',
          correctAnswer: 'C',
          gameType: 'g',
          box: 1,
          mistakeCount: 8,
          successCount: 0,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-10T00:00:00.000Z',
        },
        {
          id: 'card_box3_mistakes_1',
          prompt: 'b3_m1',
          correctAnswer: 'D',
          gameType: 'g',
          box: 3,
          mistakeCount: 1,
          successCount: 3,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-10T00:00:00.000Z',
        },
      ];

      const due = getDueCards(cards, BASE_TIME);
      expect(due.map(c => c.id)).toEqual([
        'card_box1_mistakes_8', // Box 1, highest mistakes (8)
        'card_box1_mistakes_2', // Box 1, lower mistakes (2)
        'card_box2_mistakes_5', // Box 2
        'card_box3_mistakes_1', // Box 3
      ]);
    });

    it('returns an empty array when deck is empty', () => {
      expect(getDueCards([], BASE_TIME)).toEqual([]);
    });
  });

  describe('getDeckSummary', () => {
    it('returns zeros for an empty deck', () => {
      const summary = getDeckSummary([], BASE_TIME);
      expect(summary).toEqual({
        totalCards: 0,
        dueCount: 0,
        masteredCount: 0,
        learningCount: 0,
        reviewingCount: 0,
      });
    });

    it('computes accurate counts for learning, reviewing, mastered, and due cards', () => {
      const deck: SrsCard[] = [
        // Learning: Box 1, due
        {
          id: '1',
          prompt: '1',
          correctAnswer: '1',
          gameType: 'g',
          box: 1,
          mistakeCount: 2,
          successCount: 0,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-11T00:00:00.000Z', // due
        },
        // Learning: Box 2, not due
        {
          id: '2',
          prompt: '2',
          correctAnswer: '2',
          gameType: 'g',
          box: 2,
          mistakeCount: 1,
          successCount: 1,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-15T00:00:00.000Z', // not due
        },
        // Reviewing: Box 3, due
        {
          id: '3',
          prompt: '3',
          correctAnswer: '3',
          gameType: 'g',
          box: 3,
          mistakeCount: 1,
          successCount: 2,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-12T00:00:00.000Z', // due
        },
        // Reviewing: Box 4, not due
        {
          id: '4',
          prompt: '4',
          correctAnswer: '4',
          gameType: 'g',
          box: 4,
          mistakeCount: 1,
          successCount: 3,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-09-25T00:00:00.000Z', // not due
        },
        // Mastered: Box 5 (isMastered: true), not due
        {
          id: '5',
          prompt: '5',
          correctAnswer: '5',
          gameType: 'g',
          box: 5,
          mistakeCount: 1,
          successCount: 4,
          isMastered: true,
          lastReviewedAt: null,
          nextReviewAt: '2026-10-12T00:00:00.000Z', // not due
        },
      ];

      const summary = getDeckSummary(deck, BASE_TIME);
      expect(summary).toEqual({
        totalCards: 5,
        dueCount: 2, // cards 1 and 3
        masteredCount: 1, // card 5
        learningCount: 2, // cards 1 and 2 (box 1, 2)
        reviewingCount: 2, // cards 3 and 4 (box 3, 4)
      });
    });

    it('counts card with box 5 as mastered even if isMastered flag is missing/false', () => {
      const deck: SrsCard[] = [
        {
          id: 'box5_legacy',
          prompt: 'legacy',
          correctAnswer: 'A',
          gameType: 'g',
          box: 5,
          mistakeCount: 1,
          successCount: 5,
          isMastered: false,
          lastReviewedAt: null,
          nextReviewAt: '2026-10-01T00:00:00.000Z',
        },
      ];

      const summary = getDeckSummary(deck, BASE_TIME);
      expect(summary.masteredCount).toBe(1);
    });
  });
});
