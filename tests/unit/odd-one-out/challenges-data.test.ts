import { describe, it, expect } from "vitest";
import {
  ODD_ONE_OUT_CHALLENGES,
  getChallengesByDifficulty,
  getChallengeById,
  getRandomChallenges,
  getTotalChallenges,
} from "@/data/odd-one-out/challenges";
import { OddOneOutDifficulty, OddOneOutQuestion } from "@/types/odd-one-out";

describe("Odd One Out Challenges Dataset Integrity", () => {
  it("should contain at least 30 semantic challenges", () => {
    expect(ODD_ONE_OUT_CHALLENGES.length).toBeGreaterThanOrEqual(30);
    expect(getTotalChallenges()).toBe(ODD_ONE_OUT_CHALLENGES.length);
  });

  it("should have at least 10 challenges for each difficulty tier (easy, medium, hard)", () => {
    const difficulties: OddOneOutDifficulty[] = ["easy", "medium", "hard"];
    difficulties.forEach((diff) => {
      const filtered = getChallengesByDifficulty(diff);
      expect(filtered.length).toBeGreaterThanOrEqual(10);
      filtered.forEach((q) => {
        expect(q.difficulty).toBe(diff);
      });
    });
  });

  it("should enforce unique IDs for all challenges", () => {
    const challengeIds = ODD_ONE_OUT_CHALLENGES.map((q) => q.id);
    const uniqueIds = new Set(challengeIds);
    expect(uniqueIds.size).toBe(challengeIds.length);
  });

  it("should enforce unique IDs for all items across the entire dataset", () => {
    const allItemIds: string[] = [];
    ODD_ONE_OUT_CHALLENGES.forEach((q) => {
      q.items.forEach((item) => {
        allItemIds.push(item.id);
      });
    });
    const uniqueItemIds = new Set(allItemIds);
    expect(uniqueItemIds.size).toBe(allItemIds.length);
  });

  it("should satisfy all structural requirements for every challenge", () => {
    ODD_ONE_OUT_CHALLENGES.forEach((q: OddOneOutQuestion) => {
      expect(q.id.trim()).not.toBe("");
      expect(["easy", "medium", "hard"]).toContain(q.difficulty);
      expect(q.themeVi.trim()).not.toBe("");
      expect(q.themeEn.trim()).not.toBe("");
      expect(q.commonTraitVi.trim()).not.toBe("");
      expect(q.commonTraitEn.trim()).not.toBe("");
      expect(q.explanationVi.trim()).not.toBe("");
      expect(q.explanationEn.trim()).not.toBe("");

      // Exactly 4 items
      expect(q.items).toHaveLength(4);

      // Exactly 1 odd item and 3 non-odd items
      const oddItems = q.items.filter((item) => item.isOdd === true);
      const nonOddItems = q.items.filter((item) => item.isOdd === false);

      expect(oddItems).toHaveLength(1);
      expect(nonOddItems).toHaveLength(3);

      // Odd item should have reasonVi and reasonEn
      expect(oddItems[0].reasonVi?.trim()).toBeTruthy();
      expect(oddItems[0].reasonEn?.trim()).toBeTruthy();
    });
  });

  it("should enforce complete and valid semantic attributes on all items", () => {
    ODD_ONE_OUT_CHALLENGES.forEach((q) => {
      q.items.forEach((item) => {
        expect(item.id.trim()).not.toBe("");
        expect(item.word.trim()).not.toBe("");
        expect(item.vietnameseMeaning.trim()).not.toBe("");
        expect(item.phonetic.trim()).not.toBe("");
        expect(item.phonetic.startsWith("/")).toBe(true);
        expect(item.phonetic.endsWith("/")).toBe(true);
        expect(item.partOfSpeech.trim()).not.toBe("");
        expect(item.emoji.trim()).not.toBe("");
        expect(typeof item.isOdd).toBe("boolean");
      });
    });
  });
});

describe("Odd One Out Challenge Repository Helpers", () => {
  it("getChallengesByDifficulty returns only items matching the requested difficulty", () => {
    const easyChallenges = getChallengesByDifficulty("easy");
    expect(easyChallenges.length).toBeGreaterThanOrEqual(10);
    expect(easyChallenges.every((c) => c.difficulty === "easy")).toBe(true);

    const mediumChallenges = getChallengesByDifficulty("medium");
    expect(mediumChallenges.length).toBeGreaterThanOrEqual(10);
    expect(mediumChallenges.every((c) => c.difficulty === "medium")).toBe(true);

    const hardChallenges = getChallengesByDifficulty("hard");
    expect(hardChallenges.length).toBeGreaterThanOrEqual(10);
    expect(hardChallenges.every((c) => c.difficulty === "hard")).toBe(true);
  });

  it("getChallengeById finds existing challenge and returns undefined for nonexistent id", () => {
    const first = ODD_ONE_OUT_CHALLENGES[0];
    const found = getChallengeById(first.id);
    expect(found).toEqual(first);

    const notFound = getChallengeById("non-existent-challenge-id-9999");
    expect(notFound).toBeUndefined();
  });

  it("getRandomChallenges returns correct number of items without difficulty filter", () => {
    const randomFive = getRandomChallenges(5);
    expect(randomFive).toHaveLength(5);

    // All returned items exist in dataset
    randomFive.forEach((c) => {
      expect(ODD_ONE_OUT_CHALLENGES).toContainEqual(c);
    });

    // Default count if not specified
    const defaultRandom = getRandomChallenges();
    expect(defaultRandom.length).toBeGreaterThan(0);
    expect(defaultRandom.length).toBeLessThanOrEqual(ODD_ONE_OUT_CHALLENGES.length);
  });

  it("getRandomChallenges returns correct number of items filtered by difficulty", () => {
    const randomHard = getRandomChallenges(4, "hard");
    expect(randomHard).toHaveLength(4);
    expect(randomHard.every((c) => c.difficulty === "hard")).toBe(true);

    const randomEasy = getRandomChallenges(3, "easy");
    expect(randomEasy).toHaveLength(3);
    expect(randomEasy.every((c) => c.difficulty === "easy")).toBe(true);
  });

  it("getRandomChallenges handles count greater than pool size gracefully", () => {
    const allEasy = getChallengesByDifficulty("easy");
    const overRequested = getRandomChallenges(allEasy.length + 50, "easy");
    expect(overRequested).toHaveLength(allEasy.length);
    expect(overRequested.every((c) => c.difficulty === "easy")).toBe(true);
  });
});
