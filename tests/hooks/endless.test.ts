// tests/hooks/endless.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGrammarDetective } from '@/hooks/useGrammarDetective';
import type { CaseFile } from '@/types/grammar-detective';

const mockCases: CaseFile[] = [
  {
    id: 'case-endless-1',
    title: 'Endless 1',
    titleVi: 'Vô tận 1',
    category: 'email',
    rankTier: 'intern',
    sender: 'a@test.com',
    recipient: 'b@test.com',
    subject: 'Sub 1',
    documentText: 'Fix this.',
    errors: [
      {
        id: 'err-1',
        targetWord: 'this',
        tokenIndex: 1,
        errorType: 'tense',
        options: [
          {
            id: 'opt-c1',
            text: 'that',
            isCorrect: true,
            feedbackEn: 'Correct',
            feedbackVi: 'Đúng',
          },
        ],
        explanationEn: 'Rule 1',
        explanationVi: 'Quy tắc 1',
      },
    ],
  },
];

describe('Endless Audit Mode & Streak Tracking', () => {
  it('starts endless mode and tracks streak progression upon solving', () => {
    const { result } = renderHook(() => useGrammarDetective(mockCases));

    act(() => {
      result.current.startEndless();
    });

    expect(result.current.mode).toBe('endless');
    expect(result.current.status).toBe('investigating');
    expect(result.current.currentCase).not.toBeNull();

    const target = result.current.tokens.find((t) => t.text === 'this');
    act(() => {
      result.current.tapToken(target!.id);
    });

    act(() => {
      result.current.submitDeduction('opt-c1');
    });

    expect(result.current.status).toBe('solved');
    expect(result.current.streak).toBe(1);
  });

  it('resets streak to 0 and stays in endless mode on retry', () => {
    const { result } = renderHook(() => useGrammarDetective(mockCases));

    act(() => {
      result.current.startEndless();
    });

    const target = result.current.tokens.find((t) => t.text === 'this');
    act(() => {
      result.current.tapToken(target!.id);
    });
    act(() => {
      result.current.submitDeduction('opt-c1');
    });

    expect(result.current.streak).toBe(1);

    // Now retry in endless mode
    act(() => {
      result.current.retryCase();
    });

    expect(result.current.mode).toBe('endless');
    expect(result.current.streak).toBe(0);
    expect(result.current.status).toBe('investigating');
  });

  it('protects credibility when highlighter is inactive (reading mode)', () => {
    const { result } = renderHook(() => useGrammarDetective(mockCases));

    act(() => {
      result.current.selectCase('case-endless-1');
    });

    expect(result.current.highlighterActive).toBe(true);
    act(() => {
      result.current.toggleHighlighter();
    });
    expect(result.current.highlighterActive).toBe(false);

    // Tapping innocent word when highlighter is off should not deduct credibility
    const innocent = result.current.tokens.find((t) => t.text === 'Fix');
    act(() => {
      result.current.tapToken(innocent!.id);
    });

    expect(result.current.credibility).toBe(3);
    expect(result.current.mistakes).toBe(0);
    expect(result.current.lastFeedback?.messageVi).toContain('chế độ đọc');
  });

  it('prevents double-tap penalty on the same innocent word', () => {
    const { result } = renderHook(() => useGrammarDetective(mockCases));

    act(() => {
      result.current.selectCase('case-endless-1');
    });

    const innocent = result.current.tokens.find((t) => t.text === 'Fix');
    expect(innocent).toBeDefined();

    // First tap: credibility drops from 3 to 2
    act(() => {
      result.current.tapToken(innocent!.id);
    });
    expect(result.current.credibility).toBe(2);
    expect(result.current.mistakes).toBe(1);

    // Second tap on the same innocent word: should NOT drop credibility again
    act(() => {
      result.current.tapToken(innocent!.id);
    });
    expect(result.current.credibility).toBe(2);
    expect(result.current.mistakes).toBe(1);
    expect(result.current.lastFeedback?.messageVi).toContain('Bạn đã kiểm tra từ');
  });

  it('prevents repeated penalty for submitting the same wrong option', () => {
    const multiOptionCase: CaseFile = {
      ...mockCases[0],
      errors: [
        {
          id: 'err-multi',
          targetWord: 'this',
          tokenIndex: 1,
          errorType: 'tense',
          options: [
            { id: 'opt-good', text: 'that', isCorrect: true, feedbackEn: '', feedbackVi: '' },
            { id: 'opt-bad1', text: 'these', isCorrect: false, feedbackEn: '', feedbackVi: '' },
            { id: 'opt-bad2', text: 'those', isCorrect: false, feedbackEn: '', feedbackVi: '' },
          ],
          explanationEn: '',
          explanationVi: '',
        },
      ],
    };

    const { result } = renderHook(() => useGrammarDetective([multiOptionCase]));

    act(() => {
      result.current.selectCase(multiOptionCase.id);
    });

    const target = result.current.tokens.find((t) => t.text === 'this');
    act(() => {
      result.current.tapToken(target!.id);
    });

    // First wrong option click: credibility drops from 3 to 2
    act(() => {
      result.current.submitDeduction('opt-bad1');
    });
    expect(result.current.credibility).toBe(2);
    expect(result.current.attemptedOptionIds).toContain('opt-bad1');

    // Second click on the same wrong option: ignored, no penalty
    act(() => {
      result.current.submitDeduction('opt-bad1');
    });
    expect(result.current.credibility).toBe(2);
    expect(result.current.mistakes).toBe(1);
  });
});

