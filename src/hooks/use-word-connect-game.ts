import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  WordConnectHintResult,
  WordConnectLevel,
  WordConnectState,
  WordConnectSubmissionResult,
} from "@/types/word-connect";
import {
  checkWordSubmission,
  revealRandomHintLetter,
  shuffleLetters,
} from "@/lib/word-connect/engine";
import { WORD_CONNECT_LEVELS } from "@/data/word-connect/levels";

export interface UseWordConnectGameOptions {
  initialLevelIndex?: number;
  levels?: WordConnectLevel[];
  onLevelComplete?: (level: WordConnectLevel, score: number) => void;
  onWordSolved?: (word: string, isBonus: boolean) => void;
}

export interface UseWordConnectGameReturn extends WordConnectState {
  displayedLetters: string[];
  selectLetter: (index: number) => void;
  removeLastLetter: () => void;
  clearSelection: () => void;
  submitWord: () => WordConnectSubmissionResult;
  shuffle: () => void;
  applyHint: () => WordConnectHintResult | null;
  nextLevel: () => void;
  selectLevel: (index: number) => void;
  resetLevel: () => void;
}

/**
 * Custom hook to manage Word Connect state machine, letter selection gestures,
 * submission validation, bonus word jar, hints, shuffle, and level progression.
 */
