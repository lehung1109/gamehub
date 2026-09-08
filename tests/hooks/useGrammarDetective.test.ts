// tests/hooks/useGrammarDetective.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGrammarDetective } from '@/hooks/useGrammarDetective';
import type { CaseFile } from '@/types/grammar-detective';

const mockCase: CaseFile = {
  id: 'mock-1',
  title: 'Mock Case',
  titleVi: 'Vụ án giả định',
  category: 'email',
  rankTier: 'intern',
  sender: 'test@example.com',
  recipient: 'all@example.com',
  subject: 'Test Subject',
  documentText: 'We deploy today.',
  errors: [
    {
      id: 'err-1',
      targetWord: 'deploy',
      tokenIndex: 1, // word 0: We, word 1: deploy
      errorType: 'tense',
      options: [
        {
          id: 'opt-1',
          text: 'deployed',
          isCorrect: true,
          feedbackEn: 'Correct',
          feedbackVi: 'Đúng',
        },
        {
          id: 'opt-2',
          text: 'deploying',
          isCorrect: false,
          feedbackEn: 'Wrong',
          feedbackVi: 'Sai',
        },
      ],
      explanationEn: 'Rule EN',
      explanationVi: 'Rule VI',
    },
  ],
};

describe('useGrammarDetective hook', () => {
  it('initializes in selecting mode and selects a case', () => {
    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    expect(result.current.status).toBe('selecting');
    expect(result.current.currentCase).toBeNull();

    act(() => {
      result.current.selectCase('mock-1');
    });

    expect(result.current.status).toBe('investigating');
    expect(result.current.currentCase?.id).toBe('mock-1');
    expect(result.current.credibility).toBe(3);
    expect(result.current.tokens.length).toBeGreaterThan(0);
  });

  it('opens deduction modal when tapping an erroneous word', () => {
    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    act(() => {
      result.current.selectCase('mock-1');
    });

    const deployToken = result.current.tokens.find((t) => t.text === 'deploy');
    expect(deployToken).toBeDefined();

    act(() => {
      result.current.tapToken(deployToken!.id);
    });

    expect(result.current.status).toBe('deducing');
    expect(result.current.activeError?.id).toBe('err-1');
  });

  it('replaces token and solves case when correct option is submitted', () => {
    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    act(() => {
      result.current.selectCase('mock-1');
    });

    const deployToken = result.current.tokens.find((t) => t.text === 'deploy');

    act(() => {
      result.current.tapToken(deployToken!.id);
    });

    act(() => {
      const isCorrect = result.current.submitDeduction('opt-1');
      expect(isCorrect).toBe(true);
    });

    expect(result.current.status).toBe('solved');
    expect(result.current.starsEarned).toBe(3);
    const updatedToken = result.current.tokens.find((t) => t.id === deployToken!.id);
    expect(updatedToken?.text).toBe('deployed');
    expect(updatedToken?.isCorrected).toBe(true);
  });

  it('deducts credibility on false alarm (tapping innocent word)', () => {
    const { result } = renderHook(() => useGrammarDetective([mockCase]));

    act(() => {
      result.current.selectCase('mock-1');
    });

    const weToken = result.current.tokens.find((t) => t.text === 'We');

    act(() => {
      result.current.tapToken(weToken!.id);
    });

    expect(result.current.credibility).toBe(2);
    expect(result.current.mistakes).toBe(1);
    expect(result.current.lastFeedback?.type).toBe('false_alarm');
  });
});
