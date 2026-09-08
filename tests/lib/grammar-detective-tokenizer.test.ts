// tests/lib/grammar-detective-tokenizer.test.ts
import { describe, it, expect } from 'vitest';
import { tokenizeCaseDocument } from '@/lib/grammar-detective-tokenizer';
import type { CaseError } from '@/types/grammar-detective';

describe('tokenizeCaseDocument', () => {
  it('segments text into words, whitespace, and punctuation while preserving original text', () => {
    const text = 'Hello, world!\nHow are you today?';
    const tokens = tokenizeCaseDocument(text, []);

    const reconstructed = tokens.map((t) => t.text).join('');
    expect(reconstructed).toBe(text);

    const words = tokens.filter((t) => t.isWord);
    expect(words.map((w) => w.text)).toEqual([
      'Hello',
      'world',
      'How',
      'are',
      'you',
      'today',
    ]);
  });

  it('correctly maps errors to specific word tokens by word index', () => {
    const text = 'Yesterday we deploy the patch.';
    const errors: CaseError[] = [
      {
        id: 'err-1',
        targetWord: 'deploy',
        tokenIndex: 2, // word 0: Yesterday, word 1: we, word 2: deploy
        errorType: 'tense',
        options: [
          {
            id: 'opt-1',
            text: 'deployed',
            isCorrect: true,
            feedbackEn: 'Correct past tense',
            feedbackVi: 'Đúng thì quá khứ đơn',
          },
          {
            id: 'opt-2',
            text: 'deploying',
            isCorrect: false,
            feedbackEn: 'Needs auxiliary was/were',
            feedbackVi: 'Thiếu to-be',
          },
        ],
        explanationEn: 'Use past tense deployed for yesterday',
        explanationVi: 'Dùng deployed cho thời điểm hôm qua',
      },
    ];

    const tokens = tokenizeCaseDocument(text, errors);
    const deployToken = tokens.find((t) => t.text === 'deploy');

    expect(deployToken).toBeDefined();
    expect(deployToken?.errorId).toBe('err-1');
    expect(deployToken?.isWord).toBe(true);

    const innocentToken = tokens.find((t) => t.text === 'Yesterday');
    expect(innocentToken?.errorId).toBeNull();
  });

  it('handles contractions like "don\'t" as single word tokens', () => {
    const text = "He don't know the answer.";
    const tokens = tokenizeCaseDocument(text, []);
    const words = tokens.filter((t) => t.isWord);
    expect(words[1].text).toBe("don't");
  });
});
