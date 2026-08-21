/**
 * Fisher-Yates shuffle algorithm for creating a randomized copy of an array.
 * Does not mutate the original array.
 * Gracefully returns empty array if input is not an array.
 */
export function shuffle<T>(array: T[]): T[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
