import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWordConnectGame } from "@/hooks/use-word-connect-game";
import {
  WordConnectHintResult,
  WordConnectLevel,
  WordConnectSubmissionResult,
} from "@/types/word-connect";

const MOCK_LEVEL_1: WordConnectLevel = {
  id: "mock-level-1",
  levelNumber: 1,
  letters: ["A", "C", "T", "S"],
  targetWords: [
    {
      word: "CAT",
      vietnameseMeaning: "Con mèo",
      phonetic: "/kæt/",
      partOfSpeech: "noun",
      exampleSentence: "A cute cat.",
    },
    {
      word: "ACT",
      vietnameseMeaning: "Hành động",
      phonetic: "/ækt/",
      partOfSpeech: "verb",
      exampleSentence: "Act fast.",
    },
  ],
  bonusWords: ["CATS", "CAST", "SAT"],
  difficulty: "easy",
};

const MOCK_LEVEL_2: WordConnectLevel = {
  id: "mock-level-2",
  levelNumber: 2,
  letters: ["D", "O", "G", "S"],
  targetWords: [
    {
      word: "DOG",
      vietnameseMeaning: "Con chó",
      phonetic: "/dɒɡ/",
      partOfSpeech: "noun",
      exampleSentence: "A friendly dog.",
    },
    {
      word: "GOD",
      vietnameseMeaning: "Thần, Chúa",
      phonetic: "/ɡɒd/",
      partOfSpeech: "noun",
      exampleSentence: "Believe in God.",
    },
  ],
  bonusWords: ["DOGS"],
  difficulty: "easy",
};

const MOCK_LEVELS = [MOCK_LEVEL_1, MOCK_LEVEL_2];