export function useWordConnectGame(
  initialLevelOrOptions?: number | UseWordConnectGameOptions
): UseWordConnectGameReturn {
  const levels =
    typeof initialLevelOrOptions === "object" &&
    initialLevelOrOptions?.levels &&
    initialLevelOrOptions.levels.length > 0
      ? initialLevelOrOptions.levels
      : WORD_CONNECT_LEVELS;

  const rawInitialIndex =
    typeof initialLevelOrOptions === "number"
      ? initialLevelOrOptions
      : initialLevelOrOptions?.initialLevelIndex ?? 0;

  const initialIndex = Math.max(
    0,
    Math.min(rawInitialIndex, Math.max(0, levels.length - 1))
  );

  const initialLevel = levels[initialIndex] || levels[0];

  const [levelIndex, setLevelIndex] = useState<number>(initialIndex);
  const [currentLevel, setCurrentLevel] = useState<WordConnectLevel>(initialLevel);
  const [displayedLetters, setDisplayedLetters] = useState<string[]>(() => [
    ...initialLevel.letters,
  ]);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [solvedWords, setSolvedWords] = useState<string[]>([]);
  const [foundBonusWords, setFoundBonusWords] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>({});
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);

  const onLevelComplete =
    typeof initialLevelOrOptions === "object"
      ? initialLevelOrOptions?.onLevelComplete
      : undefined;
  const onWordSolved =
    typeof initialLevelOrOptions === "object"
      ? initialLevelOrOptions?.onWordSolved
      : undefined;

  const callbacksRef = useRef({ onLevelComplete, onWordSolved });
  useEffect(() => {
    callbacksRef.current = { onLevelComplete, onWordSolved };
  }, [onLevelComplete, onWordSolved]);

  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer cleanup on unmount
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = null;
      }
    };
  }, []);

  const currentInput = useMemo(() => {
    return selectedLetters.map((i) => displayedLetters[i] ?? "").join("");
  }, [selectedLetters, displayedLetters]);

  const clearSelection = useCallback(() => {
    setSelectedLetters([]);
  }, []);

  const removeLastLetter = useCallback(() => {
    setSelectedLetters((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const selectLetter = useCallback(
    (index: number) => {
      if (isCompleted) return;
      if (index < 0 || index >= displayedLetters.length) return;

      setSelectedLetters((prev) => {
        // Backtrack: if the user drags back to the penultimate letter, pop the last letter
        if (prev.length >= 2 && prev[prev.length - 2] === index) {
          return prev.slice(0, -1);
        }

        // If the tile is already selected, ignore to avoid duplicates
        if (prev.includes(index)) {
          return prev;
        }

        return [...prev, index];
      });
    },
    [displayedLetters.length, isCompleted]
  );

  const shuffle = useCallback(() => {
    setDisplayedLetters((currentLetters) => shuffleLetters(currentLetters));
    clearSelection();
  }, [clearSelection]);

  const applyHint = useCallback((): WordConnectHintResult | null => {
    const hint = revealRandomHintLetter(
      currentLevel.targetWords,
      solvedWords,
      revealedHints
    );

    if (!hint) {
      return null;
    }

    const wordKey = hint.word;
    const currentRevealed = revealedHints[wordKey] || [];
    const nextRevealed = currentRevealed.includes(hint.letterIndex)
      ? currentRevealed
      : [...currentRevealed, hint.letterIndex];

    setRevealedHints((prev) => ({
      ...prev,
      [wordKey]: nextRevealed,
    }));
    setHintsUsedCount((prev) => prev + 1);

    return hint;
  }, [currentLevel.targetWords, revealedHints, solvedWords]);

  const submitWord = useCallback((): WordConnectSubmissionResult => {
    const word = currentInput.trim().toUpperCase();

    if (!word) {
      return { type: "invalid", word: "" };
    }

    const result = checkWordSubmission(
      word,
      currentLevel,
      solvedWords,
      foundBonusWords
    );

    // Clear user selection after submitting
    clearSelection();

    if (result.type === "target" && result.word) {
      const matchedWord = result.word;
      const nextSolved = [...solvedWords, matchedWord];
      setSolvedWords(nextSolved);

      const wordScore = matchedWord.length * 10;
      setScore((s) => s + wordScore);

      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = null;
      }
      setErrorShake(false);
      setStatusMessage(`Đã tìm thấy: ${matchedWord}!`);

      const allSolved = currentLevel.targetWords.every((tw) =>
        nextSolved.some((sw) => sw.toUpperCase() === tw.word.toUpperCase())
      );

      if (allSolved) {
        setIsCompleted(true);
        callbacksRef.current.onLevelComplete?.(currentLevel, score + wordScore);
      }
      callbacksRef.current.onWordSolved?.(matchedWord, false);
      return result;
    }

    if (result.type === "bonus" && result.word) {
      const matchedWord = result.word;
      const nextBonus = [...foundBonusWords, matchedWord];
      setFoundBonusWords(nextBonus);

      const wordScore = matchedWord.length * 10;
      setScore((s) => s + wordScore);

      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = null;
      }
      setErrorShake(false);
      setStatusMessage(`Từ thưởng: ${matchedWord}!`);
      callbacksRef.current.onWordSolved?.(matchedWord, true);
      return result;
    }

    if (result.type === "already_solved") {
      setErrorShake(true);
      setStatusMessage("Từ này đã giải rồi!");
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }
      shakeTimerRef.current = setTimeout(() => {
        setErrorShake(false);
        shakeTimerRef.current = null;
      }, 600);
      return result;
    }

    if (result.type === "already_solved_bonus") {
      setErrorShake(true);
      setStatusMessage("Từ thưởng này đã tìm rồi!");
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }
      shakeTimerRef.current = setTimeout(() => {
        setErrorShake(false);
        shakeTimerRef.current = null;
      }, 600);
      return result;
    }

    // Invalid submission
    setErrorShake(true);
    setStatusMessage("Không tìm thấy từ này!");
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
    }
    shakeTimerRef.current = setTimeout(() => {
      setErrorShake(false);
      shakeTimerRef.current = null;
    }, 600);
    return result;
  }, [clearSelection, currentInput, currentLevel, foundBonusWords, score, solvedWords]);

  const selectLevel = useCallback(
    (index: number) => {
      if (index < 0 || index >= levels.length) return;

      const nextLvl = levels[index];
      setLevelIndex(index);
      setCurrentLevel(nextLvl);

      setDisplayedLetters([...nextLvl.letters]);
      setSelectedLetters([]);
      setSolvedWords([]);
      setFoundBonusWords([]);
      setRevealedHints({});

      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = null;
      }
      setErrorShake(false);
      setStatusMessage(null);
      setIsCompleted(false);
      setHintsUsedCount(0);
    },
    [levels]
  );

  const nextLevel = useCallback(() => {
    if (levels.length === 0) return;
    const nextIndex = levelIndex + 1 < levels.length ? levelIndex + 1 : 0;
    selectLevel(nextIndex);
  }, [levelIndex, levels.length, selectLevel]);

  const resetLevel = useCallback(() => {
    selectLevel(levelIndex);
  }, [levelIndex, selectLevel]);

  return {
    currentLevel,
    levelIndex,
    displayedLetters,
    selectedLetters,
    solvedWords,
    foundBonusWords,
    revealedHints,
    currentInput,
    errorShake,
    statusMessage,
    isCompleted,
    score,
    hintsUsedCount,
    selectLetter,
    removeLastLetter,
    clearSelection,
    submitWord,
    shuffle,
    applyHint,
    nextLevel,
    selectLevel,
    resetLevel,
  };
}
