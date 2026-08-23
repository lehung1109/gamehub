/**
 * LocalStorage Persistence & Hydration Helper for Tenses Practice
 * Feature: 006-workplace-tense-practice
 */

import {
  ITenseProgressStorage,
  StageProgress,
  StageType,
  TensesProgressMap,
  TenseUserProgressRecord,
} from "@/types/tenses";

export const TENSE_STORAGE_KEY = "gamehub_tense_progress_v1";

/**
 * Checks whether localStorage is accessible in the current execution environment.
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a clean default StageProgress structure.
 */
export function createDefaultStageProgress(): StageProgress {
  return {
    score: 0,
    total: 0,
    passed: false,
  };
}

/**
 * Creates an empty progress record for a specific tense.
 */
export function createInitialProgressRecord(tenseId: string): TenseUserProgressRecord {
  return {
    tenseId,
    completed: false,
    stageScores: {
      conjugation: createDefaultStageProgress(),
      errorHunting: createDefaultStageProgress(),
      sentenceBuilding: createDefaultStageProgress(),
    },
    totalScore: 0,
    maxPossibleScore: 0,
    accuracyPercentage: 0,
    lastStudiedAt: new Date().toISOString(),
  };
}

/**
 * Calculates aggregated score totals and overall completion from stage scores.
 */
export function calculateAggregates(
  stageScores: TenseUserProgressRecord["stageScores"]
): {
  totalScore: number;
  maxPossibleScore: number;
  accuracyPercentage: number;
  completed: boolean;
} {
  const stages: StageType[] = ["conjugation", "errorHunting", "sentenceBuilding"];
  let totalScore = 0;
  let maxPossibleScore = 0;
  let allStagesCompleted = true;

  for (const stage of stages) {
    const st = stageScores[stage];
    if (!st || st.total === 0 || !st.passed) {
      allStagesCompleted = false;
    }
    if (st) {
      totalScore += st.score || 0;
      maxPossibleScore += st.total || 0;
    }
  }

  const accuracyPercentage =
    maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return {
    totalScore,
    maxPossibleScore,
    accuracyPercentage,
    completed: allStagesCompleted,
  };
}

/**
 * In-memory fallback map used when localStorage is not available (e.g. SSR or storage disabled).
 */
let memoryFallback: TensesProgressMap = {};

/**
 * Retrieves the full progress map from LocalStorage (or in-memory fallback).
 */
export function getAllProgress(): TensesProgressMap {
  if (!isStorageAvailable()) {
    return { ...memoryFallback };
  }
  try {
    const raw = window.localStorage.getItem(TENSE_STORAGE_KEY);
    if (!raw) return { ...memoryFallback };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ...memoryFallback };
    }
    return parsed as TensesProgressMap;
  } catch {
    return { ...memoryFallback };
  }
}

/**
 * Retrieves the progress record for a single tense by ID.
 */
export function getProgress(tenseId: string): TenseUserProgressRecord | null {
  if (!tenseId) return null;
  const all = getAllProgress();
  return all[tenseId] || null;
}

/**
 * Saves or updates progress for a specific stage of a tense.
 */
export function saveStageProgress(
  tenseId: string,
  stage: StageType,
  score: number,
  total: number
): TenseUserProgressRecord {
  if (!tenseId) {
    return createInitialProgressRecord("");
  }
  const all = getAllProgress();
  const defaultRecord = createInitialProgressRecord(tenseId);
  const existing = all[tenseId] || defaultRecord;

  const clampedTotal = Math.max(0, total);
  const clampedScore = Math.min(clampedTotal, Math.max(0, score));

  const stageProgress: StageProgress = {
    score: clampedScore,
    total: clampedTotal,
    passed: clampedTotal > 0 && clampedScore >= Math.ceil(clampedTotal * 0.7), // Passing mark at >=70%
    completedAt: new Date().toISOString(),
  };

  const safeExistingStageScores = {
    ...defaultRecord.stageScores,
    ...(existing.stageScores || {}),
  };

  const updatedStageScores = {
    ...safeExistingStageScores,
    [stage]: stageProgress,
  };

  const { totalScore, maxPossibleScore, accuracyPercentage, completed } =
    calculateAggregates(updatedStageScores);

  const updatedRecord: TenseUserProgressRecord = {
    ...existing,
    tenseId,
    stageScores: updatedStageScores,
    totalScore,
    maxPossibleScore,
    accuracyPercentage,
    completed,
    lastStudiedAt: new Date().toISOString(),
  };

  all[tenseId] = updatedRecord;
  memoryFallback = { ...all };

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(TENSE_STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore write quota or security errors
    }
  }

  return updatedRecord;
}

/**
 * Clears stored progress for a single tense.
 */
export function resetProgress(tenseId: string): void {
  if (!tenseId) return;
  const all = getAllProgress();
  if (all[tenseId]) {
    delete all[tenseId];
    delete memoryFallback[tenseId];
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(TENSE_STORAGE_KEY, JSON.stringify(all));
      } catch {
        // Ignore write quota errors
      }
    }
  }
}

/**
 * Default storage service instance conforming to ITenseProgressStorage.
 */
export const tenseProgressStorage: ITenseProgressStorage = {
  getProgress,
  getAllProgress,
  saveStageProgress,
  resetProgress,
};
