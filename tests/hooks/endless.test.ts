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
});
