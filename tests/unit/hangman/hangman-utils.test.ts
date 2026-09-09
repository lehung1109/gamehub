import { describe, it, expect } from "vitest";
import {
  loadRoundWords,
  calculateWordScore,
  calculateRoundStars,
} from "@/lib/hangman/hangman-utils";

describe("Hangman Utilities", () => {
  describe("loadRoundWords", () => {
    it("loads 5 unique words for a given topic by default", () => {
      const words = loadRoundWords("animals", 5);
      expect(words).toHaveLength(5);
      expect(words[0]).toHaveProperty("id");
      expect(words[0]).toHaveProperty("word");
      expect(words[0]).toHaveProperty("clue");

      // All words should be uppercase and alphabetic
      for (const item of words) {
        expect(item.word).toBe(item.word.toUpperCase());
        expect(/^[A-Z]+$/.test(item.word)).toBe(true);
        expect(typeof item.clue).toBe("string");
        expect(item.clue.length).toBeGreaterThan(0);
      }
    });

    it("loads words from other valid topics like fruits, school, family, body-parts", () => {
      const fruitWords = loadRoundWords("fruits", 3);
      expect(fruitWords).toHaveLength(3);
      expect(fruitWords.every((w) => /^[A-Z]+$/.test(w.word))).toBe(true);

      const schoolWords = loadRoundWords("school", 3);
      expect(schoolWords).toHaveLength(3);

      const familyWords = loadRoundWords("family", 3);
      expect(familyWords).toHaveLength(3);

      const bodyWords = loadRoundWords("body-parts", 3);
      expect(bodyWords).toHaveLength(3);
    });

    it("falls back to animals if an unknown topicId is provided", () => {
      const words = loadRoundWords("unknown-topic", 5);
      expect(words).toHaveLength(5);
      expect(words.every((w) => /^[A-Z]+$/.test(w.word))).toBe(true);
    });

    it("supports a custom rng function for deterministic shuffling", () => {
      // Deterministic pseudo-rng that reverses or sorts fixed order
      const mockRng1 = () => 0.1;
      const mockRng2 = () => 0.9;
      const words1 = loadRoundWords("animals", 5, mockRng1);
      const words2 = loadRoundWords("animals", 5, mockRng2);

      expect(words1).toHaveLength(5);
      expect(words2).toHaveLength(5);
      // Both should return valid words
      expect(words1[0].word).toBeDefined();
      expect(words2[0].word).toBeDefined();
    });

    it("preserves optional phonetic and emoji if present", () => {
      const words = loadRoundWords("animals", 10);
      const withPhoneticOrEmoji = words.find((w) => w.phonetic || w.emoji);
      expect(withPhoneticOrEmoji).toBeDefined();
    });
  });

  describe("calculateWordScore", () => {
    it("calculates word score based on mistakes and hint penalty", () => {
      // 0 mistakes, no hint: 200 - 0 + 6*30 = 380
      expect(calculateWordScore(0, false)).toBe(380);
      // 2 mistakes, no hint: 200 - 40 + 4*30 = 280
      expect(calculateWordScore(2, false)).toBe(280);
      // 1 mistake, hint used: 200 - 20 + 5*30 - 100 = 230
      expect(calculateWordScore(1, true)).toBe(230);
      // 5 mistakes, hint used: 200 - 100 + 1*30 - 100 = 30 -> minimum is 50
      expect(calculateWordScore(5, true)).toBe(50);
      // 6 mistakes (unsolved): 0
      expect(calculateWordScore(6, false)).toBe(0);
      // 6 mistakes, hint used: 0
      expect(calculateWordScore(6, true)).toBe(0);
      // > 6 mistakes: 0
      expect(calculateWordScore(7, false)).toBe(0);
    });
  });

  describe("calculateRoundStars", () => {
    it("calculates round stars based on score and solved count", () => {
      // 3 stars: score >= 1200 and all 5 solved
      expect(calculateRoundStars(1400, 5, 5)).toBe(3);
      expect(calculateRoundStars(1200, 5, 5)).toBe(3);

      // 2 stars if score >= 1200 but not all solved (e.g. 4/5 solved)
      expect(calculateRoundStars(1250, 4, 5)).toBe(2);

      // 2 stars: score >= 700 and at least 3 solved
      expect(calculateRoundStars(850, 3, 5)).toBe(2);
      expect(calculateRoundStars(700, 3, 5)).toBe(2);

      // 1 star if score >= 700 but only 2 solved
      expect(calculateRoundStars(750, 2, 5)).toBe(1);

      // 1 star: score > 0
      expect(calculateRoundStars(300, 1, 5)).toBe(1);
      expect(calculateRoundStars(50, 1, 5)).toBe(1);

      // 0 stars: score 0
      expect(calculateRoundStars(0, 0, 5)).toBe(0);
    });
  });
});
