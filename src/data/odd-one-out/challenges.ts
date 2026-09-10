import { OddOneOutDifficulty, OddOneOutQuestion } from "@/types/odd-one-out";
import rawChallenges from "./challenges.json";

export const ODD_ONE_OUT_CHALLENGES: OddOneOutQuestion[] =
  rawChallenges as OddOneOutQuestion[];

/**
 * Returns all challenges matching the specified difficulty level.
 */
export function getChallengesByDifficulty(
  difficulty: OddOneOutDifficulty
): OddOneOutQuestion[] {
  return ODD_ONE_OUT_CHALLENGES.filter((q) => q.difficulty === difficulty);
}

/**
 * Finds and returns a challenge by its unique identifier.
 */
export function getChallengeById(id: string): OddOneOutQuestion | undefined {
  return ODD_ONE_OUT_CHALLENGES.find((q) => q.id === id);
}

/**
 * Returns a randomized subset of challenges, optionally filtered by difficulty.
 * If count is omitted, defaults to 10.
 * If count exceeds available items, returns the whole available pool shuffled.
 */
export function getRandomChallenges(
  count: number = 10,
  difficulty?: OddOneOutDifficulty
): OddOneOutQuestion[] {
  const pool = difficulty
    ? getChallengesByDifficulty(difficulty)
    : [...ODD_ONE_OUT_CHALLENGES];

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Returns the total number of challenges available in the curriculum.
 */
export function getTotalChallenges(): number {
  return ODD_ONE_OUT_CHALLENGES.length;
}
