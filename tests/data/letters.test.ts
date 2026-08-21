import { describe, it, expect } from "vitest";
import lettersData from "@/data/letters.json";
import { Letter } from "@/types";

describe("letters data integrity", () => {
  const letters = lettersData as Letter[];

  it("contains exactly 26 letters from A to Z", () => {
    expect(letters).toBeDefined();
    expect(Array.isArray(letters)).toBe(true);
    expect(letters.length).toBe(26);

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const actualLetters = letters.map((l) => l.letter);
    expect(actualLetters).toEqual(alphabet);
  });

  it("every letter conforms to the Letter interface with valid attributes", () => {
    const letterSet = new Set<string>();

    letters.forEach((item: Letter) => {
      expect(item.letter).toBeDefined();
      expect(typeof item.letter).toBe("string");
      expect(item.letter.length).toBe(1);
      expect(/^[A-Z]$/.test(item.letter)).toBe(true);
      expect(letterSet.has(item.letter)).toBe(false);
      letterSet.add(item.letter);

      expect(item.phonetic).toBeDefined();
      expect(typeof item.phonetic).toBe("string");
      expect(item.phonetic.startsWith("/")).toBe(true);
      expect(item.phonetic.endsWith("/")).toBe(true);

      expect(item.exampleWord).toBeDefined();
      expect(typeof item.exampleWord).toBe("string");
      expect(item.exampleWord.length).toBeGreaterThan(0);
      expect(
        item.exampleWord.toUpperCase().startsWith(item.letter.toUpperCase())
      ).toBe(true);

      expect(item.exampleEmoji).toBeDefined();
      expect(typeof item.exampleEmoji).toBe("string");
      expect(item.exampleEmoji.length).toBeGreaterThan(0);
    });
  });
});
