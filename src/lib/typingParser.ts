import { FillBlankQuestion } from '@/types/typing';

interface TenseData {
  challenges?: Record<string, unknown[]>;
}

export function parseTenseDataToTypingQuestions(tenseData: TenseData): FillBlankQuestion[] {
  const questions: FillBlankQuestion[] = [];
  
  if (!tenseData || !tenseData.challenges) return questions;

  // Most of our fill-in-blank data seems to be in the "conjugation" section
  // but we can extract from any challenge category that has the required fields.
  for (const category in tenseData.challenges) {
    const challenges = tenseData.challenges[category];
    if (Array.isArray(challenges)) {
      for (const item of challenges) {
        if (typeof item === 'object' && item !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const challenge = item as Record<string, any>;
          if (
            typeof challenge.textBefore === 'string' &&
            typeof challenge.textAfter === 'string' &&
            typeof challenge.correctAnswer === 'string' &&
            typeof challenge.baseVerb === 'string'
          ) {
            questions.push({
              id: String(challenge.id),
              textBefore: challenge.textBefore,
              baseVerb: challenge.baseVerb,
              textAfter: challenge.textAfter,
              correctAnswer: challenge.correctAnswer,
              acceptableAlternatives: Array.isArray(challenge.acceptableAlternatives) 
                ? challenge.acceptableAlternatives 
                : undefined,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              explanation: challenge.explanation as any,
            });
          }
        }
      }
    }
  }

  return questions;
}
