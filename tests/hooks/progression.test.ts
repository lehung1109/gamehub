// tests/hooks/progression.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { calculateRankTier, isTierUnlocked, useGrammarDetective } from '@/hooks/useGrammarDetective';

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

  it('preserves highestStreak in localStorage when solving regular cases', () => {
    // Seed localStorage with an existing record
    window.localStorage.setItem(
      'gamehub_grammar_detective_v1',
      JSON.stringify({ completedCaseIds: [], highestStreak: 15 })
    );

    const mockCase = {
      id: 'reg-1',
      title: 'Reg Case',
      titleVi: 'Vụ án',
      category: 'email' as const,
      rankTier: 'intern' as const,
      sender: 'a@test.com',
      recipient: 'b@test.com',
      subject: 'Test',
      documentText: 'I test.',
      errors: [
        {
          id: 'e1',
          targetWord: 'test',
          tokenIndex: 1,
          errorType: 'tense' as const,
          options: [{ id: 'o1', text: 'tested', isCorrect: true, feedbackEn: '', feedbackVi: '' }],
          explanationEn: 'ok',
          explanationVi: 'ok',
        },
      ],
    };

    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    expect(result.current.highestStreak).toBe(15);

    act(() => {
      result.current.selectCase('reg-1');
    });

    const target = result.current.tokens.find((t) => t.text === 'test');
    act(() => {
      result.current.tapToken(target!.id);
    });
    act(() => {
      result.current.submitDeduction('o1');
    });

    expect(result.current.status).toBe('solved');
    expect(result.current.highestStreak).toBe(15);

    // Verify localStorage still has highestStreak 15
    const stored = JSON.parse(window.localStorage.getItem('gamehub_grammar_detective_v1') || '{}');
    expect(stored.highestStreak).toBe(15);
    expect(stored.completedCaseIds).toContain('reg-1');
  });
});
