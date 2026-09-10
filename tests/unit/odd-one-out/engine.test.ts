import { describe, it, expect } from "vitest";
import {
  checkOddOneOutAnswer,
  calculateFiftyFiftyElimination,
  calculateQuestionScore,
  BASE_QUESTION_SCORE,
  STREAK_BONUS_PER_LEVEL,
  HINT_PENALTY,
} from "@/lib/odd-one-out/engine";
import { OddOneOutQuestion } from "@/types/odd-one-out";

const MOCK_QUESTION: OddOneOutQuestion = {
  id: "q-animals-1",
  difficulty: "easy",
  themeVi: "Động vật",
  themeEn: "Animals",
  commonTraitVi: "Động vật có vú sống trên cạn",
  commonTraitEn: "Land mammals",
  explanationVi: "Cá mập (Shark) là loài cá sống dưới nước, trong khi chó, mèo, voi là thú trên cạn.",
  explanationEn: "Shark is a sea fish, while dog, cat, and elephant are terrestrial mammals.",
  items: [
    {
      id: "item-dog",
      word: "Dog",
      vietnameseMeaning: "Con chó",
      phonetic: "/dɒɡ/",
      partOfSpeech: "noun",
      emoji: "🐶",
      isOdd: false,
    },
    {
      id: "item-cat",
      word: "Cat",
      vietnameseMeaning: "Con mèo",
      phonetic: "/kæt/",
      partOfSpeech: "noun",
      emoji: "🐱",
      isOdd: false,
    },
    {
      id: "item-shark",
      word: "Shark",
      vietnameseMeaning: "Cá mập",
      phonetic: "/ʃɑːk/",
      partOfSpeech: "noun",
      emoji: "🦈",
      isOdd: true,
      reasonVi: "Là loài cá sống dưới nước, không phải động vật có vú trên cạn",
      reasonEn: "Is a marine fish, not a terrestrial mammal",
    },
    {
      id: "item-elephant",
      word: "Elephant",
      vietnameseMeaning: "Con voi",
      phonetic: "/ˈelɪfənt/",
      partOfSpeech: "noun",
      emoji: "🐘",
      isOdd: false,
    },
  ],
};

