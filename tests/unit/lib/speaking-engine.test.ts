import { describe, it, expect } from 'vitest';
import {
  calculateSpeakingWpm,
  evaluateSpeakingTurn,
  calculateSpeakingStars,
  calculateSpeakingRewards,
} from '@/lib/speaking-engine';

describe('speaking-engine', () => {
  describe('calculateSpeakingWpm', () => {
    it('calculates optimal rating and 100 fluency score for WPM between 60 and 140', () => {
      // 10 words in 6 seconds = 100 WPM
      const midOptimal = calculateSpeakingWpm(10, 6000);
      expect(midOptimal.wpm).toBe(100);
      expect(midOptimal.rating).toBe('optimal');
      expect(midOptimal.fluencyScore).toBe(100);

      // Boundary: 60 WPM (6 words in 6 seconds)
      const lowerBoundary = calculateSpeakingWpm(6, 6000);
      expect(lowerBoundary.wpm).toBe(60);
      expect(lowerBoundary.rating).toBe('optimal');
      expect(lowerBoundary.fluencyScore).toBe(100);

      // Boundary: 140 WPM (14 words in 6 seconds)
      const upperBoundary = calculateSpeakingWpm(14, 6000);
      expect(upperBoundary.wpm).toBe(140);
      expect(upperBoundary.rating).toBe('optimal');
      expect(upperBoundary.fluencyScore).toBe(100);
    });

    it('calculates slow rating and scaled fluency score for WPM < 60', () => {
      // 3 words in 6 seconds = 30 WPM
      // fluency = Math.max(50, Math.round(50 + (30 / 60) * 50)) = 75
      const slowHalf = calculateSpeakingWpm(3, 6000);
      expect(slowHalf.wpm).toBe(30);
      expect(slowHalf.rating).toBe('slow');
      expect(slowHalf.fluencyScore).toBe(75);

      // 0 words
      const zeroWords = calculateSpeakingWpm(0, 5000);
      expect(zeroWords.wpm).toBe(0);
      expect(zeroWords.rating).toBe('slow');
      expect(zeroWords.fluencyScore).toBe(50);
    });

    it('calculates fast rating and scaled fluency score for WPM > 140', () => {
      // 18 words in 6 seconds = 180 WPM
      // fluency = Math.max(70, Math.round(100 - ((180 - 140) / 100) * 30)) = 88
      const fastSpeech = calculateSpeakingWpm(18, 6000);
      expect(fastSpeech.wpm).toBe(180);
      expect(fastSpeech.rating).toBe('fast');
      expect(fastSpeech.fluencyScore).toBe(88);

      // Extremely fast: 30 words in 4 seconds = 450 WPM -> clamped to min 70
      const veryFast = calculateSpeakingWpm(30, 4000);
      expect(veryFast.wpm).toBe(450);
      expect(veryFast.rating).toBe('fast');
      expect(veryFast.fluencyScore).toBe(70);
    });

    it('handles boundary conditions safely (0ms, negative elapsedMs, negative words)', () => {
      // 0ms clamped to 1000ms: 2 words in 1s = 120 WPM
      const zeroMs = calculateSpeakingWpm(2, 0);
      expect(zeroMs.wpm).toBe(120);
      expect(zeroMs.rating).toBe('optimal');

      // Negative ms clamped to 1000ms
      const negMs = calculateSpeakingWpm(2, -500);
      expect(negMs.wpm).toBe(120);

      // Negative word count clamped to 0
      const negWords = calculateSpeakingWpm(-5, 3000);
      expect(negWords.wpm).toBe(0);
      expect(negWords.fluencyScore).toBe(50);
    });
  });

  describe('evaluateSpeakingTurn', () => {
    it('evaluates exact matches with 100% accuracy and encouraging feedback', () => {
      const result = evaluateSpeakingTurn('Hello world', 'Hello world');
      expect(result.accuracyScore).toBe(100);
      expect(result.mispronouncedWords).toEqual([]);
      expect(result.wordBreakdown).toHaveLength(2);
      expect(result.wordBreakdown[0]).toEqual({
        word: 'hello',
        isMatch: true,
        score: 100,
      });
      expect(result.wordBreakdown[1]).toEqual({
        word: 'world',
        isMatch: true,
        score: 100,
      });
      expect(result.fluencyScore).toBe(100);
      expect(result.feedbackVi).toContain('Xuất sắc!');
    });

    it('normalizes punctuation and case differences seamlessly', () => {
      const result = evaluateSpeakingTurn(
        "What's your favorite color?",
        'whats your favorite color'
      );
      expect(result.accuracyScore).toBe(100);
      expect(result.mispronouncedWords).toEqual([]);
      expect(result.wordBreakdown.every((w) => w.isMatch)).toBe(true);
    });

    it('tolerates slight phonetic typos when Levenshtein similarity >= 80%', () => {
      // 'helo' (4/5 = 80%), 'wrld' (4/5 = 80%)
      const result = evaluateSpeakingTurn('Hello world', 'helo wrld');
      expect(result.accuracyScore).toBe(100);
      expect(result.mispronouncedWords).toEqual([]);
      expect(result.wordBreakdown[0].isMatch).toBe(true);
      expect(result.wordBreakdown[0].score).toBeGreaterThanOrEqual(80);
      expect(result.wordBreakdown[1].isMatch).toBe(true);
      expect(result.wordBreakdown[1].score).toBeGreaterThanOrEqual(80);
    });

    it('correctly detects mispronounced words with similarity < 80%', () => {
      // target: Good morning class
      // spoken: Good morning cat ('class' vs 'cat' similarity < 80%)
      const result = evaluateSpeakingTurn('Good morning class', 'Good morning cat');
      expect(result.accuracyScore).toBe(67); // 2 out of 3 matched
      expect(result.mispronouncedWords).toEqual(['class']);
      expect(result.wordBreakdown[2].isMatch).toBe(false);
      expect(result.wordBreakdown[2].score).toBeLessThan(80);
      expect(result.feedbackVi).toContain('Cần luyện tập thêm!');
    });

    it('handles partial matches where student omits words in sequence', () => {
      // target: I would like a coffee
      // spoken: I like a coffee (omitted 'would')
      const result = evaluateSpeakingTurn('I would like a coffee', 'I like a coffee');
      expect(result.accuracyScore).toBe(80); // 4 out of 5 matched
      expect(result.mispronouncedWords).toEqual(['would']);
      expect(result.wordBreakdown.find((w) => w.word === 'would')?.isMatch).toBe(false);
      expect(result.feedbackVi).toContain('Rất tốt!');
    });

    it('handles extra filler words spoken gracefully', () => {
      // target: Nice to meet you
      // spoken: Um nice to meet you please
      const result = evaluateSpeakingTurn('Nice to meet you', 'Um nice to meet you please');
      expect(result.accuracyScore).toBe(100);
      expect(result.mispronouncedWords).toEqual([]);
    });

    it('calculates fluency score when elapsedMs is provided', () => {
      // 5 words spoken in 10000ms (10s) -> 30 WPM -> slow, fluency 75
      const result = evaluateSpeakingTurn(
        'I would like a coffee',
        'I would like a coffee',
        10000
      );
      expect(result.accuracyScore).toBe(100);
      expect(result.fluencyScore).toBe(75);
    });

    it('handles empty target or empty spoken input safely', () => {
      // Empty target text
      const emptyTarget = evaluateSpeakingTurn('', '');
      expect(emptyTarget.accuracyScore).toBe(100);
      expect(emptyTarget.wordBreakdown).toEqual([]);
      expect(emptyTarget.mispronouncedWords).toEqual([]);

      // Spoken text is completely silent/empty
      const emptySpoken = evaluateSpeakingTurn('Coffee please', '');
      expect(emptySpoken.accuracyScore).toBe(0);
      expect(emptySpoken.mispronouncedWords).toEqual(['coffee', 'please']);
      expect(emptySpoken.feedbackVi).toContain('Cần luyện tập thêm!');
    });
  });

  describe('calculateSpeakingStars', () => {
    it('awards 3 stars if overallScore >= 85 and pronunciationScore >= 80', () => {
      expect(calculateSpeakingStars(85, 80)).toBe(3);
      expect(calculateSpeakingStars(95, 90)).toBe(3);
      expect(calculateSpeakingStars(100, 80)).toBe(3);
    });

    it('awards 2 stars if overallScore >= 70 but pronunciationScore < 80', () => {
      expect(calculateSpeakingStars(85, 75)).toBe(2);
      expect(calculateSpeakingStars(70, 90)).toBe(2);
      expect(calculateSpeakingStars(70, 50)).toBe(2);
    });

    it('awards 1 star if overallScore < 70', () => {
      expect(calculateSpeakingStars(69, 100)).toBe(1);
      expect(calculateSpeakingStars(50, 50)).toBe(1);
      expect(calculateSpeakingStars(0, 0)).toBe(1);
    });
  });

  describe('calculateSpeakingRewards', () => {
    it('calculates stars and XP correctly for typical turn counts', () => {
      // 3 stars, 4 turns: 3 * 25 + 4 * 10 = 75 + 40 = 115
      const reward1 = calculateSpeakingRewards(3, 4);
      expect(reward1.starsEarned).toBe(3);
      expect(reward1.xpEarned).toBe(115);

      // 1 star, 2 turns: 1 * 25 + 2 * 10 = 25 + 20 = 45
      const reward2 = calculateSpeakingRewards(1, 2);
      expect(reward2.starsEarned).toBe(1);
      expect(reward2.xpEarned).toBe(45);
    });

    it('caps turn bonus at 10 turns', () => {
      // 2 stars, 15 turns: 2 * 25 + 10 * 10 = 50 + 100 = 150
      const reward = calculateSpeakingRewards(2, 15);
      expect(reward.starsEarned).toBe(2);
      expect(reward.xpEarned).toBe(150);
    });

    it('clamps stars into valid 1-3 range and negative turns to 0', () => {
      const reward = calculateSpeakingRewards(0, -2);
      expect(reward.starsEarned).toBe(1);
      expect(reward.xpEarned).toBe(25); // 1 * 25 + 0
    });
  });
});
