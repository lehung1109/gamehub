import React, { useMemo } from 'react';
import { VocabularyTerm } from '@/types/reading';
import { parseTextWithVocabulary } from '@/lib/textParser';
import { VocabularyTooltip } from './VocabularyTooltip';

interface PassageTextProps {
  title: string;
  text: string;
  vocabulary: VocabularyTerm[];
}

export function PassageText({ title, text, vocabulary }: PassageTextProps) {
  const tokens = useMemo(() => parseTextWithVocabulary(text, vocabulary), [text, vocabulary]);

  return (
    <div className="prose dark:prose-invert max-w-none">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="text-lg leading-relaxed whitespace-pre-wrap">
        {tokens.map((token, index) => {
          if (token.type === 'vocab') {
            return (
              <VocabularyTooltip key={index} term={token.term}>
                {token.content}
              </VocabularyTooltip>
            );
          }
          return <span key={index}>{token.content}</span>;
        })}
      </div>
    </div>
  );
}
