import { describe, it, expect } from "vitest";
import {
  WORD_CONNECT_LEVELS,
  getLevelByIndex,
  getLevelById,
  getTotalLevels,
} from "@/data/word-connect/levels";

// Helper to count frequencies of characters in a string or array
function getLetterFrequencyMap(items: string[] | string): Record<string, number> {
  const map: Record<string, number> = {};
  for (const char of items) {
    const upper = char.toUpperCase();
    map[upper] = (map[upper] || 0) + 1;
  }
  return map;
}

// Checks if 'word' can be strictly formed by a multiset of 'letters'
function canFormWord(word: string, availableLetters: string[]): boolean {
  const wordFreq = getLetterFrequencyMap(word);
  const letterFreq = getLetterFrequencyMap(availableLetters);

  for (const [char, count] of Object.entries(wordFreq)) {
    if (!letterFreq[char] || letterFreq[char] < count) {
      return false;
    }
  }
  return true;
}

describe("Word Connect Levels Repository & Data Integrity", () => {
  describe("Level Count and Metadata Progression", () => {
    it("contains at least 20 curated progressive levels", () => {
      expect(WORD_CONNECT_LEVELS.length).toBeGreaterThanOrEqual(20);
      expect(getTotalLevels()).toBe(WORD_CONNECT_LEVELS.length);
    });

    it("has unique IDs for all levels", () => {
      const ids = WORD_CONNECT_LEVELS.map((lvl) => lvl.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("has consecutive levelNumbers starting from 1 to N", () => {
      WORD_CONNECT_LEVELS.forEach((lvl, index) => {
        expect(lvl.levelNumber).toBe(index + 1);
      });
    });

    it("follows difficulty progression rules", () => {
      WORD_CONNECT_LEVELS.forEach((lvl) => {
        expect(lvl.letters.length).toBeGreaterThanOrEqual(3);
        expect(lvl.letters.length).toBeLessThanOrEqual(6);

        if (lvl.levelNumber <= 6) {
          expect(lvl.difficulty).toBe("easy");
          expect(lvl.letters.length).toBeLessThanOrEqual(4);
        } else if (lvl.levelNumber <= 14) {
          expect(lvl.difficulty).toBe("medium");
          expect(lvl.letters.length).toBeGreaterThanOrEqual(4);
          expect(lvl.letters.length).toBeLessThanOrEqual(5);
        } else {
          expect(lvl.difficulty).toBe("hard");
          expect(lvl.letters.length).toBeGreaterThanOrEqual(5);
          expect(lvl.letters.length).toBeLessThanOrEqual(6);
        }
      });
    });
  });

  describe("Dictionary and Vocabulary Quality", () => {
    it("ensures all letters are uppercase single characters", () => {
      WORD_CONNECT_LEVELS.forEach((lvl) => {
        lvl.letters.forEach((char) => {
          expect(char).toMatch(/^[A-Z]$/);
        });
      });
    });

    it("ensures all target words have complete vocabulary learning metadata", () => {
      WORD_CONNECT_LEVELS.forEach((lvl) => {
        expect(lvl.targetWords.length).toBeGreaterThanOrEqual(2);

        const wordSet = new Set<string>();
        lvl.targetWords.forEach((target) => {
          expect(target.word).toMatch(/^[A-Z]+$/);
          expect(target.phonetic.trim().length).toBeGreaterThan(0);
          expect(target.vietnameseMeaning.trim().length).toBeGreaterThan(0);
          expect(target.partOfSpeech.trim().length).toBeGreaterThan(0);
          expect(target.exampleSentence.trim().length).toBeGreaterThan(0);

          // Unique target words per level
          expect(wordSet.has(target.word)).toBe(false);
          wordSet.add(target.word);
        });
      });
    });

    it("ensures bonus words are valid uppercase words and do not overlap with target words", () => {
      WORD_CONNECT_LEVELS.forEach((lvl) => {
        if (!lvl.bonusWords || lvl.bonusWords.length === 0) return;

        const targetWords = new Set(lvl.targetWords.map((t) => t.word));
        const bonusSet = new Set<string>();

        lvl.bonusWords.forEach((bonus) => {
          expect(bonus).toMatch(/^[A-Z]+$/);
          expect(targetWords.has(bonus)).toBe(false);
          expect(bonusSet.has(bonus)).toBe(false);
          bonusSet.add(bonus);
        });
      });
    });
  });

  describe("Multiset Letter Constraint (Strict Anagram Validation)", () => {
    it("ensures EVERY target word can be formed strictly from the level letters multiset", () => {
      WORD_CONNECT_LEVELS.forEach((lvl) => {
        lvl.targetWords.forEach((target) => {
          const valid = canFormWord(target.word, lvl.letters);
          if (!valid) {
            throw new Error(
              `Level ${lvl.levelNumber} (${lvl.id}): Target word "${target.word}" cannot be formed from letters [${lvl.letters.join(", ")}]`
            );
          }
          expect(valid).toBe(true);
        });
      });
    });

    it("ensures EVERY bonus word can be formed strictly from the level letters multiset", () => {
      WORD_CONNECT_LEVELS.forEach((lvl) => {
        if (!lvl.bonusWords) return;
        lvl.bonusWords.forEach((bonus) => {
          const valid = canFormWord(bonus, lvl.letters);
          if (!valid) {
            throw new Error(
              `Level ${lvl.levelNumber} (${lvl.id}): Bonus word "${bonus}" cannot be formed from letters [${lvl.letters.join(", ")}]`
            );
          }
          expect(valid).toBe(true);
        });
      });
    });
  });

  describe("Query Helper Functions", () => {
    it("getLevelByIndex returns the level at 0-based index", () => {
      const firstLevel = getLevelByIndex(0);
      expect(firstLevel).toBeDefined();
      expect(firstLevel?.levelNumber).toBe(1);

      const secondLevel = getLevelByIndex(1);
      expect(secondLevel).toBeDefined();
      expect(secondLevel?.levelNumber).toBe(2);
    });

    it("getLevelByIndex returns undefined for negative or out-of-range index", () => {
      expect(getLevelByIndex(-1)).toBeUndefined();
      expect(getLevelByIndex(999)).toBeUndefined();
    });

    it("getLevelById returns the exact level matching the ID", () => {
      const first = WORD_CONNECT_LEVELS[0];
      const found = getLevelById(first.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(first.id);
      expect(found?.levelNumber).toBe(first.levelNumber);
    });

    it("getLevelById returns undefined for unknown ID", () => {
      expect(getLevelById("non-existent-level-id")).toBeUndefined();
    });

    it("getTotalLevels returns the total count of levels", () => {
      expect(getTotalLevels()).toBe(WORD_CONNECT_LEVELS.length);
    });
  });
});