describe("useWordConnectGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with default state for curriculum level 0", () => {
    const { result } = renderHook(() => useWordConnectGame());

    expect(result.current.levelIndex).toBe(0);
    expect(result.current.currentLevel.levelNumber).toBe(1);
    expect(result.current.displayedLetters).toEqual(result.current.currentLevel.letters);
    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");
    expect(result.current.solvedWords).toEqual([]);
    expect(result.current.foundBonusWords).toEqual([]);
    expect(result.current.revealedHints).toEqual({});
    expect(result.current.errorShake).toBe(false);
    expect(result.current.statusMessage).toBeNull();
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.score).toBe(0);
    expect(result.current.hintsUsedCount).toBe(0);
  });

  it("initializes with a specific initialLevelIndex", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ initialLevelIndex: 1, levels: MOCK_LEVELS })
    );

    expect(result.current.levelIndex).toBe(1);
    expect(result.current.currentLevel.id).toBe("mock-level-2");
    expect(result.current.displayedLetters).toEqual(["D", "O", "G", "S"]);
  });

  it("also supports passing a numeric initial level index directly", () => {
    const { result } = renderHook(() => useWordConnectGame(1));
    expect(result.current.levelIndex).toBe(1);
  });

  it("selects letters and builds currentInput string", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // letters: ["A", "C", "T", "S"]
    // index 1 is "C", index 0 is "A", index 2 is "T" -> "CAT"
    act(() => {
      result.current.selectLetter(1);
    });
    expect(result.current.selectedLetters).toEqual([1]);
    expect(result.current.currentInput).toBe("C");

    act(() => {
      result.current.selectLetter(0);
    });
    expect(result.current.selectedLetters).toEqual([1, 0]);
    expect(result.current.currentInput).toBe("CA");

    act(() => {
      result.current.selectLetter(2);
    });
    expect(result.current.selectedLetters).toEqual([1, 0, 2]);
    expect(result.current.currentInput).toBe("CAT");
  });

  it("ignores out-of-bounds indices and already selected letters", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    act(() => {
      result.current.selectLetter(-1);
      result.current.selectLetter(99);
    });
    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");

    act(() => {
      result.current.selectLetter(1); // "C"
      result.current.selectLetter(0); // "A"
      result.current.selectLetter(2); // "T"
      result.current.selectLetter(2); // duplicate last letter -> ignore
    });
    expect(result.current.selectedLetters).toEqual([1, 0, 2]);
    expect(result.current.currentInput).toBe("CAT");
  });

  it("supports backtrack when dragging back to the penultimate letter", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    act(() => {
      result.current.selectLetter(1); // C
      result.current.selectLetter(0); // CA
      result.current.selectLetter(2); // CAT
    });
    expect(result.current.selectedLetters).toEqual([1, 0, 2]);
    expect(result.current.currentInput).toBe("CAT");

    // Drag back to index 0 ("A")
    act(() => {
      result.current.selectLetter(0);
    });
    expect(result.current.selectedLetters).toEqual([1, 0]);
    expect(result.current.currentInput).toBe("CA");

    // Drag back to index 1 ("C")
    act(() => {
      result.current.selectLetter(1);
    });
    expect(result.current.selectedLetters).toEqual([1]);
    expect(result.current.currentInput).toBe("C");
  });

  it("supports removing the last letter (backspace) and clearing selection", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
    });
    expect(result.current.currentInput).toBe("CA");

    act(() => {
      result.current.removeLastLetter();
    });
    expect(result.current.selectedLetters).toEqual([1]);
    expect(result.current.currentInput).toBe("C");

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");

    // Backspace on empty is a safe no-op
    act(() => {
      result.current.removeLastLetter();
    });
    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");
  });

  it("submits a valid target word -> updates solvedWords, increases score, and clears selection", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // Select "CAT" (indices 1, 0, 2)
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
    });

    let submissionResult: WordConnectSubmissionResult | undefined;
    act(() => {
      submissionResult = result.current.submitWord();
    });

    expect(submissionResult?.type).toBe("target");
    expect(submissionResult?.word).toBe("CAT");
    expect(result.current.solvedWords).toContain("CAT");
    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");
    expect(result.current.errorShake).toBe(false);
    expect(result.current.isCompleted).toBe(false);
  });

  it("submits a valid bonus word -> updates foundBonusWords, increases score, and clears selection", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // letters: ["A", "C", "T", "S"]
    // Bonus word: "CATS" -> indices 1 ("C"), 0 ("A"), 2 ("T"), 3 ("S")
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
      result.current.selectLetter(3);
    });
    expect(result.current.currentInput).toBe("CATS");

    let submissionResult: WordConnectSubmissionResult | undefined;
    act(() => {
      submissionResult = result.current.submitWord();
    });

    expect(submissionResult?.type).toBe("bonus");
    expect(submissionResult?.word).toBe("CATS");
    expect(result.current.foundBonusWords).toContain("CATS");
    expect(result.current.solvedWords).not.toContain("CATS");
    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");
  });

  it("submits empty input safely without error shake", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    let submissionResult: WordConnectSubmissionResult | undefined;
    act(() => {
      submissionResult = result.current.submitWord();
    });

    expect(submissionResult?.type).toBe("invalid");
    expect(result.current.errorShake).toBe(false);
  });

  it("triggers errorShake on invalid word and auto-resets after 600ms", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // Select "CTA" -> indices 1, 2, 0 (invalid)
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(2);
      result.current.selectLetter(0);
    });

    let submissionResult: WordConnectSubmissionResult | undefined;
    act(() => {
      submissionResult = result.current.submitWord();
    });

    expect(submissionResult?.type).toBe("invalid");
    expect(result.current.errorShake).toBe(true);
    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");

    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(result.current.errorShake).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.errorShake).toBe(false);
  });

  it("triggers errorShake when submitting an already solved target word", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // Solve "CAT"
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
    });
    act(() => {
      result.current.submitWord();
    });
    expect(result.current.solvedWords).toContain("CAT");

    // Select "CAT" again
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
    });
    let submissionResult: WordConnectSubmissionResult | undefined;
    act(() => {
      submissionResult = result.current.submitWord();
    });

    expect(submissionResult?.type).toBe("already_solved");
    expect(result.current.errorShake).toBe(true);

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.errorShake).toBe(false);
  });

  it("triggers errorShake when submitting an already found bonus word", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // Submit bonus word "CATS"
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
      result.current.selectLetter(3);
    });
    act(() => {
      result.current.submitWord();
    });
    expect(result.current.foundBonusWords).toContain("CATS");

    // Submit "CATS" again
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
      result.current.selectLetter(3);
    });
    let submissionResult: WordConnectSubmissionResult | undefined;
    act(() => {
      submissionResult = result.current.submitWord();
    });

    expect(submissionResult?.type).toBe("already_solved_bonus");
    expect(result.current.errorShake).toBe(true);
  });

  it("applyHint reveals an unrevealed letter in an unsolved target word and updates hintsUsedCount", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    let hintResult: WordConnectHintResult | null = null;
    act(() => {
      hintResult = result.current.applyHint();
    });

    const nonNullHint = hintResult as WordConnectHintResult | null;
    expect(nonNullHint).not.toBeNull();
    expect(["CAT", "ACT"]).toContain(nonNullHint?.word);
    expect(typeof nonNullHint?.letterIndex).toBe("number");
    expect(result.current.hintsUsedCount).toBe(1);
    expect(result.current.revealedHints[nonNullHint?.word ?? ""]).toContain(
      nonNullHint?.letterIndex
    );

    // Apply another hint
    act(() => {
      result.current.applyHint();
    });
    expect(result.current.hintsUsedCount).toBe(2);
  });

  it("applyHint returns null when all target words are solved", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // Solve "CAT" (indices 1, 0, 2)
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
    });
    act(() => {
      result.current.submitWord();
    });

    // Solve "ACT" (indices 0, 1, 2)
    act(() => {
      result.current.selectLetter(0);
      result.current.selectLetter(1);
      result.current.selectLetter(2);
    });
    act(() => {
      result.current.submitWord();
    });

    expect(result.current.isCompleted).toBe(true);

    let hintResult: WordConnectHintResult | null = null;
    act(() => {
      hintResult = result.current.applyHint();
    });
    expect(hintResult).toBeNull();
    expect(result.current.hintsUsedCount).toBe(0);
  });

  it("shuffle reorders displayedLetters while preserving multiset and clears selection", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    act(() => {
      result.current.selectLetter(0);
      result.current.selectLetter(1);
    });
    expect(result.current.selectedLetters).toEqual([0, 1]);

    act(() => {
      result.current.shuffle();
    });

    expect(result.current.selectedLetters).toEqual([]);
    expect(result.current.currentInput).toBe("");
    expect(result.current.displayedLetters.length).toBe(MOCK_LEVEL_1.letters.length);
    expect([...result.current.displayedLetters].sort()).toEqual(
      [...MOCK_LEVEL_1.letters].sort()
    );
  });

  it("marks level as completed when all target words are solved", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    expect(result.current.isCompleted).toBe(false);

    // Solve CAT
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
    });
    act(() => {
      result.current.submitWord();
    });
    expect(result.current.isCompleted).toBe(false);

    // Solve ACT
    act(() => {
      result.current.selectLetter(0);
      result.current.selectLetter(1);
      result.current.selectLetter(2);
    });
    act(() => {
      result.current.submitWord();
    });

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.solvedWords.length).toBe(2);
  });

  it("nextLevel advances to next level, resets level state, and preserves score", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: MOCK_LEVELS })
    );

    // Solve "CAT" on level 1
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(0);
      result.current.selectLetter(2);
    });
    act(() => {
      result.current.submitWord();
    });
    const previousScore = result.current.score;
    expect(previousScore).toBeGreaterThan(0);

    // Advance to next level
    act(() => {
      result.current.nextLevel();
    });

    expect(result.current.levelIndex).toBe(1);
    expect(result.current.currentLevel.id).toBe("mock-level-2");
    expect(result.current.displayedLetters).toEqual(["D", "O", "G", "S"]);
    expect(result.current.solvedWords).toEqual([]);
    expect(result.current.foundBonusWords).toEqual([]);
    expect(result.current.revealedHints).toEqual({});
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.hintsUsedCount).toBe(0);
    expect(result.current.score).toBe(previousScore);
  });

  it("selectLevel jumps to a specific level and resets level state", () => {
    const { result } = renderHook(() =>
      useWordConnectGame({ levels: MOCK_LEVELS })
    );

    act(() => {
      result.current.selectLevel(1);
    });

    expect(result.current.levelIndex).toBe(1);
    expect(result.current.currentLevel.id).toBe("mock-level-2");
    expect(result.current.displayedLetters).toEqual(["D", "O", "G", "S"]);
    expect(result.current.solvedWords).toEqual([]);
  });

  it("cleans up timer on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useWordConnectGame({ levels: [MOCK_LEVEL_1] })
    );

    // Trigger error shake
    act(() => {
      result.current.selectLetter(1);
      result.current.selectLetter(2);
    });
    act(() => {
      result.current.submitWord();
    });
    expect(result.current.errorShake).toBe(true);

    // Unmount before timer finishes
    unmount();

    // Advancing timers should not cause errors
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });
});
