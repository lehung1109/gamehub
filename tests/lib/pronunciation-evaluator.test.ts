import { describe, it, expect } from 'vitest';
import { evaluatePronunciation } from '@/lib/pronunciation-evaluator';

describe('evaluatePronunciation', () => {
  it('awards 100% accuracy and 3 stars for exact matches', () => {
    const result = evaluatePronunciation('schedule', 'schedule');
    expect(result.accuracy).toBe(100);
    expect(result.stars).toBe(3);
    expect(result.isPassed).toBe(true);
    expect(result.wordDetails[0].isMatch).toBe(true);
  });

  it('handles case-insensitivity and punctuation gracefully', () => {
    const result = evaluatePronunciation('Good morning, team!', 'good morning team');
    expect(result.accuracy).toBe(100);
    expect(result.stars).toBe(3);
    expect(result.isPassed).toBe(true);
    expect(result.wordDetails.every(w => w.isMatch)).toBe(true);
  });

  it('correctly calculates partial match for multi-word sentence', () => {
    const result = evaluatePronunciation('I deployed the application yesterday', 'I deployed the app yesterday');
    expect(result.accuracy).toBeGreaterThanOrEqual(70);
    expect(result.accuracy).toBeLessThan(100);
    expect(result.wordDetails.find(w => w.word === 'application')?.isMatch).toBe(false);
  });

  it('fails with 1 star and retry guidance when speech is empty or completely wrong', () => {
    const result = evaluatePronunciation('architecture', 'banana');
    expect(result.accuracy).toBeLessThan(50);
    expect(result.stars).toBe(1);
    expect(result.isPassed).toBe(false);
  });
});
