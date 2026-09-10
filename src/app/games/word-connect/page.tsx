"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useWordConnectGame } from "@/hooks/use-word-connect-game";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { useSpeech } from "@/hooks/useSpeech";
import { getTotalLevels } from "@/data/word-connect/levels";
import {
  playLetterClickSound,
  playTargetSolvedSound,
  playBonusSolvedSound,
  playErrorBuzzSound,
  playHintRevealSound,
  playLevelClearSound,
} from "@/lib/word-connect/sound";
import {
  WordConnectHeader,
  WordSlotsBoard,
  WordConnectControls,
  LetterWheel,
  BonusWordsModal,
  WordConnectGuideModal,
  WordConnectResultDialog,
} from "./components";

export default function WordConnectPage() {
  const totalLevels = getTotalLevels();

  const {
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
  } = useWordConnectGame();

  const { speak, cancel } = useSpeech();
  const { recordQuestion, submitSession, resetSession } = useGameTracking({
    gameType: "word-connect",
    topic: currentLevel.theme || "word-connect",
  });

  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [dismissedLevelIndex, setDismissedLevelIndex] = useState<number | null>(null);

  const prevCompletedRef = useRef(false);

  // Sync completion and trigger session tracking + fanfare
  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      playLevelClearSound();
      submitSession({
        score,
        totalQuestions: currentLevel.targetWords.length,
        topic: currentLevel.theme || "word-connect",
      });
    }
    prevCompletedRef.current = isCompleted;
  }, [isCompleted, currentLevel, score, submitSession]);

  const handleSelectLetter = useCallback(
    (index: number) => {
      selectLetter(index);
      playLetterClickSound(selectedLetters.length);
    },
    [selectLetter, selectedLetters.length]
  );

  const handleSubmit = useCallback(() => {
    if (!currentInput || currentInput.trim().length === 0) {
      return;
    }

    const result = submitWord();
    if (result.type === "target" && result.word) {
      playTargetSolvedSound();
      recordQuestion({
        prompt: result.word,
        selectedAnswer: result.word,
        correctAnswer: result.word,
        isCorrect: true,
      });
    } else if (result.type === "bonus") {
      playBonusSolvedSound();
    } else {
      playErrorBuzzSound();
    }
  }, [currentInput, submitWord, recordQuestion]);

  const handleApplyHint = useCallback(() => {
    const hint = applyHint();
    if (hint) {
      playHintRevealSound();
    }
  }, [applyHint]);

  const handleSpeakWord = useCallback(
    (word: string) => {
      cancel();
      speak(word);
    },
    [cancel, speak]
  );

  const handleNextLevel = useCallback(() => {
    setDismissedLevelIndex(null);
    resetSession();
    nextLevel();
  }, [nextLevel, resetSession]);

  const handleReplayLevel = useCallback(() => {
    setDismissedLevelIndex(null);
    resetSession();
    resetLevel();
  }, [resetLevel, resetSession]);

  const handleSelectLevel = useCallback(
    (idx: number) => {
      setDismissedLevelIndex(null);
      resetSession();
      selectLevel(idx);
    },
    [resetSession, selectLevel]
  );

  const isResultDialogOpen = isCompleted && dismissedLevelIndex !== levelIndex;

  // Physical keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard if modal dialogs are active
      if (guideModalOpen || bonusModalOpen || isResultDialogOpen) {
        return;
      }

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        removeLastLetter();
      } else if (e.key === "Escape") {
        e.preventDefault();
        clearSelection();
      } else if (e.key === " " && !e.repeat && activeEl?.tagName !== "BUTTON") {
        e.preventDefault();
        shuffle();
      } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        // Find first unselected matching letter tile
        const availableIndex = displayedLetters.findIndex(
          (letter, idx) => letter.toUpperCase() === char && !selectedLetters.includes(idx)
        );
        if (availableIndex !== -1) {
          e.preventDefault();
          handleSelectLetter(availableIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    bonusModalOpen,
    clearSelection,
    displayedLetters,
    guideModalOpen,
    handleSelectLetter,
    handleSubmit,
    isResultDialogOpen,
    removeLastLetter,
    selectedLetters,
    shuffle,
  ]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-between pb-8">
      {/* Header */}
      <WordConnectHeader
        levelNumber={currentLevel.levelNumber}
        totalLevels={totalLevels}
        difficulty={currentLevel.difficulty}
        theme={currentLevel.theme}
        score={score}
        onSelectLevel={handleSelectLevel}
        onOpenGuide={() => setGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-between px-3 py-2 gap-3 sm:gap-4">
        {/* Status Notification */}
        <div className="min-h-[28px] flex items-center justify-center">
          {statusMessage && (
            <div
              role="status"
              aria-live="polite"
              className="text-xs sm:text-sm font-bold text-center px-4 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm animate-in fade-in duration-200"
            >
              {statusMessage}
            </div>
          )}
        </div>

        {/* Word Slots Crossword Board */}
        <WordSlotsBoard
          targetWords={currentLevel.targetWords}
          solvedWords={solvedWords}
          revealedHints={revealedHints}
          onSpeakWord={handleSpeakWord}
        />

        {/* Controls Bar */}
        <WordConnectControls
          currentInput={currentInput}
          onShuffle={shuffle}
          onApplyHint={handleApplyHint}
          onClear={clearSelection}
          onBackspace={removeLastLetter}
          onSubmit={handleSubmit}
          bonusWordsCount={foundBonusWords.length}
          onOpenBonusModal={() => setBonusModalOpen(true)}
          errorShake={errorShake}
        />

        {/* Circular Letter Wheel (discrete click & continuous drag connection) */}
        <LetterWheel
          letters={displayedLetters}
          selectedLetters={selectedLetters}
          onSelectLetter={handleSelectLetter}
          onSubmit={handleSubmit}
          isShaking={errorShake}
        />
      </div>

      {/* Modals */}
      <BonusWordsModal
        open={bonusModalOpen}
        onOpenChange={setBonusModalOpen}
        foundBonusWords={foundBonusWords}
      />

      <WordConnectGuideModal
        open={guideModalOpen}
        onOpenChange={setGuideModalOpen}
      />

      <WordConnectResultDialog
        open={isResultDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDismissedLevelIndex(levelIndex);
          }
        }}
        levelNumber={currentLevel.levelNumber}
        totalLevels={totalLevels}
        score={score}
        targetWords={currentLevel.targetWords}
        foundBonusWords={foundBonusWords}
        hintsUsed={hintsUsedCount}
        onNextLevel={handleNextLevel}
        onReplayLevel={handleReplayLevel}
        onSpeakWord={handleSpeakWord}
      />
    </main>
  );
}
