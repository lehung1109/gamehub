"use client";

import { useState, useRef, useCallback } from "react";
import { HangmanWord, HangmanRoundHistory } from "@/types/hangman";
import {
  loadRoundWords,
  calculateWordScore,
} from "@/lib/hangman/hangman-utils";

interface EngineState {
  topicId: string;
  wordList: HangmanWord[];
  currentIndex: number;
  guessedLetters: Set<string>;
  mistakesCount: number;
  hintUsed: boolean;
  score: number;
  wordStatus: "playing" | "won" | "lost";
  history: HangmanRoundHistory[];
  isRoundComplete: boolean;
}

export function useHangmanEngine(initialTopicId: string = "animals") {
  const maxMistakes = 6;

  const [state, setState] = useState<EngineState>(() => {
    const initial: EngineState = {
      topicId: initialTopicId,
      wordList: loadRoundWords(initialTopicId, 5),
      currentIndex: 0,
      guessedLetters: new Set<string>(),
      mistakesCount: 0,
      hintUsed: false,
      score: 0,
      wordStatus: "playing",
      history: [],
      isRoundComplete: false,
    };
    return initial;
  });

  const stateRef = useRef<EngineState>(state);

  const restartRound = useCallback((newTopicId?: string) => {
    const current = stateRef.current;
    const nextTopic = newTopicId || current.topicId;
    const newWords = loadRoundWords(nextTopic, 5);
    const nextState: EngineState = {
      topicId: nextTopic,
      wordList: newWords,
      currentIndex: 0,
      guessedLetters: new Set<string>(),
      mistakesCount: 0,
      hintUsed: false,
      score: 0,
      wordStatus: "playing",
      history: [],
      isRoundComplete: false,
    };
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const handleSetTopicId = useCallback(
    (newTopicId: string) => {
      restartRound(newTopicId);
    },
    [restartRound]
  );

  const guessLetter = useCallback(
    (char: string, fromHint: boolean = false) => {
      const current = stateRef.current;
      const currentWord = current.wordList[current.currentIndex] || null;

      if (current.wordStatus !== "playing" || !currentWord) {
        return { isCorrect: false, isWordSolved: false };
      }

      const letter = char.toUpperCase();
      if (current.guessedLetters.has(letter)) {
        return {
          isCorrect: currentWord.word.includes(letter),
          isWordSolved: false,
        };
      }

      const nextGuessed = new Set(current.guessedLetters);
      nextGuessed.add(letter);

      const isCorrect = currentWord.word.includes(letter);
      let nextMistakes = current.mistakesCount;

      if (!isCorrect) {
        nextMistakes = current.mistakesCount + 1;
      }

      const isWordSolved = currentWord.word
        .split("")
        .every((c) => nextGuessed.has(c));

      const effectiveHintUsed = current.hintUsed || fromHint;

      let nextWordStatus: "playing" | "won" | "lost" = current.wordStatus;
      let nextScore = current.score;
      const nextHistory = [...current.history];

      if (isWordSolved) {
        nextWordStatus = "won";
        const wordPts = calculateWordScore(nextMistakes, effectiveHintUsed);
        nextScore += wordPts;
        nextHistory.push({
          word: currentWord,
          solved: true,
          mistakes: nextMistakes,
          score: wordPts,
        });
      } else if (nextMistakes >= maxMistakes) {
        nextWordStatus = "lost";
        nextHistory.push({
          word: currentWord,
          solved: false,
          mistakes: nextMistakes,
          score: 0,
        });
      }

      const nextState: EngineState = {
        ...current,
        guessedLetters: nextGuessed,
        mistakesCount: nextMistakes,
        hintUsed: effectiveHintUsed,
        score: nextScore,
        wordStatus: nextWordStatus,
        history: nextHistory,
      };

      stateRef.current = nextState;
      setState(nextState);

      return { isCorrect, isWordSolved };
    },
    [maxMistakes]
  );

  const useHint = useCallback(() => {
    const current = stateRef.current;
    const currentWord = current.wordList[current.currentIndex] || null;

    if (current.wordStatus !== "playing" || !currentWord || current.hintUsed) {
      return null;
    }

    const unrevealed = Array.from(
      new Set(
        currentWord.word
          .split("")
          .filter((c) => !current.guessedLetters.has(c))
      )
    );

    if (unrevealed.length <= 1) {
      return null;
    }

    const randomChar =
      unrevealed[Math.floor(Math.random() * unrevealed.length)];
    guessLetter(randomChar, true);
    return randomChar;
  }, [guessLetter]);

  const nextWord = useCallback(() => {
    const current = stateRef.current;
    if (current.currentIndex + 1 < current.wordList.length) {
      const nextState: EngineState = {
        ...current,
        currentIndex: current.currentIndex + 1,
        guessedLetters: new Set<string>(),
        mistakesCount: 0,
        hintUsed: false,
        wordStatus: "playing",
      };
      stateRef.current = nextState;
      setState(nextState);
    } else {
      const nextState: EngineState = {
        ...current,
        isRoundComplete: true,
      };
      stateRef.current = nextState;
      setState(nextState);
    }
  }, []);

  const currentWord = state.wordList[state.currentIndex] || null;

  return {
    topicId: state.topicId,
    currentIndex: state.currentIndex,
    totalWords: state.wordList.length,
    currentWord,
    guessedLetters: state.guessedLetters,
    mistakesCount: state.mistakesCount,
    maxMistakes,
    hintUsed: state.hintUsed,
    score: state.score,
    wordStatus: state.wordStatus,
    isRoundComplete: state.isRoundComplete,
    history: state.history,
    guessLetter,
    useHint,
    nextWord,
    restartRound,
    setTopicId: handleSetTopicId,
  };
}
