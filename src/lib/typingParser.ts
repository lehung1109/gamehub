import { FillBlankQuestion } from '@/types/typing';

export function parseTenseDataToTypingQuestions(tenseData: any): FillBlankQuestion[] {
  const questions: FillBlankQuestion[] = [];
  
  if (!tenseData || !tenseData.challenges) return questions;

  // Most of our fill-in-blank data seems to be in the "conjugation" section
  // but we can extract from any challenge category that has the required fields.
  for (const category in tenseData.challenges) {
    const challenges = tenseData.challenges[category];
    if (Array.isArray(challenges)) {
      for (const challenge of challenges) {
        if (
          challenge.textBefore !== undefined &&
          challenge.textAfter !== undefined &&
          challenge.correctAnswer !== undefined &&
          challenge.baseVerb !== undefined
        ) {
          questions.push({
            id: challenge.id,
            textBefore: challenge.textBefore,
            baseVerb: challenge.baseVerb,
            textAfter: challenge.textAfter,
            correctAnswer: challenge.correctAnswer,
            acceptableAlternatives: challenge.acceptableAlternatives,
            explanation: challenge.explanation,
          });
        }
      }
    }
  }

  return questions;
}
