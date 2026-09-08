// tests/hooks/credibility.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGrammarDetective } from '@/hooks/useGrammarDetective';
import type { CaseFile } from '@/types/grammar-detective';

const mockCase: CaseFile = {
  id: 'case-cred-1',
  title: 'Credibility Test Case',
  titleVi: 'Vụ án kiểm thử uy tín',
  category: 'email',
  rankTier: 'intern',
  sender: 'a@test.com',
  recipient: 'b@test.com',
  subject: 'Test',
  documentText: 'I see mistake here.',
  errors: [
    {
      id: 'err-1',
      targetWord: 'mistake',
      tokenIndex: 2, // word 0: I, word 1: see, word 2: mistake
      errorType: 'tense',
      options: [
        {
          id: 'opt-correct',
          text: 'mistakes',
          isCorrect: true,
          feedbackEn: 'Correct plural',
          feedbackVi: 'Đúng dạng số nhiều',
        },
        {
          id: 'opt-wrong-1',
          text: 'mistaken',
          isCorrect: false,
          feedbackEn: 'Wrong form',
          feedbackVi: 'Sai dạng',
        },
      ],
      explanationEn: 'Grammar rule EN',
      explanationVi: 'Quy tắc VI',
    },
  ],
};

describe('Detective Credibility & Star Ratings', () => {
  it('awards 3 stars when solved without mistakes', () => {
    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    act(() => {
      result.current.selectCase('case-cred-1');
    });

    const target = result.current.tokens.find((t) => t.text === 'mistake');
    act(() => {
      result.current.tapToken(target!.id);
    });

    act(() => {
      result.current.submitDeduction('opt-correct');
    });

    expect(result.current.status).toBe('solved');
    expect(result.current.credibility).toBe(3);
    expect(result.current.starsEarned).toBe(3);
  });

  it('awards 2 stars when solved after 1 mistake', () => {
    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    act(() => {
      result.current.selectCase('case-cred-1');
    });

    // 1 innocent word tap
    const innocent = result.current.tokens.find((t) => t.text === 'I');
    act(() => {
      result.current.tapToken(innocent!.id);
    });
    expect(result.current.credibility).toBe(2);

    // Now solve
    const target = result.current.tokens.find((t) => t.text === 'mistake');
    act(() => {
      result.current.tapToken(target!.id);
    });

    act(() => {
      result.current.submitDeduction('opt-correct');
    });

    expect(result.current.status).toBe('solved');
    expect(result.current.starsEarned).toBe(2);
  });

  it('triggers Case Cold when credibility drops to 0 via 3 mistakes', () => {
    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    act(() => {
      result.current.selectCase('case-cred-1');
    });

    const innocent = result.current.tokens.find((t) => t.text === 'I');
    act(() => {
      result.current.tapToken(innocent!.id); // 3 -> 2
    });
    act(() => {
      result.current.tapToken(innocent!.id); // 2 -> 1
    });
    act(() => {
      result.current.tapToken(innocent!.id); // 1 -> 0
    });

    expect(result.current.credibility).toBe(0);
    expect(result.current.status).toBe('cold');
    expect(result.current.mistakes).toBe(3);
  });
});
