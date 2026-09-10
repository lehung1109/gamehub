import { useState, useCallback, useRef, useEffect } from "react";
import { LetterStatus, WordleStats, WordleTargetWord } from "@/types/wordle";
import { evaluateWordleGuess } from "@/lib/wordle/evaluator";
import { getRandomWord, isValidWordleGuess } from "@/data/wordle/valid-dictionary";

export interface UseWordleGameOptions {
  initialWord?: WordleTargetWord;
  maxAttempts?: number;
  onGameComplete?: (result: { won: boolean; attempts: number; stars: number }) => void;
}

export interface UseWordleGameReturn {
  targetWord: WordleTargetWord;
  guesses: string[];
  currentGuess: string;
  gameStatus: "playing" | "won" | "lost";
  isShaking: boolean;
  errorMessage: string | null;
  keyboardStatus: Record<string, LetterStatus>;
  hintsUsed: { audio: boolean; meaning: boolean; letter: boolean };
  revealedPositions: Record<number, string>;
  starsEarned: number;
  stats: WordleStats;
  addLetter: (char: string) => void;
  removeLetter: () => void;
  submitGuess: () => boolean;
  useAudioHint: () => void;
  useMeaningHint: () => void;
  useLetterHint: () => void;
  resetGame: (newWord?: WordleTargetWord) => void;
}

const STORAGE_KEY = "wordle_stats";

const DEFAULT_STATS: WordleStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

function loadWordleStats(): WordleStats {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_STATS;
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        played: Number(parsed.played) || 0,
        wins: Number(parsed.wins) || 0,
        currentStreak: Number(parsed.currentStreak) || 0,
        maxStreak: Number(parsed.maxStreak) || 0,
        guessDistribution: {
          1: Number(parsed.guessDistribution?.[1]) || 0,
          2: Number(parsed.guessDistribution?.[2]) || 0,
          3: Number(parsed.guessDistribution?.[3]) || 0,
          4: Number(parsed.guessDistribution?.[4]) || 0,
          5: Number(parsed.guessDistribution?.[5]) || 0,
          6: Number(parsed.guessDistribution?.[6]) || 0,
        },
      };
    }
  } catch {
    // ignore parse error
  }
  return DEFAULT_STATS;
}

function saveWordleStats(stats: WordleStats): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore storage error
    }
  }
}

function calculateStars(attempts: number): number {
  if (attempts <= 2) return 3;
  if (attempts <= 4) return 2;
  return 1;
}

const STATUS_PRIORITY: Record<LetterStatus, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  empty: 0,
  tbd: 0,
};

