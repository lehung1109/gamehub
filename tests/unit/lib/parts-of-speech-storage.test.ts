import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createDefaultStageProgress,
  createInitialProgressRecord,
  calculateAggregates,
  getAllProgress,
  getProgress,
  saveStageProgress,
  resetProgress,
} from "@/lib/parts-of-speech-storage";

describe("parts-of-speech-storage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createDefaultStageProgress", () => {
    it("returns default stage progress structure", () => {
      const progress = createDefaultStageProgress();
      expect(progress).toEqual({ score: 0, total: 0, passed: false });
    });
  });

  describe("createInitialProgressRecord", () => {
    it("returns initial progress record for a given lesson ID", () => {
      const record = createInitialProgressRecord("noun");
      expect(record.lessonId).toBe("noun");
      expect(record.completed).toBe(false);
      expect(record.stageScores.wordFamily).toEqual({ score: 0, total: 0, passed: false });
      expect(record.stageScores.fillInBlank).toEqual({ score: 0, total: 0, passed: false });
      expect(record.stageScores.errorHunting).toEqual({ score: 0, total: 0, passed: false });
      expect(record.totalScore).toBe(0);
      expect(record.maxPossibleScore).toBe(0);
      expect(record.accuracyPercentage).toBe(0);
      expect(record.lastStudiedAt).toBeDefined();
    });
  });

  describe("calculateAggregates", () => {
    it("calculates aggregates correctly when not all stages are completed", () => {
      const stageScores = {
        wordFamily: { score: 8, total: 10, passed: true },
        fillInBlank: { score: 0, total: 0, passed: false },
        errorHunting: { score: 0, total: 0, passed: false },
      };
      const result = calculateAggregates(stageScores);
      expect(result.totalScore).toBe(8);
      expect(result.maxPossibleScore).toBe(10);
      expect(result.accuracyPercentage).toBe(80);
      expect(result.completed).toBe(false);
    });

    it("calculates aggregates correctly when all stages are completed", () => {
      const stageScores = {
        wordFamily: { score: 8, total: 10, passed: true },
        fillInBlank: { score: 5, total: 5, passed: true },
        errorHunting: { score: 4, total: 5, passed: true },
      };
      const result = calculateAggregates(stageScores);
      expect(result.totalScore).toBe(17);
      expect(result.maxPossibleScore).toBe(20);
      expect(result.accuracyPercentage).toBe(85);
      expect(result.completed).toBe(true);
    });
  });

  describe("Storage operations", () => {
    it("getAllProgress returns empty object when storage is empty", () => {
      expect(getAllProgress()).toEqual({});
    });

    it("saveStageProgress saves progress and updates aggregates", () => {
      const record = saveStageProgress("noun", "wordFamily", 8, 10);
      
      expect(record.lessonId).toBe("noun");
      expect(record.stageScores.wordFamily.score).toBe(8);
      expect(record.stageScores.wordFamily.total).toBe(10);
      expect(record.stageScores.wordFamily.passed).toBe(true);
      expect(record.completed).toBe(false);
      
      const stored = getProgress("noun");
      expect(stored?.stageScores.wordFamily.score).toBe(8);
    });

    it("saveStageProgress marks stage as failed if score is below 70%", () => {
      const record = saveStageProgress("noun", "wordFamily", 6, 10);
      expect(record.stageScores.wordFamily.passed).toBe(false);
    });

    it("resetProgress clears progress for a specific lesson", () => {
      saveStageProgress("noun", "wordFamily", 8, 10);
      saveStageProgress("verb", "wordFamily", 5, 5);
      
      expect(getProgress("noun")).toBeDefined();
      expect(getProgress("verb")).toBeDefined();
      
      resetProgress("noun");
      
      expect(getProgress("noun")).toBeNull();
      expect(getProgress("verb")).toBeDefined();
    });
  });
});
