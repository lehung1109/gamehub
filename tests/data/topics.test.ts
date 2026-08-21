import { describe, it, expect } from "vitest";
import topics from "@/data/topics.json";
import { Topic } from "@/types";

describe("topics.json data integrity", () => {
  it("contains at least 5 topics (FR-004)", () => {
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBeGreaterThanOrEqual(5);
  });

  it("includes all required default topics", () => {
    const topicIds = topics.map((t: Topic) => t.id);
    expect(topicIds).toContain("animals");
    expect(topicIds).toContain("fruits");
    expect(topicIds).toContain("family");
    expect(topicIds).toContain("school");
    expect(topicIds).toContain("body-parts");
  });

  it("each topic satisfies the Topic interface and has unique ID", () => {
    const ids = new Set<string>();

    topics.forEach((topic: Topic) => {
      expect(topic.id).toBeDefined();
      expect(typeof topic.id).toBe("string");
      expect(topic.id.length).toBeGreaterThan(0);
      expect(ids.has(topic.id)).toBe(false);
      ids.add(topic.id);

      expect(topic.nameEn).toBeDefined();
      expect(typeof topic.nameEn).toBe("string");
      expect(topic.nameEn.length).toBeGreaterThan(0);

      expect(topic.nameVi).toBeDefined();
      expect(typeof topic.nameVi).toBe("string");
      expect(topic.nameVi.length).toBeGreaterThan(0);

      expect(topic.emoji).toBeDefined();
      expect(typeof topic.emoji).toBe("string");
      expect(topic.emoji.length).toBeGreaterThan(0);
    });
  });
});
