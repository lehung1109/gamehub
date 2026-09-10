// src/lib/odd-one-out/engine.ts

import { shuffle } from "@/lib/shuffle";
import {
  OddOneOutAnswerResult,
  OddOneOutQuestion,
} from "@/types/odd-one-out";

export const BASE_QUESTION_SCORE = 100;
export const STREAK_BONUS_PER_LEVEL = 20;
export const HINT_PENALTY = 25;

/**
 * Checks whether the user's selected item is the odd one out.
 * Throws an error if the selected item does not exist or if the question lacks an odd item.
 */
export function checkOddOneOutAnswer(
  question: OddOneOutQuestion,
  selectedId: string
): OddOneOutAnswerResult {
  const selectedItem = question.items.find((item) => item.id === selectedId);
  if (!selectedItem) {
    throw new Error(`Item with id "${selectedId}" not found in question "${question.id}".`);
  }

  const oddItem = question.items.find((item) => item.isOdd);
  if (!oddItem) {
    throw new Error(`No odd item found in question "${question.id}".`);
  }

  const isCorrect = Boolean(selectedItem.isOdd);

  return {
    isCorrect,
    selectedItem,
    oddItem,
    explanationVi: question.explanationVi,
    explanationEn: question.explanationEn,
  };
}

/**
 * Calculates 50/50 elimination for the current question.
 * Returns up to 2 IDs of non-odd items to eliminate.
 * Guarantees that the odd item (isOdd: true) is NEVER eliminated.
 */
export function calculateFiftyFiftyElimination(
  question: OddOneOutQuestion
): string[] {
  const nonOddItems = question.items.filter((item) => !item.isOdd);
  const shuffled = shuffle(nonOddItems);
  return shuffled.slice(0, 2).map((item) => item.id);
}

/**
 * Calculates the score earned for answering a question.
 * Returns 0 if incorrect.
 * When correct: Base score (100) + (streak * 20) - (hintsUsed * 25).
 * Score will not drop below 0.
 */
export function calculateQuestionScore(
  isCorrect: boolean,
  streak: number,
  hintsUsed: number
): number {
  if (!isCorrect) {
    return 0;
  }

  const safeStreak = Math.max(0, streak);
  const safeHints = Math.max(0, hintsUsed);
  const total =
    BASE_QUESTION_SCORE +
    safeStreak * STREAK_BONUS_PER_LEVEL -
    safeHints * HINT_PENALTY;

  return Math.max(0, total);
}
