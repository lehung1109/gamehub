import { describe, it, expect } from "vitest";
import topics from "@/data/topics.json";
import animals from "@/data/words/animals.json";
import fruits from "@/data/words/fruits.json";
import family from "@/data/words/family.json";
import school from "@/data/words/school.json";
import bodyParts from "@/data/words/body-parts.json";
import { Word, Topic } from "@/types";

describe("vocabulary words data integrity", () => {
  const wordLists: Record<string, Word[]> = {
    animals,
    fruits,
    family,
    school,
    "body-parts": bodyParts,
  };

  it("each topic has at least 10 words (SC-006)", () => {
    topics.forEach((topic: Topic) => {
      const words = wordLists[topic.id];
      expect(words).toBeDefined();
      expect(Array.isArray(words)).toBe(true);
      expect(words.length).toBeGreaterThanOrEqual(10);
    });
  });

  it("total word count across all topics is at least 50 (SC-006)", () => {
    const totalWords = Object.values(wordLists).reduce(
      (sum, list) => sum + list.length,
      0
    );
    expect(totalWords).toBeGreaterThanOrEqual(50);
  });

  it("all words conform to the Word interface with valid attributes and unique IDs", () => {
    const allIds = new Set<string>();

    Object.entries(wordLists).forEach(([topicId, words]) => {
      words.forEach((word: Word) => {
        expect(word.id).toBeDefined();
        expect(typeof word.id).toBe("string");
        expect(word.id.length).toBeGreaterThan(0);
        expect(allIds.has(word.id)).toBe(false);
        allIds.add(word.id);

        expect(word.english).toBeDefined();
        expect(typeof word.english).toBe("string");
        expect(word.english.length).toBeGreaterThan(0);

        expect(word.phonetic).toBeDefined();
        expect(typeof word.phonetic).toBe("string");
        expect(word.phonetic.startsWith("/")).toBe(true);
        expect(word.phonetic.endsWith("/")).toBe(true);

        expect(word.vietnamese).toBeDefined();
        expect(typeof word.vietnamese).toBe("string");
        expect(word.vietnamese.length).toBeGreaterThan(0);

        expect(word.emoji).toBeDefined();
        expect(typeof word.emoji).toBe("string");
        expect(word.emoji.length).toBeGreaterThan(0);

        expect(word.topicId).toBe(topicId);
      });
    });
  });
});
