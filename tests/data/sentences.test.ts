import { describe, it, expect } from "vitest";
import sentencesData from "@/data/sentences.json";
import { Sentence } from "@/types";

describe("sentences.json", () => {
  const sentences = sentencesData as Sentence[];

  it("should contain exactly 50 sentences", () => {
    expect(sentences.length).toBe(50);
  });

  it("should have all required fields for each sentence", () => {
    const ids = new Set<string>();

    sentences.forEach((sentence) => {
      // Unique id
      expect(sentence.id).toBeDefined();
      expect(sentence.id.trim().length).toBeGreaterThan(0);
      expect(ids.has(sentence.id)).toBe(false);
      ids.add(sentence.id);

      // Words array (10-12 words for older kids)
      expect(Array.isArray(sentence.words)).toBe(true);
      expect(sentence.words.length).toBeGreaterThanOrEqual(10);
      expect(sentence.words.length).toBeLessThanOrEqual(12);

      // full string matching words joined with single space
      expect(sentence.full).toBe(sentence.words.join(" "));

      // vietnamese translation
      expect(sentence.vietnamese).toBeDefined();
      expect(sentence.vietnamese.trim().length).toBeGreaterThan(0);

      // emoji situation illustration
      expect(sentence.emoji).toBeDefined();
      expect(sentence.emoji.trim().length).toBeGreaterThan(0);

      // category
      expect(sentence.category).toBeDefined();
      expect(sentence.category.trim().length).toBeGreaterThan(0);
    });
  });

  it("should have multiple sentence categories", () => {
    const categories = new Set(sentences.map((s) => s.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });
});
