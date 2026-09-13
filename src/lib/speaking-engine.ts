// src/lib/speaking-engine.ts
import { SpeakingRating, SpeakingWordMatch } from '@/types/speaking';

export interface SpeakingWpmResult {
  wpm: number;
  rating: SpeakingRating;
  fluencyScore: number;
}

export interface SpeakingTurnEvaluation {
  accuracyScore: number;
  fluencyScore: number;
  wordBreakdown: SpeakingWordMatch[];
  feedbackVi: string;
  mispronouncedWords: string[];
}

export interface SpeakingRewardsResult {
  xpEarned: number;
  starsEarned: number;
}

/**
 * Normalizes input text by lowercasing and stripping punctuation.
 */
export function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Computes standard Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      if (a.charAt(i - 1) === b.charAt(j - 1)) {
        dp[j] = prev;
      } else {
        dp[j] = Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      }
      prev = temp;
    }
  }

  return dp[b.length];
}

/**
 * Calculates similarity percentage between two words based on Levenshtein distance.
 */
export function wordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 100;
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(word1, word2);
  const similarity = Math.max(0, (1 - dist / maxLen) * 100);
  return Math.round(similarity);
}

/**
 * Calculates speaking Words Per Minute (WPM), qualitative rating, and fluency score.
 */
export function calculateSpeakingWpm(
  wordCount: number,
  elapsedMs: number
): SpeakingWpmResult {
  const safeElapsedMs = Math.max(1000, elapsedMs);
  const safeWordCount = Math.max(0, wordCount);
  const wpm = Math.round((safeWordCount / (safeElapsedMs / 1000)) * 60);

  let rating: SpeakingRating = 'optimal';
  let fluencyScore = 100;

  if (wpm >= 60 && wpm <= 140) {
    rating = 'optimal';
    fluencyScore = 100;
  } else if (wpm < 60) {
    rating = 'slow';
    fluencyScore = Math.max(50, Math.round(50 + (wpm / 60) * 50));
  } else {
    rating = 'fast';
    fluencyScore = Math.max(70, Math.round(100 - ((wpm - 140) / 100) * 30));
  }

  return {
    wpm,
    rating,
    fluencyScore,
  };
}

/**
 * Evaluates a spoken turn against target text with token-level Levenshtein similarity.
 */
export function evaluateSpeakingTurn(
  targetText: string,
  spokenText: string,
  elapsedMs?: number
): SpeakingTurnEvaluation {
  const targetTokens = normalizeTokens(targetText);
  const spokenTokens = normalizeTokens(spokenText);

  // Determine fluency score
  let fluencyScore = 100;
  if (elapsedMs !== undefined) {
    const wpmResult = calculateSpeakingWpm(spokenTokens.length, elapsedMs);
    fluencyScore = wpmResult.fluencyScore;
  }

  // Handle empty target edge case
  if (targetTokens.length === 0) {
    return {
      accuracyScore: 100,
      fluencyScore,
      wordBreakdown: [],
      feedbackVi: 'Xuất sắc! Bạn phát âm rất chuẩn xác và rõ ràng.',
      mispronouncedWords: [],
    };
  }

  // Handle empty spoken edge case
  if (spokenTokens.length === 0) {
    const wordBreakdown: SpeakingWordMatch[] = targetTokens.map((w) => ({
      word: w,
      isMatch: false,
      score: 0,
    }));
    return {
      accuracyScore: 0,
      fluencyScore,
      wordBreakdown,
      feedbackVi: 'Cần luyện tập thêm! Hãy lắng nghe âm mẫu và thử lại nhé.',
      mispronouncedWords: [...targetTokens],
    };
  }

  const n = targetTokens.length;
  const m = spokenTokens.length;

  // DP table to find optimal monotonic sequence alignment
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sim = wordSimilarity(targetTokens[i - 1], spokenTokens[j - 1]);
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + sim,
        dp[i - 1][j],
        dp[i][j - 1]
      );
    }
  }

  // Backtrack to extract matched pairs
  let i = n;
  let j = m;
  const targetScores: number[] = new Array(n).fill(0);
  const usedSpokenIndices = new Set<number>();

  while (i > 0 && j > 0) {
    const sim = wordSimilarity(targetTokens[i - 1], spokenTokens[j - 1]);
    if (dp[i][j] === dp[i - 1][j - 1] + sim && (sim > 0 || i === j)) {
      targetScores[i - 1] = sim;
      usedSpokenIndices.add(j - 1);
      i--;
      j--;
    } else if (dp[i][j] === dp[i][j - 1]) {
      j--;
    } else {
      targetScores[i - 1] = 0;
      i--;
    }
  }
  while (i > 0) {
    targetScores[i - 1] = 0;
    i--;
  }

  // Transposition recovery: if any target word had score < 80, check remaining unconsumed spoken words
  for (let idx = 0; idx < n; idx++) {
    if (targetScores[idx] < 80) {
      let bestUnusedIdx = -1;
      let bestUnusedScore = targetScores[idx];
      for (let sIdx = 0; sIdx < m; sIdx++) {
        if (!usedSpokenIndices.has(sIdx)) {
          const sim = wordSimilarity(targetTokens[idx], spokenTokens[sIdx]);
          if (sim > bestUnusedScore) {
            bestUnusedScore = sim;
            bestUnusedIdx = sIdx;
          }
        }
      }
      if (bestUnusedIdx !== -1 && bestUnusedScore >= 80) {
        targetScores[idx] = bestUnusedScore;
        usedSpokenIndices.add(bestUnusedIdx);
      }
    }
  }

  const wordBreakdown: SpeakingWordMatch[] = targetTokens.map((w, idx) => ({
    word: w,
    isMatch: targetScores[idx] >= 80,
    score: targetScores[idx],
  }));

  const matchedCount = wordBreakdown.filter((w) => w.isMatch).length;
  const accuracyScore = Math.round((matchedCount / n) * 100);
  const mispronouncedWords = wordBreakdown
    .filter((w) => !w.isMatch)
    .map((w) => w.word);

  let feedbackVi = 'Cần luyện tập thêm! Hãy lắng nghe âm mẫu và thử lại nhé.';
  if (accuracyScore >= 90) {
    feedbackVi = 'Xuất sắc! Bạn phát âm rất chuẩn xác và rõ ràng.';
  } else if (accuracyScore >= 70) {
    feedbackVi = 'Rất tốt! Bạn phát âm khá rõ ràng, hãy tiếp tục phát huy nhé.';
  }

  return {
    accuracyScore,
    fluencyScore,
    wordBreakdown,
    feedbackVi,
    mispronouncedWords,
  };
}

/**
 * Calculates star rating (1-3) based on overall score and pronunciation accuracy.
 */
export function calculateSpeakingStars(
  overallScore: number,
  pronunciationScore: number
): 1 | 2 | 3 {
  if (overallScore >= 85 && pronunciationScore >= 80) {
    return 3;
  }
  if (overallScore >= 70) {
    return 2;
  }
  return 1;
}

/**
 * Calculates XP and star rewards for completing a speaking session.
 */
export function calculateSpeakingRewards(
  stars: number,
  totalTurns: number
): SpeakingRewardsResult {
  const starsEarned = Math.max(1, Math.min(3, Math.round(stars)));
  const safeTurns = Math.max(0, Math.round(totalTurns));
  const xpEarned = starsEarned * 25 + Math.min(safeTurns, 10) * 10;

  return {
    xpEarned,
    starsEarned,
  };
}
