// src/lib/grammar-detective-tokenizer.ts
import type { CaseError, TextToken } from '@/types/grammar-detective';

/**
 * Splits document text into words, whitespace, and punctuation tokens while preserving exact formatting.
 * Word tokens are matched against CaseError annotations by word index.
 */
export function tokenizeCaseDocument(
  text: string,
  errors: CaseError[] = []
): TextToken[] {
  const segmentRegex = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?|[^\s\w]+|\s+/g;
  const matches = text.match(segmentRegex) || [];

  let wordIndex = 0;
  const tokens: TextToken[] = [];

  for (let i = 0; i < matches.length; i++) {
    const raw = matches[i];
    const isWord = /[A-Za-z0-9]/.test(raw);
    let errorId: string | null = null;

    if (isWord) {
      const currentWordIdx = wordIndex;
      wordIndex++;

      const matchedError = errors.find((err) => err.tokenIndex === currentWordIdx);
      if (matchedError) {
        errorId = matchedError.id;
      }
    }

    tokens.push({
      id: `token-${i}`,
      text: raw,
      isWord,
      errorId,
      isCorrected: false,
    });
  }

  return tokens;
}
