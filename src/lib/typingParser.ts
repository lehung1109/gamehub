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
          const challenge = item as Record<string, unknown>;
          if (
            typeof challenge.textBefore === 'string' &&
            typeof challenge.textAfter === 'string' &&
            typeof challenge.correctAnswer === 'string' &&
            typeof challenge.baseVerb === 'string'
          ) {
            let explanation;
            if (typeof challenge.explanation === 'object' && challenge.explanation !== null) {
              const expl = challenge.explanation as Record<string, unknown>;
              if (typeof expl.ruleVi === 'string' && typeof expl.detailedAnalysisVi === 'string') {
                explanation = { ruleVi: expl.ruleVi, detailedAnalysisVi: expl.detailedAnalysisVi };
              }
            }
            
            questions.push({
              id: String(challenge.id),
              textBefore: challenge.textBefore,
              baseVerb: challenge.baseVerb,
              textAfter: challenge.textAfter,
              correctAnswer: challenge.correctAnswer,
              acceptableAlternatives: Array.isArray(challenge.acceptableAlternatives) 
                ? challenge.acceptableAlternatives.filter((a): a is string => typeof a === 'string')
                : undefined,
              explanation,
            });
          }
        }
      }
    }
  }

  return questions;
}
