/**
 * LocalStorage Persistence & Hydration Helper for Parts of Speech Practice
 */

import {
  IPartsOfSpeechProgressStorage,
  StageProgress,
  PartsOfSpeechStageType,
  PartsOfSpeechProgressMap,
  PartsOfSpeechProgressRecord,
  AttemptItem,
} from "@/types/parts-of-speech";

export const PARTS_OF_SPEECH_STORAGE_KEY = "gamehub_pos_progress_v1";

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
 * Creates an empty progress record for a specific lesson.
 */
export function createInitialProgressRecord(lessonId: string): PartsOfSpeechProgressRecord {
  return {
    lessonId,
    completed: false,
    stageScores: {
      wordFamily: createDefaultStageProgress(),
      fillInBlank: createDefaultStageProgress(),
      errorHunting: createDefaultStageProgress(),
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
  stageScores: PartsOfSpeechProgressRecord["stageScores"]
): {
  totalScore: number;
  maxPossibleScore: number;
  accuracyPercentage: number;
  completed: boolean;
} {
  const stages: PartsOfSpeechStageType[] = ["wordFamily", "fillInBlank", "errorHunting"];
  
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
let memoryFallback: PartsOfSpeechProgressMap = {};

/**
 * Retrieves the full progress map from LocalStorage (or in-memory fallback).
 */
export function getAllProgress(): PartsOfSpeechProgressMap {
  if (!isStorageAvailable()) {
    return { ...memoryFallback };
  }
  try {
    const raw = window.localStorage.getItem(PARTS_OF_SPEECH_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as PartsOfSpeechProgressMap;
  } catch {
    return {};
  }
}

/**
 * Retrieves the progress record for a single lesson by ID.
 */
export function getProgress(lessonId: string): PartsOfSpeechProgressRecord | null {
  if (!lessonId) return null;
  const all = getAllProgress();
  return all[lessonId] || null;
}

/**
 * Saves or updates progress for a specific stage of a lesson.
 */
export function saveStageProgress(
  lessonId: string,
  stage: PartsOfSpeechStageType,
  score: number,
  total: number,
  attemptHistory?: AttemptItem[]
): PartsOfSpeechProgressRecord {
  if (!lessonId) {
    return createInitialProgressRecord("");
  }
  const all = getAllProgress();
  const defaultRecord = createInitialProgressRecord(lessonId);
  const existing = all[lessonId] || defaultRecord;

  const clampedTotal = Math.max(0, total);
  const clampedScore = Math.min(clampedTotal, Math.max(0, score));

  const stageProgress: StageProgress = {
    score: clampedScore,
    total: clampedTotal,
    passed: clampedTotal > 0 && clampedScore >= Math.ceil(clampedTotal * 0.7), // Passing mark at >=70%
    completedAt: new Date().toISOString(),
    attemptHistory: attemptHistory,
  };

  const safeExistingStageScores: PartsOfSpeechProgressRecord["stageScores"] = {
    wordFamily: existing.stageScores?.wordFamily || defaultRecord.stageScores.wordFamily,
    fillInBlank: existing.stageScores?.fillInBlank || defaultRecord.stageScores.fillInBlank,
    errorHunting: existing.stageScores?.errorHunting || defaultRecord.stageScores.errorHunting,
  };

  const updatedStageScores = {
    ...safeExistingStageScores,
    [stage]: stageProgress,
  };

  const { totalScore, maxPossibleScore, accuracyPercentage, completed } =
    calculateAggregates(updatedStageScores);

  const updatedRecord: PartsOfSpeechProgressRecord = {
    ...existing,
    lessonId,
    stageScores: updatedStageScores,
    totalScore,
    maxPossibleScore,
    accuracyPercentage,
    completed,
    lastStudiedAt: new Date().toISOString(),
  };

  all[lessonId] = updatedRecord;
  memoryFallback = { ...all };

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(PARTS_OF_SPEECH_STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore write quota or security errors
    }
  }

  return updatedRecord;
}

/**
 * Clears stored progress for a single lesson.
 */
export function resetProgress(lessonId: string): void {
  if (!lessonId) return;
  const all = getAllProgress();
  if (all[lessonId]) {
    delete all[lessonId];
    delete memoryFallback[lessonId];
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(PARTS_OF_SPEECH_STORAGE_KEY, JSON.stringify(all));
      } catch {
        // Ignore write quota errors
      }
    }
  }
}

/**
 * Default storage service instance conforming to IPartsOfSpeechProgressStorage.
 */
export const partsOfSpeechProgressStorage: IPartsOfSpeechProgressStorage = {
  getProgress,
  getAllProgress,
  saveStageProgress,
  resetProgress,
};
