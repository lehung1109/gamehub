import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHangmanEngine } from "@/hooks/useHangmanEngine";

describe("useHangmanEngine Hook", () => {
  it("initializes with 5 words, 0 mistakes, and playing status", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalWords).toBe(5);
    expect(result.current.mistakesCount).toBe(0);
    expect(result.current.maxMistakes).toBe(6);
    expect(result.current.wordStatus).toBe("playing");
    expect(result.current.currentWord).not.toBeNull();
    expect(result.current.hintUsed).toBe(false);
    expect(result.current.score).toBe(0);
    expect(result.current.isRoundComplete).toBe(false);
    expect(result.current.history).toHaveLength(0);
    expect(result.current.guessedLetters.size).toBe(0);
  });

  it("handles correct letter guess without increasing mistakes", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const firstChar = word[0];

    act(() => {
      const res = result.current.guessLetter(firstChar);
      expect(res.isCorrect).toBe(true);
    });

    expect(result.current.guessedLetters.has(firstChar)).toBe(true);
    expect(result.current.mistakesCount).toBe(0);
    expect(result.current.wordStatus).toBe("playing");
  });

  it("handles lowercase letter guess correctly", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const firstChar = word[0].toLowerCase();

    act(() => {
      const res = result.current.guessLetter(firstChar);
      expect(res.isCorrect).toBe(true);
    });

    expect(result.current.guessedLetters.has(word[0])).toBe(true);
    expect(result.current.mistakesCount).toBe(0);
  });

  it("handles incorrect letter guess and increments mistakes count", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const wrongChar = alphabet.split("").find((c) => !word.includes(c))!;

    act(() => {
      const res = result.current.guessLetter(wrongChar);
      expect(res.isCorrect).toBe(false);
      expect(res.isWordSolved).toBe(false);
    });

    expect(result.current.guessedLetters.has(wrongChar)).toBe(true);
    expect(result.current.mistakesCount).toBe(1);
  });

  it("does not increment mistakes on repeated incorrect letter guess", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const wrongChar = alphabet.split("").find((c) => !word.includes(c))!;

    act(() => {
      result.current.guessLetter(wrongChar);
    });
    expect(result.current.mistakesCount).toBe(1);

    act(() => {
      const res = result.current.guessLetter(wrongChar);
      expect(res.isCorrect).toBe(false);
      expect(res.isWordSolved).toBe(false);
    });
    expect(result.current.mistakesCount).toBe(1);
  });

  it("marks word won and calculates score when all letters guessed", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const uniqueChars = Array.from(new Set(word.split("")));

    act(() => {
      for (const char of uniqueChars) {
        result.current.guessLetter(char);
      }
    });

    expect(result.current.wordStatus).toBe("won");
    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toEqual({
      word: result.current.currentWord,
      solved: true,
      mistakes: 0,
      score: result.current.score,
    });
  });

  it("marks word lost when 6 mistakes occur", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const wrongChars = alphabet.split("").filter((c) => !word.includes(c)).slice(0, 6);

    act(() => {
      for (const char of wrongChars) {
        result.current.guessLetter(char);
      }
    });

    expect(result.current.mistakesCount).toBe(6);
    expect(result.current.wordStatus).toBe("lost");
    expect(result.current.score).toBe(0);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toEqual({
      word: result.current.currentWord,
      solved: false,
      mistakes: 6,
      score: 0,
    });
  });

  it("ignores guesses when word is already won or lost", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const uniqueChars = Array.from(new Set(word.split("")));

    act(() => {
      for (const char of uniqueChars) {
        result.current.guessLetter(char);
      }
    });
    expect(result.current.wordStatus).toBe("won");
    const scoreAfterWin = result.current.score;

    act(() => {
      const res = result.current.guessLetter("Z");
      expect(res.isCorrect).toBe(false);
      expect(res.isWordSolved).toBe(false);
    });
    expect(result.current.score).toBe(scoreAfterWin);
  });

  it("useHint reveals an unguessed letter and marks hintUsed", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    let revealedChar: string | null = null;

    act(() => {
      revealedChar = result.current.useHint();
    });

    expect(revealedChar).not.toBeNull();
    expect(result.current.hintUsed).toBe(true);
    expect(result.current.guessedLetters.has(revealedChar!)).toBe(true);
  });

  it("useHint returns null if hint already used", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));

    act(() => {
      result.current.useHint();
    });
    expect(result.current.hintUsed).toBe(true);

    let secondHint: string | null = "dummy";
    act(() => {
      secondHint = result.current.useHint();
    });
    expect(secondHint).toBeNull();
  });

  it("useHint returns null if 1 or fewer unrevealed letters remain", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const uniqueChars = Array.from(new Set(word.split("")));

    // Guess all but one unique letter
    act(() => {
      for (let i = 0; i < uniqueChars.length - 1; i++) {
        result.current.guessLetter(uniqueChars[i]);
      }
    });

    let hintResult: string | null = "dummy";
    act(() => {
      hintResult = result.current.useHint();
    });
    expect(hintResult).toBeNull();
  });

  it("handles next word progression and round completion after 5 words", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));

    for (let wordIdx = 0; wordIdx < 5; wordIdx++) {
      expect(result.current.currentIndex).toBe(wordIdx);
      expect(result.current.isRoundComplete).toBe(false);

      // Solve the current word
      const word = result.current.currentWord!.word;
      const uniqueChars = Array.from(new Set(word.split("")));
      act(() => {
        for (const char of uniqueChars) {
          result.current.guessLetter(char);
        }
      });
      expect(result.current.wordStatus).toBe("won");
      expect(result.current.history).toHaveLength(wordIdx + 1);

      // Advance to next word
      act(() => {
        result.current.nextWord();
      });
    }

    // Round should be complete after the 5th word nextWord() call
    expect(result.current.isRoundComplete).toBe(true);
    expect(result.current.history).toHaveLength(5);
  });

  it("resets state when restartRound is called", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;

    act(() => {
      result.current.guessLetter(word[0]);
      result.current.useHint();
    });
    expect(result.current.guessedLetters.size).toBeGreaterThan(0);
    expect(result.current.hintUsed).toBe(true);

    act(() => {
      result.current.restartRound();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.guessedLetters.size).toBe(0);
    expect(result.current.mistakesCount).toBe(0);
    expect(result.current.hintUsed).toBe(false);
    expect(result.current.score).toBe(0);
    expect(result.current.wordStatus).toBe("playing");
    expect(result.current.isRoundComplete).toBe(false);
    expect(result.current.history).toHaveLength(0);
  });

  it("updates topic and restarts when setTopicId is called", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    expect(result.current.topicId).toBe("animals");

    act(() => {
      result.current.setTopicId("fruits");
    });

    expect(result.current.topicId).toBe("fruits");
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.mistakesCount).toBe(0);
    expect(result.current.wordStatus).toBe("playing");
  });
});
