import { EvaluatedLetter } from "@/types/wordle";

export function evaluateWordleGuess(guess: string, target: string): EvaluatedLetter[] {
  const g = guess.trim().toUpperCase();
  const t = target.trim().toUpperCase();
  const len = t.length;

  const result: EvaluatedLetter[] = Array.from({ length: len }, (_, i) => ({
    char: g[i] || "",
    status: "absent",
  }));

  // Count available occurrences in target
  const targetCounts: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = t[i];
    targetCounts[char] = (targetCounts[char] || 0) + 1;
  }

  // Pass 1: Mark exact matches (correct - green)
  for (let i = 0; i < len; i++) {
    if (g[i] === t[i]) {
      result[i].status = "correct";
      targetCounts[g[i]] -= 1;
    }
  }

  // Pass 2: Mark misplaced occurrences (present - yellow)
  for (let i = 0; i < len; i++) {
    if (result[i].status !== "correct") {
      const char = g[i];
      if (char && targetCounts[char] && targetCounts[char] > 0) {
        result[i].status = "present";
        targetCounts[char] -= 1;
      } else {
        result[i].status = "absent";
      }
    }
  }

  return result;
}
