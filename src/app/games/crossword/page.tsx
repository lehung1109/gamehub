"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCrosswordEngine } from "@/hooks/useCrosswordEngine";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { CrosswordGrid } from "@/components/game/crossword/CrosswordGrid";
import { CluePanel } from "@/components/game/crossword/CluePanel";
import { HintBar } from "@/components/game/crossword/HintBar";
import { VirtualKeyboard } from "@/components/game/crossword/VirtualKeyboard";
import { CrosswordCompletionModal } from "@/components/game/crossword/CrosswordCompletionModal";

const TOPICS = [
  { id: "animals", name: "🐾 Động vật (Animals)" },
  { id: "fruits", name: "🍎 Trái cây (Fruits)" },
  { id: "school", name: "🎒 Trường học (School)" },
];

const emptySubscribe = () => () => {};

export default function CrosswordPage() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
    topicId,
    board,
    selectedCell,
    direction,
    activeWord,
    score,
    hintsUsed,
    wordsRevealed,
    isComplete,
    elapsedSeconds,
    typeLetter,
    handleBackspace,
    toggleDirection,
    moveCursor,
    selectCell,
    selectClue,
    revealLetter,
    revealWord,
    loadNewPuzzle,
  } = useCrosswordEngine();

  const { submitSession, resetSession } = useGameTracking({
    gameType: "crossword",
  });
  const sessionSubmittedRef = useRef(false);

  // Keyboard navigation on physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes((e.target as HTMLElement)?.tagName)) return;

      if (/^[a-zA-Z]$/.test(e.key)) {
        typeLetter(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === " ") {
        e.preventDefault();
        toggleDirection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveCursor(-1, 0);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveCursor(1, 0);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveCursor(0, -1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveCursor(0, 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typeLetter, handleBackspace, toggleDirection, moveCursor, isComplete]);

  // Submit session on completion
  useEffect(() => {
    if (isComplete && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      const sessionDetails = board.words.map((w) => ({
        prompt: w.word,
        selectedAnswer: w.isSolved ? w.word : undefined,
        correctAnswer: w.word,
        isCorrect: w.isSolved,
        timeTakenMs: 0,
        attempts: w.isRevealed ? 2 : 1,
      }));

      submitSession({
        score,
        totalQuestions: board.words.length,
        topic: topicId,
        details: sessionDetails,
      }).catch((err) => console.error("Failed to submit crossword session:", err));

      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("gamehub_crossword_progress");
          const history = stored ? JSON.parse(stored) : [];
          history.push({
            date: new Date().toISOString(),
            score,
            topicId,
            elapsedSeconds,
            wordsCount: board.words.length,
          });
          localStorage.setItem("gamehub_crossword_progress", JSON.stringify(history.slice(-20)));
        }
      } catch (err) {
        console.error("Failed to save crossword progress:", err);
      }
    } else if (!isComplete) {
      sessionSubmittedRef.current = false;
    }
  }, [isComplete, score, board.words, topicId, elapsedSeconds, submitSession]);

  const handleNextPuzzle = () => {
    resetSession();
    loadNewPuzzle();
  };

  const maxScore = board.words.length * 100;
  const calculatedStars =
    hintsUsed === 0 && wordsRevealed === 0
      ? 3
      : score >= maxScore * 0.75 && hintsUsed <= 2 && wordsRevealed === 0
      ? 2
      : 1;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
        <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> GameHub
          </Link>
        </header>
        <div className="w-full max-w-lg aspect-square bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 font-bold text-base">
          Đang tải ô chữ...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> GameHub
        </Link>

        {/* Topic Selector */}
        <select
          value={topicId}
          onChange={(e) => loadNewPuzzle(e.target.value)}
          aria-label="Chọn chủ đề ô chữ"
          className="bg-slate-900 border border-slate-700 text-slate-200 text-base font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-amber-500"
        >
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-base font-mono font-bold text-slate-300">
            ⏱️ {Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:
            {(elapsedSeconds % 60).toString().padStart(2, "0")}
          </div>

          <div className="bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-base font-black text-amber-400">
            ⭐ {score} ĐIỂM
          </div>

          <button
            type="button"
            onClick={() => loadNewPuzzle()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            title="Tạo đề ô chữ mới"
            aria-label="Tạo đề ô chữ mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Left Column: Grid + Hints + Virtual Keyboard */}
        <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
          <CrosswordGrid
            board={board}
            selectedCell={selectedCell}
            direction={direction}
            activeWord={activeWord}
            onSelectCell={selectCell}
          />

          <HintBar
            activeWord={activeWord}
            onRevealLetter={revealLetter}
            onRevealWord={revealWord}
            disabled={isComplete}
          />

          <VirtualKeyboard
            onKeyPress={typeLetter}
            onBackspace={handleBackspace}
            onToggleDirection={toggleDirection}
            direction={direction}
          />
        </div>

        {/* Right Column: Clue Panel */}
        <div className="w-full lg:flex-1">
          <CluePanel
            words={board.words}
            activeWordId={activeWord?.id || ""}
            onSelectWord={selectClue}
          />
        </div>
      </main>

      {/* Completion Modal */}
      <CrosswordCompletionModal
        isOpen={isComplete}
        score={score}
        stars={calculatedStars}
        elapsedSeconds={elapsedSeconds}
        hintsUsed={hintsUsed}
        onNextPuzzle={handleNextPuzzle}
      />
    </div>
  );
}
