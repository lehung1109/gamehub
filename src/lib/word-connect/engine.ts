import { shuffle } from "@/lib/shuffle";
import {
  WordConnectHintResult,
  WordConnectLevel,
  WordConnectSubmissionResult,
  WordConnectWordInfo,
} from "@/types/word-connect";

/**
 * Validates a submitted word against target and bonus words of the current level.
 */
export function checkWordSubmission(
  word: string,
  level: WordConnectLevel,
  solvedWords: string[],
  foundBonusWords?: string[]
): WordConnectSubmissionResult {
  const cleaned = (word || "").trim().toUpperCase();
  if (!cleaned) {
    return { type: "invalid", word: "" };
  }

  const solvedSet = new Set((solvedWords || []).map((w) => w.trim().toUpperCase()));
  const bonusSolvedSet = new Set((foundBonusWords || []).map((w) => w.trim().toUpperCase()));

  const targetMatch = level.targetWords.find(
    (tw) => tw.word.trim().toUpperCase() === cleaned
  );

  if (targetMatch) {
    if (solvedSet.has(cleaned)) {
      return {
        type: "already_solved",
        word: targetMatch.word,
        wordInfo: targetMatch,
      };
    }
    return {
      type: "target",
      word: targetMatch.word,
      wordInfo: targetMatch,
    };
  }

  const bonusMatch = (level.bonusWords || []).find(
    (bw) => bw.trim().toUpperCase() === cleaned
  );

  if (bonusMatch) {
    if (bonusSolvedSet.has(cleaned)) {
      return {
        type: "already_solved_bonus",
        word: bonusMatch,
      };
    }
    return {
      type: "bonus",
      word: bonusMatch,
    };
  }

  return {
    type: "invalid",
    word: cleaned,
  };
}

/**
 * Picks a random unrevealed letter index for an unsolved target word.
 * Returns null if all target words are solved or all letters are already revealed.
 */
export function revealRandomHintLetter(
  targetWords: WordConnectWordInfo[],
  solvedWords: string[],
  revealedMap: Record<string, number[]>
): WordConnectHintResult | null {
  if (!targetWords || targetWords.length === 0) {
    return null;
  }

  const solvedSet = new Set((solvedWords || []).map((w) => w.trim().toUpperCase()));
  const map = revealedMap || {};

  const candidates: WordConnectHintResult[] = [];

  for (const wordInfo of targetWords) {
    const wordKey = wordInfo.word;
    const wordUpper = wordKey.trim().toUpperCase();

    if (solvedSet.has(wordUpper)) {
      continue;
    }

    const revealedIndices = new Set(map[wordKey] || map[wordUpper] || []);

    for (let i = 0; i < wordKey.length; i++) {
      if (!revealedIndices.has(i)) {
        candidates.push({
          word: wordKey,
          letterIndex: i,
          letter: wordKey[i],
        });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Randomizes the order of letters for the letter wheel, preserving the multiset of characters.
 */
export function shuffleLetters(letters: string[]): string[] {
  if (!letters || letters.length <= 1) {
    return [...(letters || [])];
  }

  let result = shuffle(letters);
  for (let attempt = 0; attempt < 5; attempt++) {
    if (result.some((char, idx) => char !== letters[idx])) {
      return result;
    }
    result = shuffle(letters);
  }
  return result;
}
