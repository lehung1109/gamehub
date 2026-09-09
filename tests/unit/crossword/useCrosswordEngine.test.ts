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

  it("selects unblocked cell and re-selecting intersection cell toggles direction", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));

    let intersectCell: { row: number; col: number } | null = null;
    let normalCell: { row: number; col: number } | null = null;

    for (let r = 0; r < result.current.board.rows; r++) {
      for (let c = 0; c < result.current.board.cols; c++) {
        const cell = result.current.board.grid[r][c];
        if (!cell.isBlocked) {
          if (cell.acrossWordId && cell.downWordId && !intersectCell) {
            intersectCell = { row: r, col: c };
          } else if (
            !normalCell &&
            (r !== result.current.selectedCell.row || c !== result.current.selectedCell.col)
          ) {
            normalCell = { row: r, col: c };
          }
        }
      }
    }

    // 1. Selecting an unblocked cell updates selectedCell
    expect(normalCell).not.toBeNull();
    act(() => {
      result.current.selectCell(normalCell!.row, normalCell!.col);
    });
    expect(result.current.selectedCell).toEqual(normalCell);

    // 2. Selecting a blocked cell does nothing
    const currentSelected = { ...result.current.selectedCell };
    act(() => {
      result.current.selectCell(0, 0);
    });
    if (result.current.board.grid[0][0].isBlocked) {
      expect(result.current.selectedCell).toEqual(currentSelected);
    }

    // 3. Re-selecting an intersection cell toggles direction
    if (intersectCell) {
      act(() => {
        result.current.selectCell(intersectCell!.row, intersectCell!.col);
      });
      expect(result.current.selectedCell).toEqual(intersectCell);
      const dirBefore = result.current.direction;

      act(() => {
        result.current.selectCell(intersectCell!.row, intersectCell!.col);
      });
      const expectedDir = dirBefore === "across" ? "down" : "across";
      expect(result.current.direction).toBe(expectedDir);
    }
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

  it("guards against duplicate revealWord calls without applying penalty twice", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const word = result.current.board.words[0];

    act(() => {
      result.current.revealWord(word);
    });
    expect(result.current.score).toBe(-30);
    expect(result.current.wordsRevealed).toBe(1);

    // Calling revealWord again for the same word must do nothing
    act(() => {
      result.current.revealWord(word);
    });
    expect(result.current.score).toBe(-30);
    expect(result.current.wordsRevealed).toBe(1);
  });

  it("updates isSolved and isRevealed in board.words", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const firstWord = result.current.board.words[0];

    expect(firstWord.isSolved).toBe(false);
    expect(firstWord.isRevealed).toBe(false);

    act(() => {
      result.current.revealWord(firstWord);
    });

    const updatedWord = result.current.board.words.find((w) => w.id === firstWord.id);
    expect(updatedWord?.isSolved).toBe(true);
    expect(updatedWord?.isRevealed).toBe(true);
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

  it("detects completion when all cells are correctly filled, marks words solved, and stops timer", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const totalWords = result.current.board.words.length;

    // Fill all unblocked cells correctly
    for (const word of result.current.board.words) {
      act(() => {
        result.current.revealWord(word);
      });
    }

    expect(result.current.isComplete).toBe(true);
    // Every word in board.words should be marked isSolved
    for (const word of result.current.board.words) {
      expect(word.isSolved).toBe(true);
    }

    // Score should include completion bonus: totalWords * 100 minus revealWord penalties
    expect(result.current.score).toBe(totalWords * 100 - result.current.wordsRevealed * 30);

    const elapsed = result.current.elapsedSeconds;
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Timer should stop after completion
    expect(result.current.elapsedSeconds).toBe(elapsed);

    // revealLetter and revealWord should be guarded when isComplete is true
    const currentScore = result.current.score;
    const currentHints = result.current.hintsUsed;
    act(() => {
      result.current.revealLetter();
      result.current.revealWord();
    });
    expect(result.current.score).toBe(currentScore);
    expect(result.current.hintsUsed).toBe(currentHints);
  });

  it("sets justSolvedWord when a word is completed and provides clearJustSolvedWord", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const firstWord = result.current.board.words[0];

    expect(result.current.justSolvedWord).toBeNull();

    // Select the first word clue so cursor is at the start
    act(() => {
      result.current.selectClue(firstWord.id);
    });

    // Type all letters of the first word except the last one
    for (let i = 0; i < firstWord.word.length - 1; i++) {
      act(() => {
        result.current.typeLetter(firstWord.word[i]);
      });
    }
    expect(result.current.justSolvedWord).toBeNull();

    // Type the final letter
    act(() => {
      result.current.typeLetter(firstWord.word[firstWord.word.length - 1]);
    });

    expect(result.current.justSolvedWord).not.toBeNull();
    expect(result.current.justSolvedWord?.id).toBe(firstWord.id);

    // clearJustSolvedWord should reset it
    act(() => {
      result.current.clearJustSolvedWord();
    });
    expect(result.current.justSolvedWord).toBeNull();
  });
});
