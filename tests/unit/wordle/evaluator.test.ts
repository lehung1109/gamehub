import { describe, it, expect } from "vitest";
import { evaluateWordleGuess } from "@/lib/wordle/evaluator";

describe("evaluateWordleGuess", () => {
  it("evaluates all correct letters when guess matches target exactly", () => {
    const result = evaluateWordleGuess("APPLE", "APPLE");
    expect(result).toEqual([
      { char: "A", status: "correct" },
      { char: "P", status: "correct" },
      { char: "P", status: "correct" },
      { char: "L", status: "correct" },
      { char: "E", status: "correct" },
    ]);
  });

  it("evaluates all absent letters when no letters match", () => {
    const result = evaluateWordleGuess("ROUND", "CLIMB");
    expect(result).toEqual([
      { char: "R", status: "absent" },
      { char: "O", status: "absent" },
      { char: "U", status: "absent" },
      { char: "N", status: "absent" },
      { char: "D", status: "absent" },
    ]);
  });

  it("correctly handles duplicate letters when target has fewer occurrences than guess", () => {
    // Target has 1 'L'. Guess has 2 'L's.
    // LION vs LLAMA: first L is correct (green), second L is absent (gray).
    const result = evaluateWordleGuess("LLAMA", "LION");
    expect(result[0]).toEqual({ char: "L", status: "correct" });
    expect(result[1]).toEqual({ char: "L", status: "absent" });
  });

  it("correctly prioritizes exact matches (correct) over misplaced matches (present)", () => {
    // Target has 2 'P's (APPLE). Guess is PAPER.
    // Index 0: 'P' -> present (yellow) because index 2 'P' will match exact 'P' at index 2.
    // Index 1: 'A' -> present (yellow)
    // Index 2: 'P' -> correct (green)
    // Index 3: 'E' -> present (yellow)
    // Index 4: 'R' -> absent (gray)
    const result = evaluateWordleGuess("PAPER", "APPLE");
    expect(result).toEqual([
      { char: "P", status: "present" },
      { char: "A", status: "present" },
      { char: "P", status: "correct" },
      { char: "E", status: "present" },
      { char: "R", status: "absent" },
    ]);
  });

  it("handles case insensitivity cleanly", () => {
    const result = evaluateWordleGuess("tiger", "TIGER");
    expect(result.every((r) => r.status === "correct")).toBe(true);
  });

  it("supports 4-letter and 6-letter words", () => {
    const result4 = evaluateWordleGuess("BEAR", "BEAR");
    expect(result4.length).toBe(4);
    expect(result4.every((r) => r.status === "correct")).toBe(true);

    const result6 = evaluateWordleGuess("DOCTOR", "DOCTOR");
    expect(result6.length).toBe(6);
    expect(result6.every((r) => r.status === "correct")).toBe(true);
  });
});
