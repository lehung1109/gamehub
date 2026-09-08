import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrosswordEngine } from "@/hooks/useCrosswordEngine";

describe("useCrosswordEngine Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with a valid board and focuses the first word", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    expect(result.current.board.words.length).toBeGreaterThanOrEqual(4);
    expect(result.current.selectedCell).not.toBeNull();
    expect(result.current.activeWord).not.toBeNull();
    expect(["across", "down"]).toContain(result.current.direction);
    expect(result.current.score).toBe(0);
    expect(result.current.hintsUsed).toBe(0);
    expect(result.current.wordsRevealed).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("handles letter typing and auto-advances the cursor", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const initialCell = { ...result.current.selectedCell };

    act(() => {
      result.current.typeLetter("A");
    });

    const typedCell = result.current.board.grid[initialCell.row][initialCell.col];
    expect(typedCell.userChar).toBe("A");
    // Cursor advanced
    expect(
      result.current.selectedCell.row !== initialCell.row ||
        result.current.selectedCell.col !== initialCell.col
    ).toBe(true);
  });

  it("ignores non-alphabet characters when typing", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const initialCell = { ...result.current.selectedCell };

    act(() => {
      result.current.typeLetter("1");
      result.current.typeLetter("@");
      result.current.typeLetter(" ");
    });

    const cell = result.current.board.grid[initialCell.row][initialCell.col];
    expect(cell.userChar).toBe("");
    expect(result.current.selectedCell).toEqual(initialCell);
  });

  it("handles backspace to clear character and step backward", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));

    // Type a letter to advance cursor
    act(() => {
      result.current.typeLetter("Z");
    });

    // Backspace on empty advanced cell should step back and clear previous cell
    act(() => {
      result.current.handleBackspace();
    });

    // The previous cell should now be empty
    const firstWord = result.current.board.words[0];
    const prevCell = result.current.board.grid[firstWord.startRow][firstWord.startCol];
    expect(prevCell.userChar).toBe("");
  });

  it("toggles direction using toggleDirection", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const initialDir = result.current.direction;
    const oppositeDir = initialDir === "across" ? "down" : "across";

    act(() => {
      result.current.toggleDirection();
    });
    expect(result.current.direction).toBe(oppositeDir);

    act(() => {
      result.current.toggleDirection();
    });
    expect(result.current.direction).toBe(initialDir);
  });

  it("selects clue and updates selectedCell and direction", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const secondWord = result.current.board.words[1];

    act(() => {
      result.current.selectClue(secondWord.id);
    });

    expect(result.current.selectedCell).toEqual({
      row: secondWord.startRow,
      col: secondWord.startCol,
    });
    expect(result.current.direction).toBe(secondWord.direction);
    expect(result.current.activeWord.id).toBe(secondWord.id);
  });

  it("reveals single letter with penalty and marks cell revealed", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const cell = { ...result.current.selectedCell };

    act(() => {
      result.current.revealLetter();
    });

    const revealedCell = result.current.board.grid[cell.row][cell.col];
    expect(revealedCell.userChar).toBe(revealedCell.char);
    expect(revealedCell.isRevealed).toBe(true);
    expect(result.current.hintsUsed).toBe(1);
    expect(result.current.score).toBe(-10);

    // Revealing already revealed cell does nothing
    act(() => {
      result.current.revealLetter();
    });
    expect(result.current.hintsUsed).toBe(1);
    expect(result.current.score).toBe(-10);
  });

  it("reveals entire word with penalty and marks cells revealed", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const active = result.current.activeWord;

    act(() => {
      result.current.revealWord();
    });

    expect(result.current.wordsRevealed).toBe(1);
    expect(result.current.score).toBe(-30);

    for (let i = 0; i < active.word.length; i++) {
      const r = active.direction === "across" ? active.startRow : active.startRow + i;
      const c = active.direction === "across" ? active.startCol + i : active.startCol;
      const cell = result.current.board.grid[r][c];
      expect(cell.userChar).toBe(active.word[i]);
      expect(cell.isRevealed).toBe(true);
    }
  });

  it("increments elapsed time every second while game is active", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    expect(result.current.elapsedSeconds).toBe(0);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsedSeconds).toBe(3);
  });

  it("moves cursor with moveCursor skipping blocked cells", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));

    act(() => {
      result.current.moveCursor(0, 1);
    });

    // The new cell must not be blocked
    const newCell = result.current.board.grid[result.current.selectedCell.row][result.current.selectedCell.col];
    expect(newCell.isBlocked).toBe(false);
  });

  it("loads a new puzzle with reset state and new topicId", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));

    act(() => {
      result.current.revealLetter();
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.score).toBe(-10);
    expect(result.current.hintsUsed).toBe(1);

    act(() => {
      result.current.loadNewPuzzle("fruits");
    });

    expect(result.current.topicId).toBe("fruits");
    expect(result.current.score).toBe(0);
    expect(result.current.hintsUsed).toBe(0);
    expect(result.current.wordsRevealed).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.board.topicId).toBe("fruits");
  });

  it("detects completion when all cells are correctly filled and stops timer", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const totalWords = result.current.board.words.length;

    // Fill all unblocked cells correctly
    for (const word of result.current.board.words) {
      act(() => {
        result.current.revealWord(word);
      });
    }

    expect(result.current.isComplete).toBe(true);
    // Score should include completion bonus: totalWords * 100 minus revealWord penalties
    expect(result.current.score).toBe(totalWords * 100 - totalWords * 30);

    const elapsed = result.current.elapsedSeconds;
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Timer should stop after completion
    expect(result.current.elapsedSeconds).toBe(elapsed);
  });
});
