// tests/data/grammar-detective-data.test.ts
import { describe, it, expect } from 'vitest';
import casesData from '@/data/grammar-detective.json';
import { tokenizeCaseDocument } from '@/lib/grammar-detective-tokenizer';
import type { CaseFile } from '@/types/grammar-detective';

describe('grammar-detective dataset integrity', () => {
  const cases = casesData as unknown as CaseFile[];

  it('contains at least 12 cases spanning 4 tiers', () => {
    expect(cases.length).toBeGreaterThanOrEqual(12);
    const tiers = new Set(cases.map((c) => c.rankTier));
    expect(tiers).toEqual(new Set(['intern', 'junior', 'senior', 'chief']));
  });

  it('verifies that each case error tokenIndex points to the exact targetWord', () => {
    for (const c of cases) {
      const tokens = tokenizeCaseDocument(c.documentText, c.errors);
      const wordTokens = tokens.filter((t) => t.isWord);

      for (const err of c.errors) {
        expect(err.tokenIndex).toBeLessThan(wordTokens.length);
        const actualWordToken = wordTokens[err.tokenIndex];
        expect(actualWordToken).toBeDefined();

        // Target word should match or be a substring (e.g. for multi-word like 'to test')
        const normalizedTarget = err.targetWord.toLowerCase();
        const normalizedActual = actualWordToken.text.toLowerCase();
        const matches =
          normalizedActual.includes(normalizedTarget) ||
          normalizedTarget.includes(normalizedActual);

        expect(
          matches,
          `Case "${c.id}": Expected token at index ${err.tokenIndex} ("${actualWordToken.text}") to match targetWord "${err.targetWord}"`
        ).toBe(true);

        // Verify that the token received the errorId
        expect(actualWordToken.errorId).toBe(err.id);
      }
    }
  });

  it('verifies that every error has exactly 1 correct option and bilingual explanations', () => {
    for (const c of cases) {
      for (const err of c.errors) {
        const correctOptions = err.options.filter((opt) => opt.isCorrect);
        expect(
          correctOptions.length,
          `Case "${c.id}" error "${err.id}" must have exactly 1 correct option`
        ).toBe(1);

        expect(err.options.length).toBeGreaterThanOrEqual(2);
        expect(err.explanationEn.length).toBeGreaterThan(5);
        expect(err.explanationVi.length).toBeGreaterThan(5);
      }
    }
  });
});