describe("Odd One Out Engine", () => {
  describe("checkOddOneOutAnswer", () => {
    it("returns isCorrect: true when selecting the odd item", () => {
      const result = checkOddOneOutAnswer(MOCK_QUESTION, "item-shark");
      expect(result.isCorrect).toBe(true);
      expect(result.selectedItem.id).toBe("item-shark");
      expect(result.oddItem.id).toBe("item-shark");
      expect(result.explanationVi).toBe(MOCK_QUESTION.explanationVi);
      expect(result.explanationEn).toBe(MOCK_QUESTION.explanationEn);
    });

    it("returns isCorrect: false when selecting a non-odd item", () => {
      const result = checkOddOneOutAnswer(MOCK_QUESTION, "item-dog");
      expect(result.isCorrect).toBe(false);
      expect(result.selectedItem.id).toBe("item-dog");
      expect(result.oddItem.id).toBe("item-shark");
      expect(result.explanationVi).toBe(MOCK_QUESTION.explanationVi);
      expect(result.explanationEn).toBe(MOCK_QUESTION.explanationEn);
    });

    it("throws an error when selecting a non-existent item ID", () => {
      expect(() => {
        checkOddOneOutAnswer(MOCK_QUESTION, "item-non-existent");
      }).toThrow(/not found/i);
    });

    it("throws an error when the question has no odd item", () => {
      const questionWithoutOdd: OddOneOutQuestion = {
        ...MOCK_QUESTION,
        items: MOCK_QUESTION.items.map((it) => ({ ...it, isOdd: false })),
      };
      expect(() => {
        checkOddOneOutAnswer(questionWithoutOdd, "item-dog");
      }).toThrow(/odd item/i);
    });
  });

  describe("calculateFiftyFiftyElimination", () => {
    it("returns exactly 2 IDs to eliminate for a standard 4-item question", () => {
      const eliminated = calculateFiftyFiftyElimination(MOCK_QUESTION);
      expect(eliminated).toHaveLength(2);
    });

    it("never includes the odd item in eliminated IDs", () => {
      // Run multiple times to verify random selection never picks the odd item
      for (let i = 0; i < 50; i++) {
        const eliminated = calculateFiftyFiftyElimination(MOCK_QUESTION);
        expect(eliminated).not.toContain("item-shark");
      }
    });

    it("only returns IDs of existing non-odd items without duplicates", () => {
      const nonOddIds = ["item-dog", "item-cat", "item-elephant"];
      for (let i = 0; i < 20; i++) {
        const eliminated = calculateFiftyFiftyElimination(MOCK_QUESTION);
        expect(eliminated.length).toBe(2);
        expect(eliminated[0]).not.toBe(eliminated[1]);
        eliminated.forEach((id) => {
          expect(nonOddIds).toContain(id);
        });
      }
    });

    it("returns at most available non-odd items if fewer than 2 exist", () => {
      const twoItemQuestion: OddOneOutQuestion = {
        ...MOCK_QUESTION,
        items: [
          MOCK_QUESTION.items[0], // dog (non-odd)
          MOCK_QUESTION.items[2], // shark (odd)
        ],
      };
      const eliminated = calculateFiftyFiftyElimination(twoItemQuestion);
      expect(eliminated).toEqual(["item-dog"]);
      expect(eliminated).not.toContain("item-shark");
    });

    it("returns empty array if question has no non-odd items", () => {
      const onlyOddQuestion: OddOneOutQuestion = {
        ...MOCK_QUESTION,
        items: [MOCK_QUESTION.items[2]], // shark only
      };
      const eliminated = calculateFiftyFiftyElimination(onlyOddQuestion);
      expect(eliminated).toEqual([]);
    });
  });

  describe("calculateQuestionScore", () => {
    it("returns 0 points if answer is incorrect, regardless of streak", () => {
      expect(calculateQuestionScore(false, 0, 0)).toBe(0);
      expect(calculateQuestionScore(false, 5, 0)).toBe(0);
      expect(calculateQuestionScore(false, 10, 2)).toBe(0);
    });

    it("returns base score of 100 for correct answer with 0 streak and 0 hints", () => {
      expect(calculateQuestionScore(true, 0, 0)).toBe(BASE_QUESTION_SCORE);
      expect(BASE_QUESTION_SCORE).toBe(100);
    });

    it("adds +20 points per streak level", () => {
      expect(calculateQuestionScore(true, 1, 0)).toBe(100 + STREAK_BONUS_PER_LEVEL * 1);
      expect(calculateQuestionScore(true, 2, 0)).toBe(100 + STREAK_BONUS_PER_LEVEL * 2);
      expect(calculateQuestionScore(true, 5, 0)).toBe(100 + STREAK_BONUS_PER_LEVEL * 5);
      expect(STREAK_BONUS_PER_LEVEL).toBe(20);
    });

    it("deducts 25 points per hint used", () => {
      expect(calculateQuestionScore(true, 0, 1)).toBe(100 - HINT_PENALTY * 1);
      expect(calculateQuestionScore(true, 0, 2)).toBe(100 - HINT_PENALTY * 2);
      expect(HINT_PENALTY).toBe(25);
    });

    it("combines streak bonus and hint penalties correctly", () => {
      // Base 100 + (3 * 20) - (1 * 25) = 100 + 60 - 25 = 135
      expect(calculateQuestionScore(true, 3, 1)).toBe(135);
    });

    it("never returns a negative score when penalty exceeds score", () => {
      expect(calculateQuestionScore(true, 0, 10)).toBe(0);
    });

    it("safely handles negative streak or hints inputs", () => {
      expect(calculateQuestionScore(true, -1, -2)).toBe(100);
    });
  });
});
