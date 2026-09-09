import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWordleGame } from "@/hooks/use-wordle-game";
import { WordleTargetWord } from "@/types/wordle";

const MOCK_WORD: WordleTargetWord = {
  id: "test-apple",
  word: "APPLE",
  length: 5,
  category: "fruits",
  vietnameseMeaning: "Quả táo",
  phonetic: "/ˈæp.əl/",
  partOfSpeech: "noun",
  exampleSentence: "An apple a day.",
  difficulty: "easy",
};

const MOCK_WORD_BEAR: WordleTargetWord = {
  id: "test-bear",
  word: "BEAR",
  length: 4,
  category: "animals",
  vietnameseMeaning: "Con gấu",
  phonetic: "/beər/",
  partOfSpeech: "noun",
  exampleSentence: "A bear lives in the forest.",
  difficulty: "easy",
};

describe("useWordleGame", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("initializes with default playing state", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));
    expect(result.current.gameStatus).toBe("playing");
    expect(result.current.currentGuess).toBe("");
    expect(result.current.guesses).toEqual([]);
    expect(result.current.targetWord.word).toBe("APPLE");
    expect(result.current.isShaking).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.starsEarned).toBe(0);
    expect(result.current.hintsUsed).toEqual({ audio: false, meaning: false, letter: false });
    expect(result.current.revealedPositions).toEqual({});
  });

  it("handles adding and removing letters up to word length", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      result.current.addLetter("a"); // tests case normalization
      result.current.addLetter("P");
    });
    expect(result.current.currentGuess).toBe("AP");

    act(() => {
      result.current.removeLetter();
    });
    expect(result.current.currentGuess).toBe("A");

    act(() => {
      result.current.addLetter("P");
      result.current.addLetter("P");
      result.current.addLetter("L");
      result.current.addLetter("E");
      result.current.addLetter("S"); // exceeds length 5, should be ignored
    });
    expect(result.current.currentGuess).toBe("APPLE");
  });

  it("prevents submitting when guess is shorter than word length", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      result.current.addLetter("A");
      result.current.submitGuess();
    });

    expect(result.current.guesses.length).toBe(0);
    expect(result.current.isShaking).toBe(true);
    expect(result.current.errorMessage).toContain("đủ");
  });

  it("prevents submitting when guess is not in the dictionary", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      // QWXZV is not in dictionary
      for (const ch of "QWXZV") result.current.addLetter(ch);
      result.current.submitGuess();
    });

    expect(result.current.guesses.length).toBe(0);
    expect(result.current.isShaking).toBe(true);
    expect(result.current.errorMessage).toContain("từ điển");
  });

  it("wins the game when submitting the exact target word", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useWordleGame({ initialWord: MOCK_WORD, onGameComplete: onComplete })
    );

    act(() => {
      for (const char of "APPLE") result.current.addLetter(char);
      result.current.submitGuess();
    });

    expect(result.current.gameStatus).toBe("won");
    expect(result.current.guesses).toEqual(["APPLE"]);
    expect(result.current.currentGuess).toBe("");
    expect(result.current.starsEarned).toBe(3);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ won: true, attempts: 1, stars: 3 })
    );
  });

  it("reveals a letter when using letter hint", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      result.current.useLetterHint();
    });

    expect(result.current.hintsUsed.letter).toBe(true);
    const revealedKeys = Object.keys(result.current.revealedPositions);
    expect(revealedKeys.length).toBe(1);

    const revealedIndex = Number(revealedKeys[0]);
    expect(result.current.revealedPositions[revealedIndex]).toBe(MOCK_WORD.word[revealedIndex]);

    // Calling again does not reveal more letters
    act(() => {
      result.current.useLetterHint();
    });
    expect(Object.keys(result.current.revealedPositions).length).toBe(1);
  });

  it("activates audio and meaning hints", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      result.current.useAudioHint();
    });
    expect(result.current.hintsUsed.audio).toBe(true);

    act(() => {
      result.current.useMeaningHint();
    });
    expect(result.current.hintsUsed.meaning).toBe(true);
  });

  it("updates keyboard status with color priority (correct > present > absent)", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    // Target is APPLE. PAPER has:
    // P -> present (idx 0), A -> present (idx 1), P -> correct (idx 2), E -> present (idx 3), R -> absent (idx 4)
    act(() => {
      for (const ch of "PAPER") result.current.addLetter(ch);
      result.current.submitGuess();
    });

    expect(result.current.keyboardStatus["P"]).toBe("correct");
    expect(result.current.keyboardStatus["A"]).toBe("present");
    expect(result.current.keyboardStatus["E"]).toBe("present");
    expect(result.current.keyboardStatus["R"]).toBe("absent");

    // Guess another word where 'A' is correct: "ADULT"
    // In ADULT: A -> correct, D -> absent, U -> absent, L -> correct, T -> absent
    act(() => {
      for (const ch of "ADULT") result.current.addLetter(ch);
      result.current.submitGuess();
    });

    expect(result.current.keyboardStatus["A"]).toBe("correct");
    expect(result.current.keyboardStatus["L"]).toBe("correct");
    // P should remain correct
    expect(result.current.keyboardStatus["P"]).toBe("correct");
  });

  it("calculates stars based on attempt count correctly", () => {
    // 1-2 attempts: 3 stars
    // 3-4 attempts: 2 stars
    // 5-6 attempts: 1 star
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useWordleGame({ initialWord: MOCK_WORD, onGameComplete: onComplete })
    );

    // Attempt 1: PAPER
    act(() => {
      for (const ch of "PAPER") result.current.addLetter(ch);
      result.current.submitGuess();
    });
    // Attempt 2: TRAIN
    act(() => {
      for (const ch of "TRAIN") result.current.addLetter(ch);
      result.current.submitGuess();
    });
    // Attempt 3: APPLE (won on attempt 3)
    act(() => {
      for (const ch of "APPLE") result.current.addLetter(ch);
      result.current.submitGuess();
    });

    expect(result.current.gameStatus).toBe("won");
    expect(result.current.starsEarned).toBe(2);
    expect(onComplete).toHaveBeenCalledWith({ won: true, attempts: 3, stars: 2 });
  });

  it("loses the game when reaching max attempts without winning", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useWordleGame({ initialWord: MOCK_WORD, maxAttempts: 3, onGameComplete: onComplete })
    );

    for (let i = 0; i < 3; i++) {
      act(() => {
        for (const ch of "TRAIN") result.current.addLetter(ch);
        result.current.submitGuess();
      });
    }

    expect(result.current.gameStatus).toBe("lost");
    expect(result.current.starsEarned).toBe(0);
    expect(result.current.guesses.length).toBe(3);
    expect(onComplete).toHaveBeenCalledWith({ won: false, attempts: 3, stars: 0 });

    // Typing should no longer work
    act(() => {
      result.current.addLetter("A");
    });
    expect(result.current.currentGuess).toBe("");
  });

  it("tracks and persists stats in localStorage", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    expect(result.current.stats.played).toBe(0);
    expect(result.current.stats.wins).toBe(0);

    // Win a game in 1 attempt
    act(() => {
      for (const ch of "APPLE") result.current.addLetter(ch);
      result.current.submitGuess();
    });

    expect(result.current.stats.played).toBe(1);
    expect(result.current.stats.wins).toBe(1);
    expect(result.current.stats.currentStreak).toBe(1);
    expect(result.current.stats.maxStreak).toBe(1);
    expect(result.current.stats.guessDistribution[1]).toBe(1);

    const saved = JSON.parse(localStorage.getItem("wordle_stats") || "{}");
    expect(saved.played).toBe(1);
    expect(saved.wins).toBe(1);
    expect(saved.currentStreak).toBe(1);
    expect(saved.maxStreak).toBe(1);
  });

  it("resets game state on resetGame()", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      for (const ch of "PAPER") result.current.addLetter(ch);
      result.current.submitGuess();
      result.current.useAudioHint();
      result.current.useMeaningHint();
      result.current.useLetterHint();
    });

    expect(result.current.guesses.length).toBe(1);
    expect(result.current.hintsUsed.audio).toBe(true);

    act(() => {
      result.current.resetGame(MOCK_WORD_BEAR);
    });

    expect(result.current.targetWord.word).toBe("BEAR");
    expect(result.current.guesses).toEqual([]);
    expect(result.current.currentGuess).toBe("");
    expect(result.current.gameStatus).toBe("playing");
    expect(result.current.hintsUsed).toEqual({ audio: false, meaning: false, letter: false });
    expect(result.current.revealedPositions).toEqual({});
    expect(result.current.keyboardStatus).toEqual({});
    expect(result.current.starsEarned).toBe(0);
  });
});
