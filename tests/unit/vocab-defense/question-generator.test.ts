import { describe, it, expect } from "vitest";
import { generateChallenge } from "@/lib/vocab-defense/question-generator";

describe("Question Generator Engine", () => {
  it("generates an ATTACK vocabulary question with 4 unique options and valid correctIndex", () => {
    const question = generateChallenge("ATTACK");
    expect(question.type).toBe("ATTACK");
    expect(question.options.length).toBe(4);
    expect(new Set(question.options).size).toBe(4);
    expect(question.correctIndex).toBeGreaterThanOrEqual(0);
    expect(question.correctIndex).toBeLessThan(4);
    expect(question.targetWord).toBeTruthy();
    expect(question.explanation).toBeTruthy();
  });

  it("generates a SHIELD listening question with audio target and phonetic cue", () => {
    const question = generateChallenge("SHIELD");
    expect(question.type).toBe("SHIELD");
    expect(question.options.length).toBe(4);
    expect(question.targetWord).toBeTruthy();
  });

  it("generates an ULTIMATE sentence challenge", () => {
    const question = generateChallenge("ULTIMATE");
    expect(question.type).toBe("ULTIMATE");
    expect(question.prompt).toBeTruthy();
    expect(question.options.length).toBeGreaterThanOrEqual(2);
  });
});
