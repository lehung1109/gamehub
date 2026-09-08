import { describe, it, expect } from "vitest";
import { generateCrosswordBoard } from "@/lib/crossword/crossword-generator";

describe("Crossword Generator Engine", () => {
  it("generates a valid board with 4 to 6 intersecting words", () => {
    const board = generateCrosswordBoard("animals", 5);
    expect(board.words.length).toBeGreaterThanOrEqual(4);
    expect(board.words.length).toBeLessThanOrEqual(6);
    expect(board.rows).toBeGreaterThanOrEqual(8);
    expect(board.cols).toBeGreaterThanOrEqual(8);
    expect(board.grid.length).toBe(board.rows);
    expect(board.grid[0].length).toBe(board.cols);
  });

  it("assigns unique, ascending clue numbers starting from 1", () => {
    const board = generateCrosswordBoard("animals", 5);
    const numbers = board.words.map((w) => w.number);
    expect(numbers.length).toBe(board.words.length);
    expect(Math.min(...numbers)).toBe(1);
  });

  it("guarantees intersecting cells share the exact same character", () => {
    const board = generateCrosswordBoard("animals", 5);
    for (const word of board.words) {
      for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === "across" ? word.startRow : word.startRow + i;
        const c = word.direction === "across" ? word.startCol + i : word.startCol;
        const cell = board.grid[r][c];
        expect(cell.isBlocked).toBe(false);
        expect(cell.char).toBe(word.word[i]);
      }
    }
  });

  it("supports fruits and school topics with fallback for unknown topics", () => {
    const fruitsBoard = generateCrosswordBoard("fruits", 5);
    expect(fruitsBoard.words.length).toBeGreaterThanOrEqual(4);
    expect(fruitsBoard.topicId).toBe("fruits");

    const schoolBoard = generateCrosswordBoard("school", 5);
    expect(schoolBoard.words.length).toBeGreaterThanOrEqual(4);
    expect(schoolBoard.topicId).toBe("school");

    const fallbackBoard = generateCrosswordBoard("unknown-topic", 5);
    expect(fallbackBoard.words.length).toBeGreaterThanOrEqual(4);
  });
});