export function useWordleGame(options?: UseWordleGameOptions): UseWordleGameReturn {
  const maxAttempts = options?.maxAttempts ?? 6;

  const [targetWord, setTargetWord] = useState<WordleTargetWord>(
    () => options?.initialWord || getRandomWord()
  );
  const targetWordRef = useRef<WordleTargetWord>(options?.initialWord || getRandomWord());

  const [guesses, setGuesses] = useState<string[]>([]);
  const guessesRef = useRef<string[]>([]);

  const [currentGuess, setCurrentGuess] = useState<string>("");
  const currentGuessRef = useRef<string>("");

  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const gameStatusRef = useRef<"playing" | "won" | "lost">("playing");

  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyboardStatus, setKeyboardStatus] = useState<Record<string, LetterStatus>>({});

  const [hintsUsed, setHintsUsed] = useState<{ audio: boolean; meaning: boolean; letter: boolean }>({
    audio: false,
    meaning: false,
    letter: false,
  });
  const hintsUsedRef = useRef({ audio: false, meaning: false, letter: false });

  const [revealedPositions, setRevealedPositions] = useState<Record<number, string>>({});
  const revealedPositionsRef = useRef<Record<number, string>>({});

  const [starsEarned, setStarsEarned] = useState<number>(0);

  const [stats, setStats] = useState<WordleStats>(() => loadWordleStats());
  const statsRef = useRef<WordleStats>(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onGameCompleteRef = useRef(options?.onGameComplete);

  useEffect(() => {
    onGameCompleteRef.current = options?.onGameComplete;
  }, [options?.onGameComplete]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  const triggerShake = useCallback((message: string) => {
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    setIsShaking(true);
    setErrorMessage(message);
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false);
      setErrorMessage(null);
    }, 1200);
  }, []);

  const clearShake = useCallback(() => {
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    setIsShaking(false);
    setErrorMessage(null);
  }, []);

  const addLetter = useCallback(
    (char: string) => {
      if (gameStatusRef.current !== "playing") return;
      const upper = char.toUpperCase();
      if (!/^[A-Z]$/.test(upper)) return;

      clearShake();
      if (currentGuessRef.current.length >= targetWordRef.current.length) return;
      currentGuessRef.current += upper;
      setCurrentGuess(currentGuessRef.current);
    },
    [clearShake]
  );

  const removeLetter = useCallback(() => {
    if (gameStatusRef.current !== "playing") return;
    clearShake();
    currentGuessRef.current = currentGuessRef.current.slice(0, -1);
    setCurrentGuess(currentGuessRef.current);
  }, [clearShake]);

  const submitGuess = useCallback((): boolean => {
    if (gameStatusRef.current !== "playing") return false;

    const normalizedGuess = currentGuessRef.current.trim().toUpperCase();

    if (normalizedGuess.length < targetWordRef.current.length) {
      triggerShake("Chưa đủ chữ cái");
      return false;
    }

    if (!isValidWordleGuess(normalizedGuess)) {
      triggerShake("Từ không có trong từ điển");
      return false;
    }

    const evaluation = evaluateWordleGuess(normalizedGuess, targetWordRef.current.word);

    // Update keyboard status with priority: correct > present > absent
    setKeyboardStatus((prev) => {
      const next = { ...prev };
      for (const item of evaluation) {
        const currentPriority = STATUS_PRIORITY[next[item.char] || "empty"];
        const newPriority = STATUS_PRIORITY[item.status];
        if (newPriority > currentPriority) {
          next[item.char] = item.status;
        }
      }
      return next;
    });

    const newGuesses = [...guessesRef.current, normalizedGuess];
    guessesRef.current = newGuesses;
    setGuesses(newGuesses);

    currentGuessRef.current = "";
    setCurrentGuess("");
    clearShake();

    const isWon = normalizedGuess === targetWordRef.current.word;

    if (isWon) {
      const stars = calculateStars(newGuesses.length);
      gameStatusRef.current = "won";
      setGameStatus("won");
      setStarsEarned(stars);

      const currentStats = statsRef.current;
      const attempts = newGuesses.length;
      const currentStreak = currentStats.currentStreak + 1;
      const updatedStats: WordleStats = {
        played: currentStats.played + 1,
        wins: currentStats.wins + 1,
        currentStreak,
        maxStreak: Math.max(currentStats.maxStreak, currentStreak),
        guessDistribution: {
          ...currentStats.guessDistribution,
          [attempts]: (currentStats.guessDistribution[attempts] || 0) + 1,
        },
      };
      statsRef.current = updatedStats;
      saveWordleStats(updatedStats);
      setStats(updatedStats);

      onGameCompleteRef.current?.({
        won: true,
        attempts: newGuesses.length,
        stars,
      });
    } else if (newGuesses.length >= maxAttempts) {
      gameStatusRef.current = "lost";
      setGameStatus("lost");
      setStarsEarned(0);

      const currentStats = statsRef.current;
      const updatedStats: WordleStats = {
        ...currentStats,
        played: currentStats.played + 1,
        currentStreak: 0,
      };
      statsRef.current = updatedStats;
      saveWordleStats(updatedStats);
      setStats(updatedStats);

      onGameCompleteRef.current?.({
        won: false,
        attempts: newGuesses.length,
        stars: 0,
      });
    }

    return true;
  }, [maxAttempts, triggerShake, clearShake]);

  const useAudioHint = useCallback(() => {
    if (gameStatusRef.current !== "playing") return;
    hintsUsedRef.current = { ...hintsUsedRef.current, audio: true };
    setHintsUsed(hintsUsedRef.current);
  }, []);

  const useMeaningHint = useCallback(() => {
    if (gameStatusRef.current !== "playing") return;
    hintsUsedRef.current = { ...hintsUsedRef.current, meaning: true };
    setHintsUsed(hintsUsedRef.current);
  }, []);

  const useLetterHint = useCallback(() => {
    if (gameStatusRef.current !== "playing") return;
    if (hintsUsedRef.current.letter) return;

    const word = targetWordRef.current.word;
    const len = targetWordRef.current.length;
    const currentGuesses = guessesRef.current;
    const currentRevealed = revealedPositionsRef.current;

    // Find positions not yet revealed and not yet correctly guessed
    const candidates: number[] = [];
    for (let i = 0; i < len; i++) {
      const isAlreadyRevealed = currentRevealed[i] !== undefined;
      const isAlreadyGuessedCorrect = currentGuesses.some((g) => g[i] === word[i]);
      if (!isAlreadyRevealed && !isAlreadyGuessedCorrect) {
        candidates.push(i);
      }
    }

    let indexToReveal: number | undefined;
    if (candidates.length > 0) {
      indexToReveal = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      const remaining = Array.from({ length: len }, (_, i) => i).filter(
        (i) => currentRevealed[i] === undefined
      );
      if (remaining.length > 0) {
        indexToReveal = remaining[0];
      }
    }

    if (indexToReveal !== undefined) {
      const char = word[indexToReveal];
      revealedPositionsRef.current = {
        ...revealedPositionsRef.current,
        [indexToReveal]: char,
      };
      setRevealedPositions(revealedPositionsRef.current);

      hintsUsedRef.current = {
        ...hintsUsedRef.current,
        letter: true,
      };
      setHintsUsed(hintsUsedRef.current);

      setKeyboardStatus((prev) => {
        const prevPriority = STATUS_PRIORITY[prev[char] || "empty"];
        if (STATUS_PRIORITY["correct"] > prevPriority) {
          return { ...prev, [char]: "correct" };
        }
        return prev;
      });
    }
  }, []);

  const resetGame = useCallback(
    (newWord?: WordleTargetWord) => {
      clearShake();
      const nextWord = newWord || options?.initialWord || getRandomWord();
      targetWordRef.current = nextWord;
      setTargetWord(nextWord);

      guessesRef.current = [];
      setGuesses([]);

      currentGuessRef.current = "";
      setCurrentGuess("");

      gameStatusRef.current = "playing";
      setGameStatus("playing");

      setKeyboardStatus({});

      hintsUsedRef.current = { audio: false, meaning: false, letter: false };
      setHintsUsed(hintsUsedRef.current);

      revealedPositionsRef.current = {};
      setRevealedPositions({});

      setStarsEarned(0);
    },
    [clearShake, options?.initialWord]
  );

  return {
    targetWord,
    guesses,
    currentGuess,
    gameStatus,
    isShaking,
    errorMessage,
    keyboardStatus,
    hintsUsed,
    revealedPositions,
    starsEarned,
    stats,
    addLetter,
    removeLetter,
    submitGuess,
    useAudioHint,
    useMeaningHint,
    useLetterHint,
    resetGame,
  };
}
