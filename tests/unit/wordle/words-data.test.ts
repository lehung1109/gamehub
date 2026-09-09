import { describe, it, expect } from "vitest";
import { isValidWordleGuess, getRandomWord, WORDLE_TARGET_WORDS } from "@/data/wordle/valid-dictionary";

describe("Wordle Data & Validation Dictionary", () => {
  it("contains curated target words for lengths 4, 5, and 6", () => {
    expect(WORDLE_TARGET_WORDS.length).toBeGreaterThanOrEqual(30);

    const lengths = new Set(WORDLE_TARGET_WORDS.map((w) => w.length));
    expect(lengths.has(4)).toBe(true);
    expect(lengths.has(5)).toBe(true);
    expect(lengths.has(6)).toBe(true);

    // Each target word has required fields
    for (const w of WORDLE_TARGET_WORDS) {
      expect(w.word.length).toBe(w.length);
      expect(w.vietnameseMeaning.length).toBeGreaterThan(0);
      expect(w.phonetic.length).toBeGreaterThan(0);
      expect(w.exampleSentence.length).toBeGreaterThan(0);
      expect(["animals", "school", "technology", "daily-life", "fruits", "workplace"]).toContain(w.category);
      expect(["easy", "medium", "hard"]).toContain(w.difficulty);
      expect(["noun", "verb", "adjective"]).toContain(w.partOfSpeech);
      expect(w.word).toBe(w.word.toUpperCase());
    }
  });

  it("validates known target words as valid guesses", () => {
    expect(isValidWordleGuess("APPLE")).toBe(true);
    expect(isValidWordleGuess("tiger")).toBe(true); // lower-case normalization
    expect(isValidWordleGuess("ROBOT")).toBe(true);
    expect(isValidWordleGuess("  apple  ")).toBe(true); // whitespace trimming
  });

  it("rejects invalid or gibberish words", () => {
    expect(isValidWordleGuess("XYZQW")).toBe(false);
    expect(isValidWordleGuess("ABCDE")).toBe(false);
    expect(isValidWordleGuess("")).toBe(false);
    expect(isValidWordleGuess("12345")).toBe(false);
  });

  it("gets random word filtered by length and category", () => {
    const animalWord = getRandomWord("animals", 4);
    expect(animalWord.category).toBe("animals");
    expect(animalWord.length).toBe(4);
    expect(animalWord.word.length).toBe(4);

    const fruitWord = getRandomWord("fruits", 5);
    expect(fruitWord.category).toBe("fruits");
    expect(fruitWord.length).toBe(5);

    const anyWord = getRandomWord();
    expect(WORDLE_TARGET_WORDS).toContainEqual(anyWord);

    const len6Word = getRandomWord(undefined, 6);
    expect(len6Word.length).toBe(6);
  });
});
