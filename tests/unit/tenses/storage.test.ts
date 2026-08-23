import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  TENSE_STORAGE_KEY,
  getAllProgress,
  getProgress,
  saveStageProgress,
  resetProgress,
  tenseProgressStorage,
  calculateAggregates,
  createInitialProgressRecord,
} from "@/lib/tenses/storage";

describe("Tense Progress Storage Helper", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("getAllProgress", () => {
    it("returns an empty map when localStorage is empty", () => {
      expect(getAllProgress()).toEqual({});
    });

    it("returns stored map when valid JSON exists in localStorage", () => {
      const sampleMap = {
        "present-simple": createInitialProgressRecord("present-simple"),
      };
      window.localStorage.setItem(TENSE_STORAGE_KEY, JSON.stringify(sampleMap));
      expect(getAllProgress()).toEqual(sampleMap);
    });

    it("handles corrupted JSON gracefully by returning empty object", () => {
      window.localStorage.setItem(TENSE_STORAGE_KEY, "invalid-json{{{");
      expect(getAllProgress()).toEqual({});
    });

    it("handles array or non-object payload gracefully", () => {
      window.localStorage.setItem(TENSE_STORAGE_KEY, JSON.stringify(["array", "not", "map"]));
      expect(getAllProgress()).toEqual({});
    });
  });

  describe("getProgress", () => {
    it("returns null for non-existent tense ID or empty id", () => {
      expect(getProgress("past-simple")).toBeNull();
      expect(getProgress("")).toBeNull();
    });

    it("returns the specific tense record when present", () => {
      saveStageProgress("present-simple", "conjugation", 8, 8);
      const record = getProgress("present-simple");
      expect(record).not.toBeNull();
      expect(record?.tenseId).toBe("present-simple");
      expect(record?.stageScores.conjugation.score).toBe(8);
      expect(record?.stageScores.conjugation.total).toBe(8);
      expect(record?.stageScores.conjugation.passed).toBe(true);
    });
  });

  describe("saveStageProgress", () => {
    it("saves stage progress and calculates aggregates accurately", () => {
      const record = saveStageProgress("present-simple", "conjugation", 7, 8);
      expect(record.totalScore).toBe(7);
      expect(record.maxPossibleScore).toBe(8);
      expect(record.accuracyPercentage).toBe(88); // 7/8 = 87.5% -> 88%
      expect(record.completed).toBe(false);

      const savedInStorage = JSON.parse(window.localStorage.getItem(TENSE_STORAGE_KEY) || "{}");
      expect(savedInStorage["present-simple"]).toBeDefined();
    });

    it("clamps score within [0, total] range even if invalid numbers are passed", () => {
      const clampedHigh = saveStageProgress("present-simple", "conjugation", 99, 8);
      expect(clampedHigh.stageScores.conjugation.score).toBe(8);
      expect(clampedHigh.totalScore).toBe(8);

      const clampedLow = saveStageProgress("present-simple", "conjugation", -10, 8);
      expect(clampedLow.stageScores.conjugation.score).toBe(0);
    });

    it("handles pre-existing record with missing stageScores property safely", () => {
      // Simulate partial corrupted record written by legacy/buggy code
      window.localStorage.setItem(
        TENSE_STORAGE_KEY,
        JSON.stringify({ "present-simple": { tenseId: "present-simple" } })
      );
      const record = saveStageProgress("present-simple", "conjugation", 8, 8);
      expect(record.stageScores.conjugation.score).toBe(8);
      expect(record.stageScores.errorHunting.score).toBe(0);
    });

    it("updates multiple stages sequentially and marks completed when all pass", () => {
      saveStageProgress("present-simple", "conjugation", 8, 8);
      saveStageProgress("present-simple", "errorHunting", 6, 6);
      const record = saveStageProgress("present-simple", "sentenceBuilding", 6, 6);

      expect(record.totalScore).toBe(20);
      expect(record.maxPossibleScore).toBe(20);
      expect(record.accuracyPercentage).toBe(100);
      expect(record.completed).toBe(true);
    });

    it("returns default record and avoids corrupting storage when empty tenseId is passed", () => {
      const record = saveStageProgress("", "conjugation", 8, 8);
      expect(record.tenseId).toBe("");
      expect(record.totalScore).toBe(0);
    });

    it("marks completed as false if any stage total is 0 or not passed", () => {
      saveStageProgress("present-simple", "conjugation", 8, 8);
      const record = saveStageProgress("present-simple", "errorHunting", 2, 6); // 2/6 = 33% -> fail (<70%)

      expect(record.stageScores.errorHunting.passed).toBe(false);
      expect(record.completed).toBe(false);
    });
  });

  describe("resetProgress", () => {
    it("removes specified tense progress from localStorage", () => {
      saveStageProgress("present-simple", "conjugation", 8, 8);
      expect(getProgress("present-simple")).not.toBeNull();

      resetProgress("present-simple");
      expect(getProgress("present-simple")).toBeNull();
    });

    it("does nothing when resetting non-existent or empty tense ID", () => {
      expect(() => resetProgress("non-existent")).not.toThrow();
      expect(() => resetProgress("")).not.toThrow();
    });
  });

  describe("calculateAggregates", () => {
    it("returns zeros when stage scores are empty", () => {
      const initial = createInitialProgressRecord("present-simple");
      const res = calculateAggregates(initial.stageScores);
      expect(res.totalScore).toBe(0);
      expect(res.maxPossibleScore).toBe(0);
      expect(res.accuracyPercentage).toBe(0);
      expect(res.completed).toBe(false);
    });
  });

  describe("tenseProgressStorage interface implementation", () => {
    it("exposes all required ITenseProgressStorage methods", () => {
      expect(typeof tenseProgressStorage.getProgress).toBe("function");
      expect(typeof tenseProgressStorage.getAllProgress).toBe("function");
      expect(typeof tenseProgressStorage.saveStageProgress).toBe("function");
      expect(typeof tenseProgressStorage.resetProgress).toBe("function");
    });
  });
});
