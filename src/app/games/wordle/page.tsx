"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWordleGame } from "@/hooks/use-wordle-game";
import { useSpeech } from "@/hooks/useSpeech";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { getRandomWord } from "@/data/wordle/valid-dictionary";
import {
  WordleHeader,
  WordleHintsBar,
  WordleGrid,
  WordleKeyboard,
  WordleResultDialog,
  WordleStatsModal,
  WordleGuideModal,
} from "./components";
import {
  playKeyClickSound,
  playErrorSound,
  playTileFlipSound,
  playVictorySound,
  playDefeatSound,
} from "@/lib/wordle/sound";

export default function WordlePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [wordLength, setWordLength] = useState<4 | 5 | 6>(5);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const { speak, isSpeaking } = useSpeech();

  const { recordQuestion, submitSession } = useGameTracking({
    gameType: "wordle",
    topic: selectedCategory !== "all" ? selectedCategory : "general",
  });

  const sessionSubmittedRef = useRef(false);

  const {
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
  } = useWordleGame({
    initialWord: getRandomWord(undefined, 5),
    maxAttempts: 6,
    onGameComplete: (result) => {
      // Delay opening result dialog slightly so user can enjoy row flip animation
      setTimeout(() => {
        setIsResultOpen(true);
      }, 1200);

      if (result.won) {
        playVictorySound();
      } else {
        playDefeatSound();
      }
    },
  });

  // Tracking recording when game completes
  useEffect(() => {
    if (gameStatus !== "playing" && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      const isWon = gameStatus === "won";

      recordQuestion({
        prompt: targetWord.word,
        selectedAnswer: guesses[guesses.length - 1] || "",
        correctAnswer: targetWord.word,
        isCorrect: isWon,
        attempts: guesses.length,
      });

      submitSession({
        score: isWon ? starsEarned : 0,
        totalQuestions: 1,
        topic: targetWord.category,
      }).catch((err) => console.warn("[Wordle] Failed to submit session:", err));
    } else if (gameStatus === "playing") {
      sessionSubmittedRef.current = false;
    }
  }, [gameStatus, targetWord, guesses, starsEarned, recordQuestion, submitSession]);

  // Audio Hint handler
  const handleAudioHint = useCallback(() => {
    useAudioHint();
    speak(targetWord.word);
  }, [useAudioHint, speak, targetWord.word]);

  // Meaning Hint handler
  const handleMeaningHint = useCallback(() => {
    useMeaningHint();
  }, [useMeaningHint]);

  // Letter Hint handler
  const handleLetterHint = useCallback(() => {
    useLetterHint();
  }, [useLetterHint]);

  // Sound feedback on error shake
  useEffect(() => {
    if (isShaking) {
      playErrorSound();
    }
  }, [isShaking]);

  // Handle virtual and physical keypresses
  const handleAddLetter = useCallback(
    (char: string) => {
      playKeyClickSound();
      addLetter(char);
    },
    [addLetter]
  );

  const handleRemoveLetter = useCallback(() => {
    playKeyClickSound();
    removeLetter();
  }, [removeLetter]);

  const handleSubmitGuess = useCallback(() => {
    submitGuess();
    // If not shaking after submit, play flip sound
    playTileFlipSound(0);
  }, [submitGuess]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (gameStatus !== "playing") return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleRemoveLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleAddLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStatus, handleSubmitGuess, handleRemoveLetter, handleAddLetter]);

  // Handle Next Word / Restart
  const handleNextWord = useCallback(() => {
    setIsResultOpen(false);
    const cat = selectedCategory !== "all" ? selectedCategory : undefined;
    const newWord = getRandomWord(cat, wordLength);
    resetGame(newWord);
  }, [resetGame, selectedCategory, wordLength]);

  // Change Category
  const handleSelectCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      const cat = category !== "all" ? category : undefined;
      const newWord = getRandomWord(cat, wordLength);
      setIsResultOpen(false);
      resetGame(newWord);
    },
    [resetGame, wordLength]
  );

  // Change Word Length
  const handleSelectWordLength = useCallback(
    (length: 4 | 5 | 6) => {
      setWordLength(length);
      const cat = selectedCategory !== "all" ? selectedCategory : undefined;
      const newWord = getRandomWord(cat, length);
      setIsResultOpen(false);
      resetGame(newWord);
    },
    [resetGame, selectedCategory]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-2 px-3 select-none">
      {/* Header */}
      <WordleHeader
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        wordLength={wordLength}
        onSelectWordLength={handleSelectWordLength}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Game Container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg w-full mx-auto my-1 relative">
        {/* Error Toast / Notification Banner */}
        <div
          className={`transition-all duration-200 h-8 flex items-center justify-center ${
            errorMessage ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
          aria-live="assertive"
        >
          {errorMessage && (
            <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold px-4 py-1.5 rounded-xl text-xs sm:text-sm shadow-lg tracking-wide animate-bounce">
              {errorMessage}
            </div>
          )}
        </div>

        {/* 3-Tier Hints Bar */}
        <WordleHintsBar
          hintsUsed={hintsUsed}
          onAudioHint={handleAudioHint}
          onMeaningHint={handleMeaningHint}
          onLetterHint={handleLetterHint}
          targetWord={targetWord}
          gameStatus={gameStatus}
          isSpeaking={isSpeaking}
        />

        {/* Wordle Grid */}
        <section aria-label="Bảng đoán chữ" className="my-2 flex items-center justify-center">
          <WordleGrid
            wordLength={targetWord.length}
            maxAttempts={6}
            guesses={guesses}
            currentGuess={currentGuess}
            targetWord={targetWord.word}
            isShaking={isShaking}
            revealedPositions={revealedPositions}
          />
        </section>
      </main>

      {/* Virtual On-screen Keyboard */}
      <footer className="w-full max-w-lg mx-auto pb-2">
        <WordleKeyboard
          onKeyPress={handleAddLetter}
          onEnter={handleSubmitGuess}
          onBackspace={handleRemoveLetter}
          keyStatus={keyboardStatus}
          disabled={gameStatus !== "playing"}
        />
      </footer>

      {/* Modals & Dialogs */}
      <WordleResultDialog
        open={isResultOpen}
        onOpenChange={setIsResultOpen}
        status={gameStatus === "lost" ? "lost" : "won"}
        targetWord={targetWord}
        guesses={guesses}
        stars={starsEarned}
        hintsUsed={hintsUsed}
        onNextWord={handleNextWord}
        onPronounce={() => speak(targetWord.word)}
      />

      <WordleStatsModal
        open={isStatsOpen}
        onOpenChange={setIsStatsOpen}
        stats={stats}
      />

      <WordleGuideModal
        open={isGuideOpen}
        onOpenChange={setIsGuideOpen}
      />
    </div>
  );
}
