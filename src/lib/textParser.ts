import { VocabularyTerm } from '@/types/reading';

export type TextToken = 
  | { type: 'text'; content: string }
  | { type: 'vocab'; term: VocabularyTerm; content: string };

export function parseTextWithVocabulary(text: string, vocabulary: VocabularyTerm[]): TextToken[] {
  if (!vocabulary.length || !text) {
    return [{ type: 'text', content: text }];
  }

  // Create a regex to match any of the vocabulary words (case-insensitive)
  // Sort by length descending to match longer phrases first if any
  const sortedVocab = [...vocabulary].sort((a, b) => b.word.length - a.word.length);
  const escapedWords = sortedVocab.map(v => v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

  const tokens: TextToken[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchedWord = match[0];
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      tokens.push({ type: 'text', content: text.substring(lastIndex, startIndex) });
    }

    const term = sortedVocab.find(v => v.word.toLowerCase() === matchedWord.toLowerCase());
    if (term) {
      tokens.push({ type: 'vocab', term, content: matchedWord });
    } else {
      // Fallback just in case
      tokens.push({ type: 'text', content: matchedWord });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return tokens;
}
