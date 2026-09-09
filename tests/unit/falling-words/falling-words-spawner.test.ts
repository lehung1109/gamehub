import { describe, it, expect } from "vitest";
import {
  getWordsForTopic,
  createFallingWord,
  selectAvailableLane,
} from "@/lib/falling-words/falling-words-spawner";

describe("Falling Words Spawner", () => {
  it("loads vocabulary words for valid topics", () => {
    const animalWords = getWordsForTopic("animals");
    expect(animalWords.length).toBeGreaterThan(0);
    expect(animalWords[0]).toHaveProperty("english");
    expect(animalWords[0]).toHaveProperty("vietnamese");
  });

  it("falls back to animals if unknown topic provided", () => {
    const fallbackWords = getWordsForTopic("unknown_topic");
    expect(fallbackWords.length).toBeGreaterThan(0);
  });

  it("creates a falling word with initial coordinates and normal properties", () => {
    const vocab = {
      id: "animal-cat",
      english: "Cat",
      vietnamese: "Con mèo",
      phonetic: "/kæt/",
      emoji: "🐱",
    };
    // Mock RNG returning > 0.20 for no special power
    const word = createFallingWord(vocab, 2, 15, () => 0.5);
    expect(word.word).toBe("CAT");
    expect(word.clue).toBe("Con mèo");
    expect(word.lane).toBe(2);
    expect(word.y).toBe(0);
    expect(word.speed).toBe(15);
    expect(word.typedIndex).toBe(0);
    expect(word.isTargeted).toBe(false);
    expect(word.specialType).toBeUndefined();
  });

  it("spawns special bonus bubble when rng is <= 0.20", () => {
    const vocab = {
      id: "animal-dog",
      english: "Dog",
      vietnamese: "Con chó",
    };
    // RNG: 0.05 triggers special power
    const specialWord1 = createFallingWord(vocab, 0, 10, () => 0.05);
    expect(specialWord1.specialType).toBeDefined();
    expect(["double_score", "heal_life", "slow_freeze"]).toContain(
      specialWord1.specialType
    );
  });

  it("selects least occupied lane among 4 lanes (0 to 3)", () => {
    // If lanes 0, 1, 2 are busy, lane 3 should be selected
    const lane = selectAvailableLane([0, 1, 2]);
    expect(lane).toBe(3);
  });
});
