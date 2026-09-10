import { describe, it, expect } from "vitest";
import {
  checkWordSubmission,
  revealRandomHintLetter,
  shuffleLetters,
} from "@/lib/word-connect/engine";
import { WordConnectLevel } from "@/types/word-connect";

const MOCK_LEVEL: WordConnectLevel = {
  id: "level-1",
  levelNumber: 1,
  letters: ["A", "C", "T", "S"],
  targetWords: [
    {
      word: "CAT",
      vietnameseMeaning: "Con mèo",
      phonetic: "/kæt/",
      partOfSpeech: "noun",
      exampleSentence: "A cute cat.",
    },
    {
      word: "ACT",
      vietnameseMeaning: "Hành động / Diễn xuất",
      phonetic: "/ækt/",
      partOfSpeech: "verb",
      exampleSentence: "Act quickly.",
    },
    {
      word: "CATS",
      vietnameseMeaning: "Những con mèo",
      phonetic: "/kæts/",
      partOfSpeech: "noun",
      exampleSentence: "Two cats playing.",
    },
  ],
  bonusWords: ["CAST", "SAT"],
  difficulty: "easy",
};

describe("Word Connect Engine", () => {
  it("validates a correct target word that hasn't been solved yet", () => {
    const result = checkWordSubmission("CAT", MOCK_LEVEL, []);
    expect(result.type).toBe("target");
    expect(result.word).toBe("CAT");
  });

  it("handles case-insensitive submission for target words", () => {
    const result = checkWordSubmission("cat", MOCK_LEVEL, []);
    expect(result.type).toBe("target");
    expect(result.word).toBe("CAT");
  });

  it("detects when a word has already been solved", () => {
    const result = checkWordSubmission("CAT", MOCK_LEVEL, ["CAT"]);
    expect(result.type).toBe("already_solved");
  });

  it("detects valid bonus words not in the main grid", () => {
    const result = checkWordSubmission("CAST", MOCK_LEVEL, ["CAT"], []);
    expect(result.type).toBe("bonus");
    expect(result.word).toBe("CAST");
  });

  it("detects valid bonus words with lowercase input", () => {
    const result = checkWordSubmission("cast", MOCK_LEVEL, ["CAT"], []);
    expect(result.type).toBe("bonus");
    expect(result.word).toBe("CAST");
  });

  it("detects when a bonus word was already found", () => {
    const result = checkWordSubmission("CAST", MOCK_LEVEL, ["CAT"], ["CAST"]);
    expect(result.type).toBe("already_solved_bonus");
  });

  it("rejects invalid words not matching target or bonus", () => {
    const result = checkWordSubmission("XYZ", MOCK_LEVEL, []);
    expect(result.type).toBe("invalid");
  });

  it("reveals a random unrevealed letter index for an unsolved target word", () => {
    const revealedMap = { CAT: [0] }; // 'C' already revealed
    const hint = revealRandomHintLetter(MOCK_LEVEL.targetWords, ["ACT", "CATS"], revealedMap);
    expect(hint).not.toBeNull();
    expect(hint?.word).toBe("CAT");
    expect([1, 2]).toContain(hint?.letterIndex);
    expect(hint?.letter).toBe(hint?.word[hint!.letterIndex]);
  });

  it("returns null for hint when all target words are solved", () => {
    const hint = revealRandomHintLetter(
      MOCK_LEVEL.targetWords,
      ["CAT", "ACT", "CATS"],
      {}
    );
    expect(hint).toBeNull();
  });

  it("returns null for hint when all letters of unsolved words are already revealed", () => {
    const revealedMap = {
      CAT: [0, 1, 2],
    };
    const hint = revealRandomHintLetter(
      MOCK_LEVEL.targetWords,
      ["ACT", "CATS"],
      revealedMap
    );
    expect(hint).toBeNull();
  });

  it("shuffles letters while preserving the same multiset of characters", () => {
    const letters = ["A", "C", "T", "S"];
    const shuffled = shuffleLetters(letters);
    expect(shuffled.length).toBe(letters.length);
    expect([...shuffled].sort()).toEqual([...letters].sort());
  });

  it("handles duplicate letters correctly when shuffling", () => {
    const letters = ["B", "O", "O", "K"];
    const shuffled = shuffleLetters(letters);
    expect(shuffled.length).toBe(4);
    expect([...shuffled].sort()).toEqual(["B", "K", "O", "O"]);
  });

  it("handles single letter or empty array when shuffling", () => {
    expect(shuffleLetters(["A"])).toEqual(["A"]);
    expect(shuffleLetters([])).toEqual([]);
  });
});
