// tests/hooks/progression.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRankTier, isTierUnlocked } from '@/hooks/useGrammarDetective';

describe('Detective Rank & Progression Logic', () => {
  it('calculates rank tiers correctly based on solved case counts', () => {
    expect(calculateRankTier(0)).toBe('intern');
    expect(calculateRankTier(1)).toBe('intern');
    expect(calculateRankTier(2)).toBe('intern');
    expect(calculateRankTier(3)).toBe('junior');
    expect(calculateRankTier(5)).toBe('junior');
    expect(calculateRankTier(6)).toBe('senior');
    expect(calculateRankTier(8)).toBe('senior');
    expect(calculateRankTier(9)).toBe('chief');
    expect(calculateRankTier(15)).toBe('chief');
  });

  it('determines whether higher tiers are locked or unlocked', () => {
    // 0 cases solved
    expect(isTierUnlocked('intern', 0)).toBe(true);
    expect(isTierUnlocked('junior', 0)).toBe(false);
    expect(isTierUnlocked('senior', 0)).toBe(false);
    expect(isTierUnlocked('chief', 0)).toBe(false);

    // 3 cases solved
    expect(isTierUnlocked('intern', 3)).toBe(true);
    expect(isTierUnlocked('junior', 3)).toBe(true);
    expect(isTierUnlocked('senior', 3)).toBe(false);

    // 6 cases solved
    expect(isTierUnlocked('senior', 6)).toBe(true);
    expect(isTierUnlocked('chief', 6)).toBe(false);

    // 9 cases solved
    expect(isTierUnlocked('chief', 9)).toBe(true);
  });
});
